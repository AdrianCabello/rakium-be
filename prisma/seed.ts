import { PrismaClient, UserRole, ProjectType, ProjectStatus, ProjectCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Verificar que DATABASE_URL esté definida
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida en las variables de entorno');
  process.exit(1);
}

console.log('Usando base de datos:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rakium.com' },
      update: {},
      create: {
        email: 'admin@rakium.com',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log('Usuario administrador creado:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Crear cliente de ejemplo
    const client = await prisma.client.upsert({
      where: { email: 'cliente@ejemplo.com' },
      update: {},
      create: {
        name: 'Cliente Ejemplo',
        email: 'cliente@ejemplo.com',
      },
    });

    console.log('Cliente de ejemplo creado:', {
      id: client.id,
      name: client.name,
      email: client.email,
    });

    // Crear usuario del cliente
    const clientUserPassword = await bcrypt.hash('cliente123', 10);
    const clientUser = await prisma.user.upsert({
      where: { email: 'usuario@cliente.com' },
      update: {},
      create: {
        email: 'usuario@cliente.com',
        passwordHash: clientUserPassword,
        role: UserRole.CLIENT,
        clientId: client.id,
      },
    });

    console.log('Usuario del cliente creado:', {
      id: clientUser.id,
      email: clientUser.email,
      role: clientUser.role,
      clientId: clientUser.clientId,
    });

    // Crear proyecto de ejemplo
    const project = await prisma.project.create({
      data: {
        name: 'Proyecto Ejemplo',
        type: ProjectType.LANDING,
        status: ProjectStatus.DRAFT,
        category: ProjectCategory.ESTACIONES,
        description: 'Descripción corta del proyecto',
        longDescription: 'Descripción detallada del proyecto',
        latitude: 19.4326,
        longitude: -99.1332,
        address: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
        country: 'México',
        state: 'Ciudad de México',
        city: 'Benito Juárez',
        area: '500m²',
        duration: '3 meses',
        date: '2024-03-15',
        clientId: client.id,
        challenge: 'Mantener operaciones durante la remodelación',
        solution: 'Trabajo por fases y horarios especiales',
        showOnHomepage: true,
        createdBy: admin.id,
      },
    });

    console.log('Proyecto de ejemplo creado:', {
      id: project.id,
      name: project.name,
      type: project.type,
      status: project.status,
      category: project.category,
    });

  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 