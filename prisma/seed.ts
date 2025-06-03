import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { ProjectType, ProjectStatus } from '../src/dto/create-project.dto';

// Verificar que DATABASE_URL esté definida
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida en las variables de entorno');
  process.exit(1);
}

console.log('Usando base de datos:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear usuario admin
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rakium.com' },
      update: {},
      create: {
        email: 'admin@rakium.com',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'Rakium',
      },
    });

    console.log('Usuario administrador creado:', { 
      id: admin.id,
      email: admin.email,
      role: admin.role 
    });

    // Crear cliente de ejemplo
    const client = await prisma.client.upsert({
      where: { name: 'Cliente Ejemplo' },
      update: {},
      create: {
        name: 'Cliente Ejemplo',
        description: 'Cliente de ejemplo para pruebas',
        logo: 'https://ejemplo.com/logo.png',
        website: 'https://ejemplo.com',
        industry: 'Tecnología',
        foundedYear: 2020,
        headquarters: 'Ciudad de México',
        createdById: admin.id,
      },
    });

    console.log('Cliente de ejemplo creado:', {
      id: client.id,
      name: client.name,
      description: client.description,
      logo: client.logo,
      website: client.website,
      industry: client.industry,
      foundedYear: client.foundedYear,
      headquarters: client.headquarters
    });

    // Crear usuario del cliente
    const clientUserPassword = await hash('client123', 10);
    const clientUser = await prisma.user.upsert({
      where: { email: 'cliente@ejemplo.com' },
      update: {},
      create: {
        email: 'cliente@ejemplo.com',
        password: clientUserPassword,
        role: 'CLIENT',
        firstName: 'Usuario',
        lastName: 'Cliente',
        clientId: client.id,
      },
    });

    console.log('Usuario cliente creado:', {
      id: clientUser.id,
      email: clientUser.email,
      role: clientUser.role
    });

    // Crear proyecto de ejemplo
    const project = await prisma.project.upsert({
      where: { name: 'Proyecto Ejemplo' },
      update: {},
    const project = await prisma.project.create({
      data: {
        name: 'Proyecto de Ejemplo',
        type: ProjectType.LANDING,
        category: ProjectCategory.ESTACIONES,
        description: 'Descripción corta del proyecto',
        longDescription: 'Descripción detallada del proyecto de ejemplo',
        imageBefore: 'https://ejemplo.com/antes.jpg',
        imageAfter: 'https://ejemplo.com/despues.jpg',
        latitude: 19.4326,
        longitude: -99.1332,
        address: 'Av. Ejemplo 123',
        country: 'México',
        state: 'Ciudad de México',
        city: 'CDMX',
        area: '1000 m²',
        duration: '3 meses',
        date: '2024-02-06',
        challenge: 'Desafío del proyecto',
        solution: 'Solución implementada',
        showOnHomepage: true,
        clientId: client.id,
        createdBy: admin.id,
        gallery: {
          create: [
            {
              url: 'https://ejemplo.com/galeria1.jpg',
              title: 'Imagen 1',
              description: 'Descripción de la imagen 1',
              order: 1
            },
            {
              url: 'https://ejemplo.com/galeria2.jpg',
              title: 'Imagen 2',
              description: 'Descripción de la imagen 2',
              order: 2
            }
          ]
        }
      }
    });

    console.log('Proyecto de ejemplo creado:', {
      id: project.id,
      name: project.name,
      type: project.type,
      category: project.category
    });

  } catch (error) {
    console.error('Error durante el seed:', error);
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