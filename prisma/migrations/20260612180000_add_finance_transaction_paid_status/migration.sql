ALTER TABLE "finance_transactions"
  ADD COLUMN IF NOT EXISTS "is_paid" BOOLEAN NOT NULL DEFAULT true;
