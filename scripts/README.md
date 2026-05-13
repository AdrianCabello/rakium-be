# Database and QA scripts

Useful scripts for Railway to Dokploy database migration and backend smoke testing.

## Requirements

- PostgreSQL client (`pg_dump` and `psql`) or Docker.
- Node.js 18+ for the API smoke script.

## `dump-railway-db.sh`

Creates a full dump from Railway.

Usage:

```bash
RAILWAY_DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DB' ./scripts/dump-railway-db.sh
```

What it does:

- Reads the Railway connection string from `RAILWAY_DATABASE_URL`, falling back to `DATABASE_URL`.
- Creates a SQL file with schema and data.
- Writes it to `./dumps/railway-dump-YYYYMMDD-HHMMSS.sql`.

Do not hardcode credentials in this script or in this document.

## `import-dump-to-dokploy.sh`

Imports a SQL dump into a Dokploy database.

Usage:

```bash
./scripts/import-dump-to-dokploy.sh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql 'postgresql://USER:PASSWORD@HOST:5432/DB?schema=public'
```

This can overwrite data in the destination database. Use it only after a backup and an explicit confirmation.

## Complete DB migration flow

1. Export from Railway with `dump-railway-db.sh`.
2. Create the Dokploy Postgres database.
3. Import the dump with `import-dump-to-dokploy.sh` or the internal-network flow in `DOKPLOY_DB_MIGRATION_RUNBOOK.md`.
4. Verify table counts.
5. Configure the backend app with the new `DATABASE_URL`.
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
