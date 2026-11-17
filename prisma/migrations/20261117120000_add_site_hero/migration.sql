-- Antes y después de la portada (hero) de cada sitio.
ALTER TABLE "client_site_settings" ADD COLUMN "hero_before" TEXT, ADD COLUMN "hero_after" TEXT;
