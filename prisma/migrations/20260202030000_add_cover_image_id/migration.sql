-- AlterTable
ALTER TABLE "projects" ADD COLUMN "cover_image_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_cover_image_id_key" ON "projects"("cover_image_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
