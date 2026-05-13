import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Prisma, PrismaClient } from '@prisma/client';

type AssetSource = 'gallery.url' | 'project.imageBefore' | 'project.imageAfter';

interface AssetReference {
  source: AssetSource;
  recordId: string;
  projectId?: string;
  currentUrl: string;
  objectKey: string;
  targetUrl: string;
}

interface MigrationManifest {
  generatedAt: string;
  assets: AssetReference[];
}

const prisma = new PrismaClient();

async function main() {
  const manifestPath = resolve(
    process.env.STORAGE_MIGRATION_MANIFEST_PATH ?? '.tmp/storage-migration/backblaze-to-gcs-manifest.json',
  );
  const apply = process.env.STORAGE_MIGRATION_APPLY === 'true';
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as MigrationManifest;
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  for (const asset of manifest.assets) {
    if (asset.currentUrl === asset.targetUrl) {
      continue;
    }

    if (asset.source === 'gallery.url') {
      operations.push(
        prisma.gallery.updateMany({
          where: {
            id: asset.recordId,
            url: asset.currentUrl,
          },
          data: {
            url: asset.targetUrl,
          },
        }),
      );
    }

    if (asset.source === 'project.imageBefore') {
      operations.push(
        prisma.project.updateMany({
          where: {
            id: asset.recordId,
            imageBefore: asset.currentUrl,
          },
          data: {
            imageBefore: asset.targetUrl,
          },
        }),
      );
    }

    if (asset.source === 'project.imageAfter') {
      operations.push(
        prisma.project.updateMany({
          where: {
            id: asset.recordId,
            imageAfter: asset.currentUrl,
          },
          data: {
            imageAfter: asset.targetUrl,
          },
        }),
      );
    }
  }

  console.log(`Manifest: ${manifestPath}`);
  console.log(`Generated at: ${manifest.generatedAt}`);
  console.log(`Assets in manifest: ${manifest.assets.length}`);
  console.log(`Pending DB rewrite operations: ${operations.length}`);

  if (!apply) {
    console.log('Dry run only. Set STORAGE_MIGRATION_APPLY=true to rewrite database URLs.');
    return;
  }

  if (operations.length === 0) {
    console.log('No URL rewrites needed.');
    return;
  }

  const results = await prisma.$transaction(operations);
  const changedRows = results.reduce<number>((total, result) => {
    const count = typeof result === 'object' && result && 'count' in result ? Number(result.count) : 0;
    return total + count;
  }, 0);

  console.log(`Database URLs rewritten: ${changedRows}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
