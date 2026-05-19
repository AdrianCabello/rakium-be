# Rakium GCS Setup Plan

This is the setup plan for the future Backblaze to Google Cloud Storage migration. Do not store real credentials or service account JSON in this file.

## Resources To Create

- Google Cloud project: `rakium-prod-401022`.
- Cloud Storage bucket: `rakium-prod-assets-401022`.
- Bucket location: `us-central1`.
- Service account: `rakium-be-storage@rakium-prod-401022.iam.gserviceaccount.com`.
- Service account role: bucket-scoped `roles/storage.objectAdmin` on `rakium-prod-assets-401022`.
- Public read role: bucket-scoped `roles/storage.objectViewer` for `allUsers`.

## Current Status

- Project created.
- Billing linked.
- Cloud Storage/IAM APIs enabled.
- Bucket created with uniform bucket-level access.
- Public object reads verified.
- Service account key created at `.tmp/gcp/rakium-be-storage-key.json`; this path is ignored by Git.
- Smoke upload/read/delete verified with `@google-cloud/storage`.

## Backend Environment Variables

```bash
STORAGE_PROVIDER=gcs
GCS_BUCKET_NAME=rakium-prod-assets-401022
GCS_PROJECT_ID=rakium-prod-401022
GCS_SERVICE_ACCOUNT_JSON=<escaped-service-account-json>
```

For a server-local credentials file, use this instead of `GCS_SERVICE_ACCOUNT_JSON`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## CLI Flow

Already executed for the current setup:

```bash
gcloud services enable storage.googleapis.com

gcloud storage buckets create gs://rakium-prod-assets-401022 \
  --project=rakium-prod-401022 \
  --location=us-central1 \
  --uniform-bucket-level-access

gcloud storage buckets add-iam-policy-binding gs://rakium-prod-assets-401022 \
  --member="allUsers" \
  --role="roles/storage.objectViewer"

gcloud iam service-accounts create rakium-be-storage \
  --project=rakium-prod-401022 \
  --display-name="Rakium BE Storage"

gcloud storage buckets add-iam-policy-binding gs://rakium-prod-assets-401022 \
  --member="serviceAccount:rakium-be-storage@rakium-prod-401022.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create .tmp/gcp/rakium-be-storage-key.json \
  --iam-account="rakium-be-storage@rakium-prod-401022.iam.gserviceaccount.com" \
  --project=rakium-prod-401022
```

## Safety

- Keep Backblaze active for the first Dokploy backend cutover.
- Do not switch `STORAGE_PROVIDER=gcs` until upload/read checks pass.
- Do not rewrite database URLs until objects are copied, validated, and the database is backed up.
- Delete or move service account key files out of the repo workspace after storing the secret in the deployment platform.
