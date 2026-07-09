CREATE TYPE "SellerStatus" AS ENUM ('TRAINING', 'ACTIVE', 'PAUSED', 'INACTIVE');

CREATE TYPE "SellerActivityType" AS ENUM (
  'INSTAGRAM_SENT',
  'LINKEDIN_SENT',
  'WHATSAPP_SENT',
  'EMAIL_SENT',
  'CALLED',
  'VISITED',
  'MEETING',
  'REPLIED',
  'FOLLOW_UP',
  'NOTE'
);

CREATE TABLE "sellers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "instagram" TEXT,
  "linkedin" TEXT,
  "city" TEXT,
  "role" TEXT,
  "status" "SellerStatus" NOT NULL DEFAULT 'TRAINING',
  "profile_checklist" JSONB,
  "sales_playbook" JSONB,
  "notes" TEXT,
  "daily_target" INTEGER DEFAULT 30,
  "weekly_visit_target" INTEGER DEFAULT 10,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_activities" (
  "id" TEXT NOT NULL,
  "seller_id" TEXT NOT NULL,
  "lead_id" TEXT,
  "type" "SellerActivityType" NOT NULL,
  "channel" TEXT,
  "note" TEXT,
  "outcome" TEXT,
  "address" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "next_follow_up_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seller_activities_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "leads" ADD COLUMN "assigned_seller_id" TEXT;

CREATE UNIQUE INDEX "sellers_email_key" ON "sellers"("email");
CREATE INDEX "sellers_status_idx" ON "sellers"("status");
CREATE INDEX "sellers_city_idx" ON "sellers"("city");
CREATE INDEX "seller_activities_seller_id_occurred_at_idx" ON "seller_activities"("seller_id", "occurred_at");
CREATE INDEX "seller_activities_lead_id_idx" ON "seller_activities"("lead_id");
CREATE INDEX "seller_activities_type_idx" ON "seller_activities"("type");
CREATE INDEX "leads_assigned_seller_id_idx" ON "leads"("assigned_seller_id");

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_assigned_seller_id_fkey"
  FOREIGN KEY ("assigned_seller_id") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "seller_activities"
  ADD CONSTRAINT "seller_activities_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seller_activities"
  ADD CONSTRAINT "seller_activities_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
