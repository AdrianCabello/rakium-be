# Rakium GCS Setup Plan

This is the setup plan for the future Backblaze to Google Cloud Storage migration. Do not store real credentials or service account JSON in this file.

## Resources To Create

- Google Cloud project: use an existing Rakium/Adrian project if one already exists; otherwise create a dedicated project such as `rakium-prod`.
- Cloud Storage bucket: `rakium-prod-assets` or another globally unique variant.
- Bucket location: `us-central1` unless there is a stronger latency/compliance reason to choose another region.
- Service account: `rakium-be-storage`.
- Service account role: prefer bucket-scoped `roles/storage.objectAdmin` on the target bucket.

## Backend Environment Variables

```bash
STORAGE_PROVIDER=gcs
GCS_BUCKET_NAME=<bucket>
GCS_PROJECT_ID=<project-id>
GCS_SERVICE_ACCOUNT_JSON=<escaped-service-account-json>
```

For a server-local credentials file, use this instead of `GCS_SERVICE_ACCOUNT_JSON`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## CLI Flow

After `gcloud auth login` and project selection:

```bash
gcloud services enable storage.googleapis.com

gcloud storage buckets create gs://<bucket> \
  --project=<project-id> \
  --location=us-central1 \
  --uniform-bucket-level-access

gcloud iam service-accounts create rakium-be-storage \
  --project=<project-id> \
  --display-name="Rakium BE Storage"

gcloud storage buckets add-iam-policy-binding gs://<bucket> \
  --member="serviceAccount:rakium-be-storage@<project-id>.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create .tmp/gcp/rakium-be-storage-key.json \
  --iam-account="rakium-be-storage@<project-id>.iam.gserviceaccount.com" \
  --project=<project-id>
```

## Safety

- Keep Backblaze active for the first Dokploy backend cutover.
- Do not switch `STORAGE_PROVIDER=gcs` until upload/read checks pass.
- Do not rewrite database URLs until objects are copied, validated, and the database is backed up.
- Delete or move service account key files out of the repo workspace after storing the secret in the deployment platform.
