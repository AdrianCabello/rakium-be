ALTER TABLE "finance_categories"
  ADD COLUMN IF NOT EXISTS "hint" TEXT,
  ADD COLUMN IF NOT EXISTS "expense_mode" TEXT DEFAULT 'daily';
