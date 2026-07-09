-- CreateEnum
CREATE TYPE "InstagramConversationStatus" AS ENUM ('UNMATCHED', 'MATCHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InstagramMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "instagram_conversations" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "username" TEXT,
    "lead_id" TEXT,
    "status" "InstagramConversationStatus" NOT NULL DEFAULT 'UNMATCHED',
    "last_message_text" TEXT,
    "last_message_at" TIMESTAMP(3),
    "raw_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "direction" "InstagramMessageDirection" NOT NULL,
    "text" TEXT,
    "attachments" JSONB,
    "raw" JSONB,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_conversations_sender_id_key" ON "instagram_conversations"("sender_id");

-- CreateIndex
CREATE INDEX "instagram_conversations_lead_id_idx" ON "instagram_conversations"("lead_id");

-- CreateIndex
CREATE INDEX "instagram_conversations_status_idx" ON "instagram_conversations"("status");

-- CreateIndex
CREATE INDEX "instagram_conversations_last_message_at_idx" ON "instagram_conversations"("last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_messages_message_id_key" ON "instagram_messages"("message_id");

-- CreateIndex
CREATE INDEX "instagram_messages_conversation_id_received_at_idx" ON "instagram_messages"("conversation_id", "received_at");

-- CreateIndex
CREATE INDEX "instagram_messages_direction_idx" ON "instagram_messages"("direction");

-- AddForeignKey
ALTER TABLE "instagram_conversations" ADD CONSTRAINT "instagram_conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_messages" ADD CONSTRAINT "instagram_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "instagram_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
