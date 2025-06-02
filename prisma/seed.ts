import { PrismaClient, UserRole } from '@prisma/client';
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
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    
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
      role: admin.role 
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