-- Align migration history with the current Prisma schema.
-- This migration is intentionally defensive because some environments may have
-- received these schema changes earlier through `prisma db push`.

-- Enums
ALTER TYPE "ProjectCategory" ADD VALUE IF NOT EXISTS 'SITIO_WEB';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'PORTFOLIO';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'BLOG';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'CORPORATIVO';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'ONE_PAGE';

-- Category lookup table
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_value_key" ON "Category"("value");

-- Project columns introduced in schema.prisma but missing from migration history
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "category_id" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "cover_image_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "projects_cover_image_id_key" ON "projects"("cover_image_id");
CREATE UNIQUE INDEX IF NOT EXISTS "projects_client_id_order_key" ON "projects"("client_id", "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_cover_image_id_fkey'
  ) THEN
    ALTER TABLE "projects"
      ADD CONSTRAINT "projects_cover_image_id_fkey"
      FOREIGN KEY ("cover_image_id") REFERENCES "Gallery"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_category_id_fkey'
  ) THEN
    ALTER TABLE "projects"
      ADD CONSTRAINT "projects_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "Category"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
