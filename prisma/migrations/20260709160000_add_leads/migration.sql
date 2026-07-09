CREATE TYPE "LeadSource" AS ENUM ('MANUAL', 'GOOGLE_PLACES', 'GOOGLE_SEARCH', 'INSTAGRAM', 'CSV', 'WEBSITE');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'REPLIED', 'MEETING', 'WON', 'LOST', 'ARCHIVED');
CREATE TYPE "LeadQuality" AS ENUM ('UNKNOWN', 'POOR', 'OK', 'GOOD');
CREATE TYPE "LeadActivityType" AS ENUM ('NOTE', 'INSTAGRAM_SENT', 'WHATSAPP_SENT', 'EMAIL_SENT', 'CALLED', 'REPLIED', 'FOLLOW_UP', 'STATUS_CHANGE');

CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "region" TEXT,
  "category" TEXT,
  "address" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "instagram" TEXT,
  "facebook" TEXT,
  "google_maps_url" TEXT,
  "source" "LeadSource" NOT NULL DEFAULT 'MANUAL',
  "source_id" TEXT,
  "source_url" TEXT,
  "digital_presence_score" INTEGER NOT NULL DEFAULT 0,
  "needs_website" BOOLEAN NOT NULL DEFAULT false,
  "instagram_quality" "LeadQuality",
  "priority" INTEGER NOT NULL DEFAULT 2,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "last_contacted_at" TIMESTAMP(3),
  "next_follow_up_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_activities" (
  "id" TEXT NOT NULL,
  "lead_id" TEXT NOT NULL,
  "type" "LeadActivityType" NOT NULL,
  "note" TEXT,
  "channel" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scheduled_at" TIMESTAMP(3),
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "unique_lead_source" ON "leads"("source", "source_id");
CREATE INDEX "leads_city_idx" ON "leads"("city");
CREATE INDEX "leads_category_idx" ON "leads"("category");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "lead_activities_lead_id_idx" ON "lead_activities"("lead_id");
CREATE INDEX "lead_activities_type_idx" ON "lead_activities"("type");

ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
