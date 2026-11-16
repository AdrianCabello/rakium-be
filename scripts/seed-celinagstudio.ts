/**
 * Alta de Celina G Studio como cliente: Client (slug "celinagstudio"), usuario CLIENT_ADMIN,
 * categorías y servicios iniciales (sin precios: los carga ella desde el panel).
 * Es idempotente: se puede correr más de una vez.
 *
 *   CELINA_CLIENT_EMAIL=... CELINA_ADMIN_EMAIL=... CELINA_ADMIN_PASSWORD=... [CELINA_SITE_URL=...] npm run seed:celinagstudio
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SLUG = 'celinagstudio';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

const CATEGORIES = [
  { slug: 'alisados', name: 'Alisados' },
  { slug: 'tratamientos', name: 'Tratamientos' },
  { slug: 'unas', name: 'Uñas' },
];

/** Servicios vistos en su Instagram. Duración y retoque según lo que respondió (2 h, 45 días, ~3 meses). */
const SERVICES: {
  category: string;
  name: string;
  slug: string;
  featured?: boolean;
  formaldehydeFree?: boolean;
  straightening?: boolean;
}[] = [
  { category: 'alisados', name: 'Nanoplastia', slug: 'nanoplastia', featured: true, straightening: true },
  { category: 'alisados', name: 'Vitta Gold', slug: 'vitta-gold', formaldehydeFree: true, straightening: true },
  { category: 'alisados', name: 'Alisado Complex', slug: 'alisado-complex', straightening: true },
  { category: 'alisados', name: 'Luminoliss', slug: 'luminoliss', formaldehydeFree: true, straightening: true },
  { category: 'alisados', name: 'Lix Plex', slug: 'lix-plex', straightening: true },
  { category: 'alisados', name: 'Nanoplastia + tinte', slug: 'nanoplastia-tinte', straightening: true },
  { category: 'tratamientos', name: 'Hidratación', slug: 'hidratacion' },
  { category: 'tratamientos', name: 'Nutrición Karsell', slug: 'nutricion-karsell' },
  { category: 'tratamientos', name: 'Reconstrucción', slug: 'reconstruccion' },
];

async function main() {
  const clientEmail = requireEnv('CELINA_CLIENT_EMAIL');
  const adminEmail = requireEnv('CELINA_ADMIN_EMAIL');
  const adminPassword = requireEnv('CELINA_ADMIN_PASSWORD');
  // A dónde apunta el link de "olvidé mi contraseña". En local: CELINA_SITE_URL=http://localhost:4200
  const siteUrl = process.env.CELINA_SITE_URL ?? 'https://celinagstudio.com';

  const client = await prisma.client.upsert({
    where: { slug: SLUG },
    update: { siteUrl },
    create: { name: 'Celina G Studio', email: clientEmail, slug: SLUG, siteUrl },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { clientId: client.id, role: UserRole.CLIENT_ADMIN },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: UserRole.CLIENT_ADMIN,
      clientId: client.id,
    },
  });

  const categoryIds = new Map<string, string>();
  for (const [order, category] of CATEGORIES.entries()) {
    const saved = await prisma.serviceCategory.upsert({
      where: { clientId_slug: { clientId: client.id, slug: category.slug } },
      update: {},
      create: { ...category, order, clientId: client.id },
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const [order, { category, straightening, ...service }] of SERVICES.entries()) {
    await prisma.service.upsert({
      where: { clientId_slug: { clientId: client.id, slug: service.slug } },
      update: {},
      create: {
        ...service,
        order,
        clientId: client.id,
        categoryId: categoryIds.get(category),
        durationMinutes: straightening ? 120 : 60,
        touchUpDays: straightening ? 45 : null,
        resultDurationDays: straightening ? 90 : null,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { clientId: client.id },
    update: {},
    create: { clientId: client.id, instagram: 'celinagstudio' },
  });

  console.log(`✔ Celina G Studio listo. clientId=${client.id} slug=${SLUG}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
