import { PrismaClient } from '@prisma/client';

type DuplicateProjectOrder = {
  client_id: string;
  order: number;
  count: bigint;
};

type CountRow = {
  label: string;
  count: bigint;
};

const prisma = new PrismaClient();

async function main() {
  console.log('Dokploy preflight checks');

  const counts = await prisma.$queryRaw<CountRow[]>`
    SELECT 'clients' AS label, COUNT(*)::bigint AS count FROM "Client"
    UNION ALL
    SELECT 'users' AS label, COUNT(*)::bigint AS count FROM "User"
    UNION ALL
    SELECT 'projects' AS label, COUNT(*)::bigint AS count FROM projects
    UNION ALL
    SELECT 'gallery' AS label, COUNT(*)::bigint AS count FROM "Gallery"
    UNION ALL
    SELECT 'videos' AS label, COUNT(*)::bigint AS count FROM "Video"
  `;

  for (const row of counts) {
    console.log(`- ${row.label}: ${row.count.toString()}`);
  }

  const duplicateOrders = await prisma.$queryRaw<DuplicateProjectOrder[]>`
    SELECT client_id, "order", COUNT(*)::bigint AS count
    FROM projects
    GROUP BY client_id, "order"
    HAVING COUNT(*) > 1
    ORDER BY client_id, "order"
  `;

  if (duplicateOrders.length > 0) {
    console.error('');
    console.error('BLOCKER: duplicate project order values found per client.');
    for (const row of duplicateOrders) {
      console.error(`- client_id=${row.client_id} order=${row.order} count=${row.count.toString()}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('- duplicate project order values: none');

  const storageProvider = process.env.STORAGE_PROVIDER || 'backblaze';
  console.log(`- STORAGE_PROVIDER: ${storageProvider}`);

  if (storageProvider === 'gcs' || storageProvider === 'google-cloud-storage') {
    requireEnv(['GCS_BUCKET_NAME']);
    requireAnyEnv(['GCS_SERVICE_ACCOUNT_JSON', 'GOOGLE_APPLICATION_CREDENTIALS']);
  } else {
    requireEnv(['BACKBLAZE_ACCESS_KEY_ID', 'BACKBLAZE_SECRET_ACCESS_KEY', 'BACKBLAZE_BUCKET_NAME']);
  }

  console.log('Preflight completed.');
}

function requireEnv(names: string[]) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.warn(`- storage env warning: missing ${missing.join(', ')}`);
    return;
  }

  console.log('- storage env variables: present');
}

function requireAnyEnv(names: string[]) {
  if (names.some((name) => process.env[name])) {
    console.log(`- storage auth env variable: present (${names.join(' or ')})`);
    return;
  }

  console.warn(`- storage env warning: missing one of ${names.join(', ')}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
