# Rakium BE Dokploy Cutover Checklist

Use this checklist when moving production traffic from Railway to Dokploy. Do not paste real secrets, database URLs, dumps, or service account JSON into this file, PRs, or ClickUp.

## Current Assumption

- Railway remains the live production backend until this checklist is completed.
- Dokploy is the target backend runtime.
- PostgreSQL is the production database engine.
- Backblaze remains the storage provider for the first backend cutover unless storage cutover is explicitly approved.

## Pre-Cutover

1. Confirm Railway is healthy at the current production API URL.
2. Confirm the Dokploy app exists with:
   - App name: `rakium-be`
   - Build type: Dockerfile
   - Dockerfile path: `Dockerfile`
   - Docker context: `.`
   - Internal port: `3000`
   - Health check path: `/api`
3. Configure Dokploy environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRATION`
   - `PORT=3000`
   - `CORS_ORIGINS`
   - `STORAGE_PROVIDER=backblaze`
   - `BACKBLAZE_ACCESS_KEY_ID`
   - `BACKBLAZE_SECRET_ACCESS_KEY`
   - `BACKBLAZE_BUCKET_NAME`
4. Create a fresh Railway database backup.
5. Import the backup into Dokploy Postgres using `DOKPLOY_DB_MIGRATION_RUNBOOK.md`.
6. Run the database preflight against Dokploy Postgres:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=public' npm run dokploy:preflight
```

7. If duplicate `(client_id, order)` rows are reported, fix them before deploying.
8. Deploy the Dokploy app from the approved branch.
9. Run smoke tests against the Dokploy API:

```bash
SMOKE_API_URL=https://<dokploy-api-domain>/api npm run smoke:api
```

## Manual QA

1. Login works from the admin frontend.
2. Public project pages load.
3. Admin project list loads.
4. Client project pages load.
5. Existing gallery images load from Backblaze.
6. Upload a test image only after Backblaze env vars are confirmed.
7. Check Dokploy logs for startup migration output and runtime errors.

## Traffic Cutover

1. Keep Railway active.
2. Point a test frontend/API configuration to the Dokploy API domain.
3. Re-run smoke and manual QA.
4. Update production frontend API URL only after QA passes.
5. Watch Dokploy logs during the first production window.

## Rollback

1. Repoint frontend/API traffic to Railway.
2. Keep Backblaze as storage by leaving `STORAGE_PROVIDER=backblaze`.
3. If writes happened on Dokploy during the failed window, decide whether to replay them or restore Railway data before switching back.
4. Redeploy the previous known-good backend commit if the issue is code-related.

## Separate Storage Cutover

Backblaze to GCS is a separate operation. Use `STORAGE_MIGRATION_BACKBLAZE_TO_GCS.md` only after the backend cutover is stable.
