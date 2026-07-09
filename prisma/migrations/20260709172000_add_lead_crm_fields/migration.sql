ALTER TABLE "leads"
  ADD COLUMN "assigned_to" TEXT,
  ADD COLUMN "tags" JSONB,
  ADD COLUMN "checklist" JSONB,
  ADD COLUMN "estimated_value" INTEGER,
  ADD COLUMN "suggested_message" TEXT,
  ADD COLUMN "converted_client_id" TEXT;

CREATE INDEX "leads_assigned_to_idx" ON "leads"("assigned_to");
CREATE INDEX "leads_next_follow_up_at_idx" ON "leads"("next_follow_up_at");
