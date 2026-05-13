# Dokploy database dump/import runbook

Use this for a controlled Railway Postgres to Dokploy Postgres migration. Dumps stay outside Git at all times.

## Export from Railway

From a secure terminal:

```bash
RAILWAY_DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DB' ./scripts/dump-railway-db.sh
```

The script writes `./dumps/railway-dump-YYYYMMDD-HHMMSS.sql`. Keep that directory ignored by Git.

## Import into Dokploy from local machine

Use this only when the Dokploy database is reachable from your machine:

```bash
./scripts/import-dump-to-dokploy.sh ./dumps/railway-dump-YYYYMMDD-HHMMSS.sql 'postgresql://USER:PASSWORD@HOST:5432/DB?schema=public'
```

## Import inside the Dokploy network

Use this when the database host is internal to Dokploy:

```bash
docker run --rm -i \
  --network dokploy_default \
  -v /tmp/rakium-dumps:/dumps \
  postgres:16-alpine \
  psql 'postgresql://USER:PASSWORD@DOKPLOY_DB_HOST:5432/DB?schema=public' \
  < /dumps/railway-dump-YYYYMMDD-HHMMSS.sql
```

Recommended flow:

1. Upload the dump to `/tmp/rakium-dumps` through SSH/SFTP or another temporary secure channel.
2. Run the import command above.
3. Verify counts:

```sql
SELECT COUNT(*) FROM "Client";
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM gallery;
```

4. Delete the dump from the server:

```bash
rm -f /tmp/rakium-dumps/railway-dump-*.sql
```

## Post-import checks

Run:

```bash
npx prisma migrate deploy
SMOKE_API_URL=https://<dokploy-api-domain>/api npm run smoke:api
```

Set `SMOKE_UPLOAD_FILE` only when storage credentials are present in the target environment.

## Safety rules

- Never build a Docker image that contains the dump.
- Never commit dump files.
- Never paste production credentials into docs, scripts, PR descriptions, or ClickUp comments.
- Rotate any credential that was accidentally committed or shared.
