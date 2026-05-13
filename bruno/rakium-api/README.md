# Rakium API Bruno collection

This Bruno collection contains the main Rakium API endpoints for local and production smoke testing.

## Setup

1. Import `bruno/rakium-api` into Bruno.
2. Select the `Local` or `Production` environment.
3. Run `Auth / Login` first.
4. The login request stores the bearer token in `authToken`.
5. Run list endpoints to populate IDs such as `clientId`, `projectId`, `galleryId`, and `videoId`.

## Endpoint groups

### Auth

- `Login`: public login endpoint.
- `Get Profile`: authenticated profile endpoint.
- `Test Auth`: authenticated token check.

### Projects

- Private management endpoints require bearer auth.
- Public routes only expose published project data.
- Reorder and order update requests require bearer auth.

### Clients and Users

- All client and user management endpoints require bearer auth.
- User responses are expected to omit `passwordHash`.

### Gallery

- Public gallery routes only return gallery data for published projects.
- Gallery create, upload, update, reorder, and delete require bearer auth.

### Videos

- Public video routes only return videos for published projects.
- Video create, update, reorder, and delete require bearer auth.

### Upload

- `Test Upload`: protected upload test endpoint.
- `Upload File`: uploads to the configured storage provider.
- `Upload Image with Variants`: protected image variants endpoint.
- `Upload to Project Gallery`: protected project gallery upload.
- `Upload Image Variants`: protected variants endpoint.

## URLs

- Production: `https://rakium-be-production.up.railway.app`
- Local: `http://localhost:3000`
- Swagger: `{{baseUrl}}/api`

## Notes

- Endpoints marked public in the collection do not send a token.
- Every other endpoint must use `Authorization: Bearer {{authToken}}`.
- Upload requests need `test-image.png` available where Bruno can read it.
- Keep production secrets out of collection files and environment commits.
