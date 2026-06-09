import {
  FinanceAccountType,
  FinanceTransactionType,
  PrismaClient,
  ProjectCategory,
  ProjectStatus,
  ProjectType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CLIENT_ID = '002a5177-2d27-4c0b-936d-dbb2d317663a';
const CLIENT_EMAIL = process.env.ADRIAN_CLIENT_EMAIL ?? 'adrian@adriancabello.dev';
const USER_EMAIL = process.env.ADRIAN_DASHBOARD_EMAIL ?? CLIENT_EMAIL;
const USER_PASSWORD = process.env.ADRIAN_DASHBOARD_PASSWORD ?? 'adrian123';

async function upsertProject(input: {
  name: string;
  description: string;
  url: string;
  technologies: string[];
  images: string[];
  order: number;
}) {
  const existing = await prisma.project.findFirst({
    where: { clientId: CLIENT_ID, name: input.name },
    include: { gallery: true },
  });

  const data = {
    name: input.name,
    type: ProjectType.PORTFOLIO,
    status: ProjectStatus.PUBLISHED,
    category: ProjectCategory.SITIO_WEB,
    description: input.description,
    longDescription: input.description,
    url: input.url,
    demoUrl: input.url,
    technologies: input.technologies,
    order: input.order,
    clientId: CLIENT_ID,
  };

  const project = existing
    ? await prisma.project.update({ where: { id: existing.id }, data })
    : await prisma.project.create({ data });

  for (const [index, url] of input.images.entries()) {
    const galleryItem = await prisma.gallery.findFirst({
      where: { projectId: project.id, url },
    });

    if (galleryItem) {
      await prisma.gallery.update({
        where: { id: galleryItem.id },
        data: { order: index, title: input.name },
      });
      continue;
    }

    await prisma.gallery.create({
      data: {
        projectId: project.id,
        url,
        order: index,
        title: input.name,
      },
    });
  }

  const cover = await prisma.gallery.findFirst({
    where: { projectId: project.id },
    orderBy: { order: 'asc' },
  });

  if (cover) {
    await prisma.project.update({
      where: { id: project.id },
      data: { coverImageId: cover.id },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(USER_PASSWORD, 10);

  await prisma.client.upsert({
    where: { id: CLIENT_ID },
    update: {
      name: 'Adrian Cabello',
      email: CLIENT_EMAIL,
    },
    create: {
      id: CLIENT_ID,
      name: 'Adrian Cabello',
      email: CLIENT_EMAIL,
    },
  });

  await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      passwordHash,
      role: UserRole.CLIENT_ADMIN,
      clientId: CLIENT_ID,
    },
    create: {
      email: USER_EMAIL,
      passwordHash,
      role: UserRole.CLIENT_ADMIN,
      clientId: CLIENT_ID,
    },
  });

  const areas = [
    { name: 'Carrera', color: '#22c55e', icon: 'code', order: 1 },
    { name: 'Finanzas', color: '#38bdf8', icon: 'wallet', order: 2 },
    { name: 'Vida diaria', color: '#f59e0b', icon: 'calendar', order: 3 },
    { name: 'Aprendizaje', color: '#a855f7', icon: 'book-open', order: 4 },
  ];

  for (const area of areas) {
    await prisma.lifeArea.upsert({
      where: {
        unique_life_area_per_client: {
          clientId: CLIENT_ID,
          name: area.name,
        },
      },
      update: area,
      create: { ...area, clientId: CLIENT_ID },
    });
  }

  await prisma.financeAccount.upsert({
    where: {
      unique_finance_account_per_client: {
        clientId: CLIENT_ID,
        name: 'Cuenta principal',
      },
    },
    update: {},
    create: {
      clientId: CLIENT_ID,
      name: 'Cuenta principal',
      type: FinanceAccountType.DIGITAL_WALLET,
      currency: 'ARS',
    },
  });

  const categories = [
    { name: 'Clientes', type: FinanceTransactionType.INCOME, color: '#22c55e' },
    { name: 'Herramientas', type: FinanceTransactionType.EXPENSE, color: '#38bdf8', monthlyBudget: 50000 },
    { name: 'Comida', type: FinanceTransactionType.EXPENSE, color: '#f97316', monthlyBudget: 180000 },
    { name: 'Transporte', type: FinanceTransactionType.EXPENSE, color: '#eab308', monthlyBudget: 60000 },
    { name: 'Aprendizaje', type: FinanceTransactionType.EXPENSE, color: '#a855f7', monthlyBudget: 40000 },
    { name: 'Ocio', type: FinanceTransactionType.EXPENSE, color: '#ec4899', monthlyBudget: 60000 },
  ];

  for (const category of categories) {
    await prisma.financeCategory.upsert({
      where: {
        unique_finance_category_per_client: {
          clientId: CLIENT_ID,
          name: category.name,
          type: category.type,
        },
      },
      update: category,
      create: { ...category, clientId: CLIENT_ID },
    });
  }

  await upsertProject({
    name: 'Lautaro Vulcano',
    description:
      'Personal portfolio for Lautaro Vulcano, a graphic designer specialized in visual content for social media, branding, event flyers, and informative websites.',
    url: 'https://lautarovulcano.com',
    technologies: ['Angular', 'TypeScript', 'Tailwind CSS'],
    images: [
      'https://adriancabello.dev/assets/images/lautarovulcano.png',
      'https://adriancabello.dev/assets/images/lautarovulcano-2.png',
      'https://adriancabello.dev/assets/images/lautarovulcano-3.png',
    ],
    order: 1,
  });

  await upsertProject({
    name: 'Eventloop',
    description:
      'EventLoop is a self-managed platform designed to simplify event organization from event publishing to ticket sales, with full control and continuous support.',
    url: 'https://eventloop.club',
    technologies: ['Angular 19', 'Tailwind', 'Go', 'PostgreSQL'],
    images: [
      'https://adriancabello.dev/assets/images/eventloop.png',
      'https://adriancabello.dev/assets/images/eventloop-2.png',
      'https://adriancabello.dev/assets/images/eventloop-3.png',
    ],
    order: 2,
  });

  console.log('Adrian MVP seed listo:', {
    clientId: CLIENT_ID,
    email: USER_EMAIL,
    password: process.env.ADRIAN_DASHBOARD_PASSWORD ? '<from env>' : USER_PASSWORD,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
