-- CreateTable
CREATE TABLE "content_metrics" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "content_key" TEXT NOT NULL,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_metrics_client_id_idx" ON "content_metrics"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_metrics_client_id_content_key_key" ON "content_metrics"("client_id", "content_key");

-- AddForeignKey
ALTER TABLE "content_metrics" ADD CONSTRAINT "content_metrics_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
