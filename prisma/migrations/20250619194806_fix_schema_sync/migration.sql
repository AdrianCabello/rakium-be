/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdBy_fkey";

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectType",
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "category" "ProjectCategory" NOT NULL,
    "description" TEXT,
    "long_description" TEXT,
    "image_before" TEXT,
    "image_after" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "area" TEXT,
    "duration" TEXT,
    "date" TEXT,
    "url" TEXT,
    "client_id" TEXT NOT NULL,
    "challenge" TEXT,
    "solution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "before_image_id" TEXT,
    "after_image_id" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_before_image_id_key" ON "projects"("before_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_after_image_id_key" ON "projects"("after_image_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_before_image_id_fkey" FOREIGN KEY ("before_image_id") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_after_image_id_fkey" FOREIGN KEY ("after_image_id") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
