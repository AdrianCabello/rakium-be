-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonalPriority') THEN
    CREATE TYPE "PersonalPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonalTaskStatus') THEN
    CREATE TYPE "PersonalTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonalNoteType') THEN
    CREATE TYPE "PersonalNoteType" AS ENUM ('BRAIN_DUMP', 'IDEA', 'IMPORTANT', 'REFLECTION');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FinanceAccountType') THEN
    CREATE TYPE "FinanceAccountType" AS ENUM ('CASH', 'BANK', 'DIGITAL_WALLET', 'CREDIT_CARD', 'INVESTMENT', 'OTHER');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FinanceTransactionType') THEN
    CREATE TYPE "FinanceTransactionType" AS ENUM ('INCOME', 'EXPENSE');
  END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "life_areas" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "life_areas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "personal_tasks" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "area_id" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "PersonalTaskStatus" NOT NULL DEFAULT 'TODO',
  "priority" "PersonalPriority" NOT NULL DEFAULT 'NORMAL',
  "due_date" TIMESTAMP(3),
  "scheduled_date" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "estimated_minutes" INTEGER,
  "tags" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "personal_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "personal_notes" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "area_id" TEXT,
  "title" TEXT,
  "content" TEXT NOT NULL,
  "type" "PersonalNoteType" NOT NULL DEFAULT 'BRAIN_DUMP',
  "pinned" BOOLEAN NOT NULL DEFAULT false,
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "personal_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "finance_accounts" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FinanceAccountType" NOT NULL DEFAULT 'CASH',
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "initial_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "finance_categories" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FinanceTransactionType" NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "monthly_budget" DECIMAL(12,2),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "finance_transactions" (
  "id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "account_id" TEXT,
  "category_id" TEXT,
  "type" "FinanceTransactionType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT,
  "merchant" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "life_areas_client_id_name_key" ON "life_areas"("client_id", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "finance_accounts_client_id_name_key" ON "finance_accounts"("client_id", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "finance_categories_client_id_name_type_key" ON "finance_categories"("client_id", "name", "type");

-- Search/filter indexes
CREATE INDEX IF NOT EXISTS "personal_tasks_client_id_status_due_date_idx" ON "personal_tasks"("client_id", "status", "due_date");
CREATE INDEX IF NOT EXISTS "personal_tasks_client_id_scheduled_date_idx" ON "personal_tasks"("client_id", "scheduled_date");
CREATE INDEX IF NOT EXISTS "personal_notes_client_id_type_created_at_idx" ON "personal_notes"("client_id", "type", "created_at");
CREATE INDEX IF NOT EXISTS "finance_transactions_client_id_date_idx" ON "finance_transactions"("client_id", "date");
CREATE INDEX IF NOT EXISTS "finance_transactions_client_id_type_date_idx" ON "finance_transactions"("client_id", "type", "date");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'life_areas_client_id_fkey') THEN
    ALTER TABLE "life_areas" ADD CONSTRAINT "life_areas_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personal_tasks_client_id_fkey') THEN
    ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personal_tasks_area_id_fkey') THEN
    ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_area_id_fkey"
      FOREIGN KEY ("area_id") REFERENCES "life_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personal_notes_client_id_fkey') THEN
    ALTER TABLE "personal_notes" ADD CONSTRAINT "personal_notes_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personal_notes_area_id_fkey') THEN
    ALTER TABLE "personal_notes" ADD CONSTRAINT "personal_notes_area_id_fkey"
      FOREIGN KEY ("area_id") REFERENCES "life_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_accounts_client_id_fkey') THEN
    ALTER TABLE "finance_accounts" ADD CONSTRAINT "finance_accounts_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_categories_client_id_fkey') THEN
    ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_client_id_fkey') THEN
    ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_client_id_fkey"
      FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_account_id_fkey') THEN
    ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_account_id_fkey"
      FOREIGN KEY ("account_id") REFERENCES "finance_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'finance_transactions_category_id_fkey') THEN
    ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
