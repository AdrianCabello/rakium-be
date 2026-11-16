# Sitios de estética (Celina G Studio)

Módulo `src/studio/`. Frontend: `celinagstudio-web` (Angular). Cliente con `slug = "celinagstudio"`.

## Modelos

| Modelo | Tabla | Qué guarda |
|---|---|---|
| `Professional` | `professionals` | Quienes atienden: nombre completo, profesión/área, matrícula opcional, foto, bio, WhatsApp, Instagram, visible, orden. `userId` opcional para darle login. |
| `ServiceCategory` | `service_categories` | Alisados, Tratamientos, Uñas... (slug único por cliente). |
| `Service` | `services` | Tratamiento: descripción, beneficios, duración, precio en pesos (`null` = consultar), "desde", sin formol, retoque y duración del resultado en días, foto, visible, destacado, orden. |
| `Promo` | `promos` | Promos con vencimiento opcional (`validUntil`). |
| `SiteSettings` | `client_site_settings` | WhatsApp, Instagram, dirección, link de mapa y horarios (`schedule` JSON). |
| `Client.slug` | `Client.slug` | Identificador público del sitio. |
| `Project.serviceId` / `Project.professionalId` | `projects` | Los trabajos antes/después son `Project` (+ `Gallery`/`Video`). |

Migración: `prisma/migrations/20261029120000_add_studio_sites` (solo agrega columnas y tablas).

## Endpoints

Panel (JWT, rol `ADMIN` o `CLIENT_ADMIN`). El `clientId` sale del token; un `ADMIN` puede pasar `?clientId=` para operar sobre otro cliente.

| Recurso | Endpoints |
|---|---|
| `/api/professionals` | `GET`, `POST`, `GET :id`, `PATCH :id`, `PATCH :id/visibility`, `PATCH reorder`, `DELETE :id` |
| `/api/services` | igual que profesionales |
| `/api/service-categories` | `GET`, `POST`, `PATCH :id`, `PATCH reorder`, `DELETE :id` |
| `/api/promos` | `GET`, `POST`, `PATCH :id`, `PATCH :id/visibility`, `PATCH reorder`, `DELETE :id` |
| `/api/site-settings` | `GET`, `PATCH` (crea si no existe) |

- `PATCH reorder` recibe `{ "items": [{ "id": "...", "order": 0 }] }`.
- `PATCH :id/visibility` recibe `{ "visible": true }`.

Público (sin JWT):

- `GET /api/public/sites/:slug` → `{ clientId, settings, categories, services, professionals, promos }`, solo contenido visible y promos vigentes.
- Trabajos publicados: `GET /api/projects/client/:clientId/public` (ya existente).

## Acceso y "olvidé mi contraseña"

Basado en el flujo de Adrian (`codex/resend-password-reset`), traído a esta rama con `cherry-pick -x`.

| Endpoint | Envía | Devuelve |
|---|---|---|
| `POST /api/auth/login` | `{ email, password }` | `{ access_token, user }` |
| `POST /api/auth/forgot-password` | `{ email }` | Siempre el mismo mensaje, exista o no el email |
| `POST /api/auth/reset-password` | `{ token, password }` (mín. 6; el front pide 8) | OK, o 400 si el link venció o ya se usó |

- El token se guarda hasheado (`PasswordResetToken`), es de un solo uso y vence a los `PASSWORD_RESET_TTL_MINUTES` (60).
- Si el cliente del usuario tiene `Client.siteUrl`, el link va a `<siteUrl>/admin/restablecer?token=…` y el mail sale con el nombre del cliente como remitente. Si no, se usa `PASSWORD_RESET_URL_BASE` (Rakium).
- Mails con Resend (`RESEND_API_KEY`, `MAIL_FROM`). Sin API key y fuera de producción, el link se imprime en la consola del backend para probar en local.
- `slug` y `siteUrl` se pueden cargar desde `POST/PATCH /api/clients`.

## Alta del cliente

```bash
CELINA_CLIENT_EMAIL=... CELINA_ADMIN_EMAIL=... CELINA_ADMIN_PASSWORD=... [CELINA_SITE_URL=...] npm run seed:celinagstudio
```

Crea el `Client`, el usuario `CLIENT_ADMIN`, las categorías y los servicios sin precio. Es idempotente.

## Turnos y seña (opción 3) — diseñado, NO implementado

Lo que ya queda preparado: `Service.durationMinutes`, `Service.bookable`, `Service.depositAmount` y la agenda por `Professional`.

```prisma
model Customer {            // historial y aviso de retoque
  id          String   @id @default(uuid())
  clientId    String
  name        String
  phone       String
  email       String?
  notes       String?
  lastVisitAt DateTime?
  appointments Appointment[]
  @@unique([clientId, phone])
}

model Appointment {
  id                String            @id @default(uuid())
  clientId          String
  serviceId         String            // onDelete: Restrict
  professionalId    String            // onDelete: Restrict
  customerId        String
  startsAt          DateTime
  endsAt            DateTime          // startsAt + service.durationMinutes
  status            AppointmentStatus @default(PENDING_DEPOSIT)
  notes             String?
  depositAmount     Int?              // copia de service.depositAmount al reservar
  depositStatus     DepositStatus     @default(NONE)
  paymentProvider   String?           // "mercadopago"
  paymentExternalId String?  @unique  // id de pago/preferencia, para el webhook
  paidAt            DateTime?
  reminderSentAt    DateTime?
  createdAt         DateTime @default(now())
  @@index([professionalId, startsAt])
}

model AvailabilityRule {    // horario semanal por profesional
  id             String @id @default(uuid())
  professionalId String
  weekday        Int    // 0-6
  startTime      String // "09:00"
  endTime        String
}

model TimeOff {             // días bloqueados
  id             String   @id @default(uuid())
  professionalId String
  startsAt       DateTime
  endsAt         DateTime
  reason         String?
}

enum AppointmentStatus { PENDING_DEPOSIT CONFIRMED CANCELLED COMPLETED NO_SHOW }
enum DepositStatus     { NONE PENDING PAID REFUNDED }
```

Flujo previsto: la clienta elige servicio → horarios libres (reglas − turnos − bloqueos) → se crea el turno en `PENDING_DEPOSIT` → pago de seña con Mercado Pago → el webhook lo pasa a `CONFIRMED` → recordatorio el día anterior → aviso de retoque a los `touchUpDays`.
