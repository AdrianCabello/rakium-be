import 'dotenv/config';
import { writeFileSync } from 'fs';

type Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
};

type LeadPayload = {
  name: string;
  city: string;
  region: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  source: 'GOOGLE_PLACES';
  sourceId?: string;
  sourceUrl?: string;
  needsWebsite: boolean;
  digitalPresenceScore: number;
  priority: number;
  notes?: string;
};

const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const cities = readListArg('--cities') ?? ['Necochea', 'Tandil'];
const categories =
  readListArg('--categories') ?? [
    'restaurantes',
    'cafes',
    'bares',
    'hoteles',
    'turismo',
    'inmobiliarias',
    'gimnasios',
    'centros de estetica',
    'peluquerias',
    'odontologos',
    'veterinarias',
    'tiendas de ropa',
    'mueblerias',
    'ferreterias',
    'corralones',
    'concesionarias',
    'talleres mecanicos',
    'panaderias',
    'estudios juridicos',
    'profesionales',
  ];

async function main() {
  if (!apiKey) {
    throw new Error('Falta GOOGLE_PLACES_API_KEY o GOOGLE_MAPS_API_KEY en el entorno.');
  }

  const leads = new Map<string, LeadPayload>();
  for (const city of cities) {
    for (const category of categories) {
      const places = await searchPlaces(`${category} en ${city}, Buenos Aires, Argentina`);
      for (const place of places) {
        const lead = toLead(place, city, category);
        const key = lead.sourceId || `${lead.name}-${lead.city}-${lead.address || ''}`.toLowerCase();
        leads.set(key, { ...leads.get(key), ...lead });
      }
      console.log(`${city} / ${category}: ${places.length}`);
    }
  }

  const payload = { leads: [...leads.values()] };
  const output = readArg('--out');
  if (output) {
    writeFileSync(output, JSON.stringify(payload, null, 2));
    console.log(`Archivo generado: ${output}`);
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }

  const apiUrl = readArg('--api-url');
  const token = readArg('--token') || process.env.RAKIUM_ADMIN_TOKEN;
  if (apiUrl && token) {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/leads/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Import fallido ${res.status}: ${await res.text()}`);
    }
    console.log(await res.text());
  }
}

async function searchPlaces(textQuery: string): Promise<Place[]> {
  const all: Place[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 3; page += 1) {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode: 'es-AR',
      regionCode: 'AR',
      pageSize: 20,
    };
    if (pageToken) body['pageToken'] = pageToken;

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey as string,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.primaryTypeDisplayName,places.types,nextPageToken',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Places error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { places?: Place[]; nextPageToken?: string };
    all.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    await wait(2200);
  }

  return all;
}

function toLead(place: Place, city: string, fallbackCategory: string): LeadPayload {
  const website = place.websiteUri;
  const category = place.primaryTypeDisplayName?.text || fallbackCategory;
  const needsWebsite = !website;
  const score = Math.min(100, 35 + (needsWebsite ? 40 : 5) + (place.nationalPhoneNumber ? 10 : 0) + (category ? 10 : 0));

  return {
    name: place.displayName?.text || 'Sin nombre',
    city,
    region: 'Buenos Aires',
    category,
    address: place.formattedAddress,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    phone: place.nationalPhoneNumber,
    website,
    googleMapsUrl: place.googleMapsUri,
    source: 'GOOGLE_PLACES',
    sourceId: place.id,
    sourceUrl: place.googleMapsUri,
    needsWebsite,
    digitalPresenceScore: score,
    priority: needsWebsite ? 4 : 2,
    notes: `Importado desde Google Places. Query/rubro base: ${fallbackCategory}. Revisar Instagram y calidad visual antes de contactar.`,
  };
}

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readListArg(name: string): string[] | undefined {
  const value = readArg(name);
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
