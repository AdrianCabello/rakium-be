# Dokploy production runbook

This runbook is the checklist for moving Rakium BE from Railway to Dokploy without changing production until the new environment is verified.

## Scope

- Keep Railway running until Dokploy has passed smoke tests.
- Deploy the backend from the Dockerfile in this repository.
- Run Prisma migrations on container startup with `npm run start:docker`.
- Do not commit dumps, tokens, passwords, service account JSON, or production connection strings.

## Recommended Dokploy app

- App name: `rakium-be`
- Build type: Dockerfile
- Dockerfile path: `Dockerfile`
- Docker context: `.`
- Branch: `main` after the deployment PR is merged
- Internal port: `3000`
- Health check path: `/api`

## Required environment variables

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
JWT_SECRET=<generate-a-long-random-secret>
JWT_EXPIRATION=7d
PORT=3000
CORS_ORIGINS=https://rakium.dev,https://www.rakium.dev
```

## Storage mode

Keep Backblaze for the first Dokploy cutover unless we decide to switch storage in the same release:

```bash
STORAGE_PROVIDER=backblaze
BACKBLAZE_ACCESS_KEY_ID=<from-secret-manager>
BACKBLAZE_SECRET_ACCESS_KEY=<from-secret-manager>
BACKBLAZE_BUCKET_NAME=<bucket>
BACKBLAZE_ENDPOINT=<endpoint>
BACKBLAZE_REGION=<region>
```

When Google Cloud Storage is ready:

```bash
STORAGE_PROVIDER=gcs
GCS_BUCKET_NAME=<bucket>
GCS_PROJECT_ID=<project-id>
GCS_CLIENT_EMAIL=<service-account-email>
GCS_PRIVATE_KEY=<service-account-private-key-with-newlines-escaped>
GCS_PUBLIC_BASE_URL=https://storage.googleapis.com/<bucket>
```

## Preflight before first deploy

1. Confirm Railway is still serving production.
2. Create a fresh database backup.
3. Import the database into Dokploy Postgres using `DOKPLOY_DB_MIGRATION_RUNBOOK.md`.
4. Run the automated preflight:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=public' npm run dokploy:preflight
```

This checks table counts, duplicate project ordering per client, and storage environment completeness. The duplicate-order check is the blocker because the schema enforces a unique `(client_id, order)` index.

You can also run the SQL manually:

```sql
SELECT client_id, "order", COUNT(*)
FROM projects
GROUP BY client_id, "order"
HAVING COUNT(*) > 1;
```

If any rows are returned, fix the duplicate ordering before running the migration that creates the unique `(client_id, order)` index.

5. Add all Dokploy environment variables.
6. Deploy the app.
7. Run:

```bash
SMOKE_API_URL=https://<dokploy-api-domain>/api npm run smoke:api
```

Use `SMOKE_UPLOAD_FILE=./some-image.jpg` only after storage credentials are configured.

## Cutover

1. Keep Railway active.
2. Point the test frontend to the Dokploy API domain.
3. Validate login, public project pages, admin project list, and uploads.
4. Update production frontend API URL only after the smoke test passes.
5. Watch logs for the first deploy window.

## Rollback

1. Repoint frontend/API traffic to Railway.
2. If only storage changed, set `STORAGE_PROVIDER=backblaze` and redeploy.
3. If DB writes happened on Dokploy during the failed window, decide whether to replay them or restore the last Railway backup before switching traffic back.
4. Redeploy the previous known-good commit in Dokploy if the issue is code-related.

## Server actions still pending

No server action is done by this PR. Before touching Railway, Dokploy, DNS, or production env vars, announce the exact action and expected rollback path.
