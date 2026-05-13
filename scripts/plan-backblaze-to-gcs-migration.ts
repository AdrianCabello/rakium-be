import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { PrismaClient } from '@prisma/client';

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
  sourceBucket?: string;
  targetBucket: string;
  assets: AssetReference[];
  skippedUrls: Array<{
    source: AssetSource;
    recordId: string;
    projectId?: string;
    url: string;
    reason: string;
  }>;
}

const prisma = new PrismaClient();

async function main() {
  const targetBucket = getRequiredEnv('GCS_BUCKET_NAME');
  const sourceBucket = process.env.BACKBLAZE_BUCKET_NAME;
  const outputPath = resolve(process.env.STORAGE_MIGRATION_MANIFEST_PATH ?? '.tmp/storage-migration/backblaze-to-gcs-manifest.json');

  const [galleryItems, projects] = await Promise.all([
    prisma.gallery.findMany({
      select: {
        id: true,
        projectId: true,
        url: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        imageBefore: true,
        imageAfter: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ]);

  const manifest: MigrationManifest = {
    generatedAt: new Date().toISOString(),
    sourceBucket,
    targetBucket,
    assets: [],
    skippedUrls: [],
  };

  const seen = new Set<string>();

  for (const item of galleryItems) {
    addAsset(manifest, seen, {
      source: 'gallery.url',
      recordId: item.id,
      projectId: item.projectId,
      currentUrl: item.url,
    });
  }

  for (const project of projects) {
    if (project.imageBefore) {
      addAsset(manifest, seen, {
        source: 'project.imageBefore',
        recordId: project.id,
        projectId: project.id,
        currentUrl: project.imageBefore,
      });
    }

    if (project.imageAfter) {
      addAsset(manifest, seen, {
        source: 'project.imageAfter',
        recordId: project.id,
        projectId: project.id,
        currentUrl: project.imageAfter,
      });
    }
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Storage migration manifest written to ${outputPath}`);
  console.log(`Assets ready to migrate: ${manifest.assets.length}`);
  console.log(`Skipped URLs: ${manifest.skippedUrls.length}`);
}

function addAsset(
  manifest: MigrationManifest,
  seen: Set<string>,
  input: Omit<AssetReference, 'objectKey' | 'targetUrl'>,
) {
  const objectKey = getBackblazeObjectKey(input.currentUrl, manifest.sourceBucket);

  if (!objectKey) {
    manifest.skippedUrls.push({
      source: input.source,
      recordId: input.recordId,
      projectId: input.projectId,
      url: input.currentUrl,
      reason: 'URL is not a recognized Backblaze object URL',
    });
    return;
  }

  const dedupeKey = `${input.source}:${input.recordId}:${objectKey}`;
  if (seen.has(dedupeKey)) {
    return;
  }
  seen.add(dedupeKey);

  manifest.assets.push({
    ...input,
    objectKey,
    targetUrl: `https://storage.googleapis.com/${manifest.targetBucket}/${objectKey}`,
  });
}

function getBackblazeObjectKey(rawUrl: string, sourceBucket?: string): string | null {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  const bucketHost = sourceBucket ? `${sourceBucket}.s3.` : '.s3.';

  if (url.hostname.includes(bucketHost)) {
    return path;
  }

  if (sourceBucket && path.startsWith(`${sourceBucket}/`)) {
    return path.slice(sourceBucket.length + 1);
  }

  if (url.hostname.endsWith('backblazeb2.com') && path.includes('/')) {
    return path;
  }

  return null;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
