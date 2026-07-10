# Dokploy production runbook

This runbook documents the current Rakium BE production setup on Dokploy.

## Scope

- Production API domain: `https://api.rakium.dev`
- Backend app: `rakium-be`
- Build type: Dockerfile
- Dockerfile path: `Dockerfile`
- Docker context: `.`
- Branch: `main`
- Internal port: `3000`
- Health check path: `/api`

## Runtime

The Docker image starts with:

```bash
npm run start:docker
```

That command runs Prisma migrations before starting the compiled Nest API:

```bash
prisma migrate deploy && node dist/src/main
```

## Required Environment Variables

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
JWT_SECRET=<long-random-secret>
JWT_EXPIRATION=7d
PORT=3000
CORS_ORIGINS=https://rakium.dev,https://www.rakium.dev
PUBLIC_API_URL=https://api.rakium.dev/api
```

## Optional Instagram Messaging Variables

```bash
META_WEBHOOK_VERIFY_TOKEN=<same-token-used-in-meta-webhook-config>
META_APP_SECRET=<meta-app-secret>
```

Webhook URL:

```text
https://api.rakium.dev/api/integrations/instagram/webhook
```

## Storage

Backblaze:

```bash
STORAGE_PROVIDER=backblaze
BACKBLAZE_ACCESS_KEY_ID=<from-secret-manager>
BACKBLAZE_SECRET_ACCESS_KEY=<from-secret-manager>
BACKBLAZE_BUCKET_NAME=<bucket>
BACKBLAZE_ENDPOINT=<endpoint>
BACKBLAZE_REGION=<region>
```

Google Cloud Storage:

```bash
STORAGE_PROVIDER=gcs
GCS_BUCKET_NAME=<bucket>
GCS_PROJECT_ID=<project-id>
GCS_SERVICE_ACCOUNT_JSON=<escaped-service-account-json>
# or
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Preflight

Before a production deploy that touches database constraints or storage:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=public' npm run dokploy:preflight
```

## Smoke Test

```bash
SMOKE_API_URL=https://api.rakium.dev/api npm run smoke:api
```

Use `SMOKE_UPLOAD_FILE=./some-image.jpg` only after storage credentials are confirmed.

## Rollback

1. Redeploy the previous known-good commit in Dokploy.
2. Keep the same `DATABASE_URL` unless the rollback specifically requires DB restore.
3. Watch Dokploy logs and run the smoke test again.
