import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { getPaginationParams, createPaginatedResponse, buildUserSearchFilter } from '../utils/pagination.util';
import * as bcrypt from 'bcrypt';
import { publicUserSelect, userSummarySelect, userWithPasswordSelect } from './user.select';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
        clientId: createUserDto.clientId,
      },
      select: publicUserSelect,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildUserSearchFilter(paginationDto.search);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: searchFilter,
        select: publicUserSelect,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.user.count({
        where: searchFilter,
      }),
    ]);

    return createPaginatedResponse(users, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        projects: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.findByEmailWithPassword(email);
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  private async findByEmailWithPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userWithPasswordSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
