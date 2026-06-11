import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targetClientId = process.env.TARGET_CLIENT_ID;
const apply = process.env.APPLY === 'true';

type OrphanProject = {
  id: string;
  name: string;
  clientId: string;
  order: number;
  status: string;
  createdAt: Date;
};

async function main() {
  if (!targetClientId) {
    throw new Error('TARGET_CLIENT_ID is required');
  }

  const targetClient = await prisma.client.findUnique({
    where: { id: targetClientId },
    select: { id: true, name: true, email: true },
  });

  if (!targetClient) {
    throw new Error(`Target client ${targetClientId} was not found`);
  }

  const orphanProjects = await prisma.$queryRaw<OrphanProject[]>`
    SELECT
      p.id,
      p.name,
      p.client_id AS "clientId",
      p."order",
      p.status,
      p.created_at AS "createdAt"
    FROM projects p
    LEFT JOIN "Client" c ON c.id = p.client_id
    WHERE c.id IS NULL
    ORDER BY p."order" ASC, p.created_at ASC
  `;

  const targetMaxOrder = await prisma.project.aggregate({
    where: { clientId: targetClientId },
    _max: { order: true },
  });

  const nextOrder = (targetMaxOrder._max.order ?? -1) + 1;
  const plannedUpdates = orphanProjects.map((project, index) => ({
    id: project.id,
    name: project.name,
    oldClientId: project.clientId,
    oldOrder: project.order,
    newClientId: targetClientId,
    newOrder: nextOrder + index,
  }));

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        targetClient,
        orphanCount: orphanProjects.length,
        plannedUpdates,
      },
      null,
      2,
    ),
  );

  if (!apply || plannedUpdates.length === 0) {
    return;
  }

  await prisma.$transaction(
    plannedUpdates.map((project) =>
      prisma.project.update({
        where: { id: project.id },
        data: {
          clientId: project.newClientId,
          order: project.newOrder,
        },
      }),
    ),
  );

  console.log(`Updated ${plannedUpdates.length} orphan project(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
