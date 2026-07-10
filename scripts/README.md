# Database and QA scripts

Useful scripts for Dokploy database maintenance and backend smoke testing.

## Requirements

- PostgreSQL client (`psql`) or Docker.
- Node.js 18+ for the API smoke script.

## `import-dump-to-dokploy.sh`

Imports a SQL dump into a Dokploy database.

Usage:

```bash
./scripts/import-dump-to-dokploy.sh ./dumps/production-dump-YYYYMMDD-HHMMSS.sql 'postgresql://USER:PASSWORD@HOST:5432/DB?schema=public'
```

This can overwrite data in the destination database. Use it only after a backup and an explicit confirmation.

## Recommended DB maintenance flow

1. Create or fetch the SQL dump through a secure channel.
2. Create or confirm the Dokploy Postgres database.
3. Import the dump with `import-dump-to-dokploy.sh` or `import-dump-via-dokploy.sh`.
4. Verify table counts.
5. Configure the backend app with the current `DATABASE_URL`.
6. Run `npx prisma migrate deploy`.
7. Run the API smoke test.

## `smoke-api.ts`

Runs an end-to-end smoke test against an already running API:

```bash
SMOKE_API_URL=http://localhost:3000/api npm run smoke:api
```

Useful variables:

```bash
SMOKE_ADMIN_EMAIL=admin@rakium.com
SMOKE_ADMIN_PASSWORD=admin123
SMOKE_CLIENT_ID=98280818-e80a-4305-a887-a74a3a6c2ecb
SMOKE_PROJECT_ID=8381ce2d-084d-44e4-a2c0-9ca2d951a12a
SMOKE_UPLOAD_FILE=./path/to/image.jpg
```

The smoke test validates login, `auth/me`, private project permissions, public project routes, and upload auth. The authenticated upload is skipped unless `SMOKE_UPLOAD_FILE` is set.

## `dokploy-preflight.ts`

Runs preflight checks against the database that will be used by Dokploy:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=public' npm run dokploy:preflight
```

It prints table counts, fails on duplicate `(client_id, order)` project values, and warns when storage env vars for the selected `STORAGE_PROVIDER` are missing.

## `rewrite-storage-urls-to-gcs.ts`

Uses the Backblaze to GCS manifest to rewrite database URLs after objects have been copied and validated.

Dry run:

```bash
npm run storage:rewrite-gcs-urls
```

Apply:

```bash
STORAGE_MIGRATION_APPLY=true npm run storage:rewrite-gcs-urls
```

The script updates rows only when the current database URL still matches the manifest `currentUrl`.
