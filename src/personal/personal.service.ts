import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FinanceTransactionType, PersonalTaskStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFinanceAccountDto,
  CreateFinanceCategoryDto,
  CreateFinanceTransactionDto,
  CreatePersonalNoteDto,
  CreatePersonalTaskDto,
  UpdatePersonalNoteDto,
  UpdatePersonalTaskDto,
} from './dto/personal.dto';

type AuthUser = {
  id: string;
  email: string;
  role: string;
  clientId?: string | null;
};

@Injectable()
export class PersonalService {
  constructor(private prisma: PrismaService) {}

  private getClientId(user: AuthUser): string {
    if (!user.clientId) {
      throw new ForbiddenException('El usuario autenticado no tiene cliente asociado');
    }
    return user.clientId;
  }

  async bootstrap(user: AuthUser) {
    const clientId = this.getClientId(user);

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }

    const [areas, accounts, categories] = await Promise.all([
      this.prisma.lifeArea.findMany({ where: { clientId, archivedAt: null }, orderBy: { order: 'asc' } }),
      this.prisma.financeAccount.findMany({ where: { clientId, active: true }, orderBy: { createdAt: 'asc' } }),
      this.prisma.financeCategory.findMany({ where: { clientId }, orderBy: { name: 'asc' } }),
    ]);

    return { client, areas, accounts, categories };
  }

  async summary(user: AuthUser) {
    const clientId = this.getClientId(user);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      todayTasks,
      overdueTasks,
      openTasksCount,
      pinnedNotes,
      monthIncome,
      monthExpenses,
      recentTransactions,
      projects,
    ] = await Promise.all([
      this.prisma.personalTask.findMany({
        where: {
          clientId,
          status: { not: PersonalTaskStatus.DONE },
          OR: [
            { scheduledDate: { gte: startOfToday, lt: endOfToday } },
            { dueDate: { gte: startOfToday, lt: endOfToday } },
          ],
        },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
        take: 8,
        include: { area: true },
      }),
      this.prisma.personalTask.findMany({
        where: {
          clientId,
          status: { not: PersonalTaskStatus.DONE },
          dueDate: { lt: startOfToday },
        },
        orderBy: { dueDate: 'asc' },
        take: 8,
        include: { area: true },
      }),
      this.prisma.personalTask.count({
        where: { clientId, status: { in: [PersonalTaskStatus.TODO, PersonalTaskStatus.IN_PROGRESS] } },
      }),
      this.prisma.personalNote.findMany({
        where: { clientId, archivedAt: null, pinned: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.financeTransaction.aggregate({
        where: {
          clientId,
          type: FinanceTransactionType.INCOME,
          date: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.financeTransaction.aggregate({
        where: {
          clientId,
          type: FinanceTransactionType.EXPENSE,
          date: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.financeTransaction.findMany({
        where: { clientId },
        orderBy: { date: 'desc' },
        take: 6,
        include: { account: true, category: true },
      }),
      this.prisma.project.findMany({
        where: { clientId },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 6,
        include: { gallery: { orderBy: { order: 'asc' }, take: 3 }, coverImage: true },
      }),
    ]);

    const income = Number(monthIncome._sum.amount ?? 0);
    const expenses = Number(monthExpenses._sum.amount ?? 0);

    return {
      tasks: {
        today: todayTasks,
        overdue: overdueTasks,
        openCount: openTasksCount,
      },
      notes: {
        pinned: pinnedNotes,
      },
      finance: {
        monthIncome: income,
        monthExpenses: expenses,
        monthBalance: income - expenses,
        recentTransactions,
      },
      projects,
    };
  }

  async listTasks(user: AuthUser, status?: PersonalTaskStatus) {
    const clientId = this.getClientId(user);
    return this.prisma.personalTask.findMany({
      where: {
        clientId,
        ...(status ? { status } : {}),
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: { area: true },
    });
  }

  async createTask(user: AuthUser, dto: CreatePersonalTaskDto) {
    const clientId = this.getClientId(user);
    await this.ensureAreaBelongsToClient(dto.areaId, clientId);

    return this.prisma.personalTask.create({
      data: {
        clientId,
        areaId: dto.areaId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        estimatedMinutes: dto.estimatedMinutes,
      },
      include: { area: true },
    });
  }

  async updateTask(user: AuthUser, id: string, dto: UpdatePersonalTaskDto) {
    const clientId = this.getClientId(user);
    await this.ensureTaskBelongsToClient(id, clientId);
    await this.ensureAreaBelongsToClient(dto.areaId, clientId);

    return this.prisma.personalTask.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        completedAt: dto.status === PersonalTaskStatus.DONE ? new Date() : undefined,
        estimatedMinutes: dto.estimatedMinutes,
        areaId: dto.areaId,
      },
      include: { area: true },
    });
  }

  async listNotes(user: AuthUser) {
    const clientId = this.getClientId(user);
    return this.prisma.personalNote.findMany({
      where: { clientId, archivedAt: null },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { area: true },
    });
  }

  async createNote(user: AuthUser, dto: CreatePersonalNoteDto) {
    const clientId = this.getClientId(user);
    await this.ensureAreaBelongsToClient(dto.areaId, clientId);

    return this.prisma.personalNote.create({
      data: {
        clientId,
        areaId: dto.areaId,
        title: dto.title,
        content: dto.content,
        type: dto.type,
        pinned: dto.pinned,
      },
      include: { area: true },
    });
  }

  async updateNote(user: AuthUser, id: string, dto: UpdatePersonalNoteDto) {
    const clientId = this.getClientId(user);
    await this.ensureNoteBelongsToClient(id, clientId);
    await this.ensureAreaBelongsToClient(dto.areaId, clientId);

    return this.prisma.personalNote.update({
      where: { id },
      data: {
        areaId: dto.areaId,
        title: dto.title,
        content: dto.content,
        type: dto.type,
        pinned: dto.pinned,
      },
      include: { area: true },
    });
  }

  async listFinance(user: AuthUser) {
    const clientId = this.getClientId(user);
    const [accounts, categories, transactions] = await Promise.all([
      this.prisma.financeAccount.findMany({ where: { clientId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.financeCategory.findMany({ where: { clientId }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
      this.prisma.financeTransaction.findMany({
        where: { clientId },
        orderBy: { date: 'desc' },
        take: 50,
        include: { account: true, category: true },
      }),
    ]);

    return { accounts, categories, transactions };
  }

  async createFinanceAccount(user: AuthUser, dto: CreateFinanceAccountDto) {
    const clientId = this.getClientId(user);
    return this.prisma.financeAccount.create({
      data: {
        clientId,
        name: dto.name,
        type: dto.type,
        currency: dto.currency,
        initialBalance: new Prisma.Decimal(dto.initialBalance ?? 0),
      },
    });
  }

  async createFinanceCategory(user: AuthUser, dto: CreateFinanceCategoryDto) {
    const clientId = this.getClientId(user);
    return this.prisma.financeCategory.create({
      data: {
        clientId,
        name: dto.name,
        type: dto.type,
        color: dto.color,
        monthlyBudget: dto.monthlyBudget === undefined ? undefined : new Prisma.Decimal(dto.monthlyBudget),
      },
    });
  }

  async createFinanceTransaction(user: AuthUser, dto: CreateFinanceTransactionDto) {
    const clientId = this.getClientId(user);
    await this.ensureAccountBelongsToClient(dto.accountId, clientId);
    await this.ensureCategoryBelongsToClient(dto.categoryId, clientId);

    return this.prisma.financeTransaction.create({
      data: {
        clientId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency,
        date: dto.date ? new Date(dto.date) : undefined,
        description: dto.description,
        merchant: dto.merchant,
      },
      include: { account: true, category: true },
    });
  }

  private async ensureAreaBelongsToClient(areaId: string | undefined, clientId: string) {
    if (!areaId) return;
    const area = await this.prisma.lifeArea.findFirst({ where: { id: areaId, clientId }, select: { id: true } });
    if (!area) throw new NotFoundException('Area no encontrada para este cliente');
  }

  private async ensureTaskBelongsToClient(id: string, clientId: string) {
    const task = await this.prisma.personalTask.findFirst({ where: { id, clientId }, select: { id: true } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
  }

  private async ensureNoteBelongsToClient(id: string, clientId: string) {
    const note = await this.prisma.personalNote.findFirst({ where: { id, clientId }, select: { id: true } });
    if (!note) throw new NotFoundException('Nota no encontrada');
  }

  private async ensureAccountBelongsToClient(accountId: string | undefined, clientId: string) {
    if (!accountId) return;
    const account = await this.prisma.financeAccount.findFirst({ where: { id: accountId, clientId }, select: { id: true } });
    if (!account) throw new NotFoundException('Cuenta no encontrada para este cliente');
  }

  private async ensureCategoryBelongsToClient(categoryId: string | undefined, clientId: string) {
    if (!categoryId) return;
    const category = await this.prisma.financeCategory.findFirst({ where: { id: categoryId, clientId }, select: { id: true } });
    if (!category) throw new NotFoundException('Categoria no encontrada para este cliente');
  }
}
