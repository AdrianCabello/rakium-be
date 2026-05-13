# Backblaze to Google Cloud Storage Migration

This runbook prepares and executes the object migration without changing production traffic by default.

## Safety rules

- Do not run the cutover without explicit approval.
- Do not commit dumps, manifests with sensitive URLs, service account JSON, or bucket credentials.
- Keep `STORAGE_PROVIDER=backblaze` or unset until upload and read checks pass against GCS.
- Rotate any credential that was previously committed or shared in docs.

## Required inputs

- Current Backblaze env:
  - `BACKBLAZE_BUCKET_NAME`
  - `BACKBLAZE_ACCESS_KEY_ID`
  - `BACKBLAZE_SECRET_ACCESS_KEY`
- Target GCS env:
  - `GCS_BUCKET_NAME`
  - `GCS_PROJECT_ID`
  - `GCS_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`
- Database env:
  - `DATABASE_URL`

## 1. Generate the migration manifest

The manifest inventories object URLs referenced by the database and maps each Backblaze object key to the expected GCS public URL.

```bash
GCS_BUCKET_NAME="target-gcs-bucket" \
BACKBLAZE_BUCKET_NAME="source-backblaze-bucket" \
DATABASE_URL="postgresql://user:password@host:5432/db?schema=public" \
npm run storage:plan-gcs-migration
```

Default output:

```text
.tmp/storage-migration/backblaze-to-gcs-manifest.json
```

Review:

- `assets.length` is the number of DB references ready to migrate.
- `skippedUrls` should be empty or understood before copying.
- `objectKey` values should match the paths in Backblaze.
- `targetUrl` should use the expected GCS bucket.

## 2. Copy objects

Recommended options:

- Use Google Cloud Storage Transfer Service from Backblaze S3-compatible source to GCS.
- Or use `rclone` configured with Backblaze B2/S3 and GCS remotes.

Example with `rclone`:

```bash
rclone copy backblaze:source-backblaze-bucket gcs:target-gcs-bucket \
  --fast-list \
  --checksum \
  --transfers 8 \
  --checkers 16 \
  --log-file .tmp/storage-migration/rclone-copy.log \
  --log-level INFO
```

Do not delete Backblaze objects during the first copy.

## 3. Validate copy

Use the manifest to sample-check:

- A few gallery URLs.
- A few project before/after image URLs.
- At least one object per folder prefix.
- Total object counts in source and target buckets.

Suggested checks:

```bash
rclone check backblaze:source-backblaze-bucket gcs:target-gcs-bucket \
  --one-way \
  --log-file .tmp/storage-migration/rclone-check.log \
  --log-level INFO
```

## 4. Application cutover

Only after copy validation:

1. Merge the GCS provider PR.
2. Configure production env:
   - `STORAGE_PROVIDER=gcs`
   - `GCS_BUCKET_NAME`
   - `GCS_PROJECT_ID`
   - `GCS_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`
3. Deploy.
4. Upload a new test image and confirm it lands in GCS.

Existing database URLs still point to Backblaze until URL rewrite is done.

## 5. URL rewrite plan

After object copy is validated, create a separate PR or one-time migration script to update:

- `Gallery.url`
- `Project.imageBefore`
- `Project.imageAfter`

Use the generated manifest as the source of truth:

- Replace each `currentUrl` with `targetUrl`.
- Wrap updates in a transaction.
- Take a database backup first.
- Keep Backblaze objects for rollback until the frontend has been verified against rewritten URLs.

## 6. Rollback

If GCS upload/read checks fail:

1. Set `STORAGE_PROVIDER=backblaze` or remove `STORAGE_PROVIDER`.
2. Redeploy.
3. Do not rewrite DB URLs.
4. Keep Backblaze bucket unchanged until GCS is fully validated.
