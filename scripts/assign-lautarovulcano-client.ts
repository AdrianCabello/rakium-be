/**
 * Asigna el clientId 8aa1986b-544c-41b2-b999-25256e483261 al proyecto
 * cuyo nombre contenga "lautaro" o "Lautaro Vulcano".
 * Ejecutar desde la raíz del backend: npx ts-node -r tsconfig-paths/register scripts/assign-lautarovulcano-client.ts
 */
import { PrismaClient } from '@prisma/client';

const CLIENT_ID = '8aa1986b-544c-41b2-b999-25256e483261';

async function main() {
  const prisma = new PrismaClient();
  const updated = await prisma.project.updateMany({
    where: {
      OR: [
        { name: { contains: 'lautaro', mode: 'insensitive' } },
        { name: { contains: 'Lautaro Vulcano', mode: 'insensitive' } },
      ],
    },
    data: { clientId: CLIENT_ID },
  });
  console.log('Proyectos actualizados:', updated.count);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
