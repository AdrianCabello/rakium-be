ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_client_id_fkey";

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "Client"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
