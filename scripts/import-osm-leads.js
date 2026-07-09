const fs = require('node:fs');

const API_URL = process.env.RAKIUM_API_URL || 'https://api.rakium.dev/api';
const ADMIN_EMAIL = process.env.RAKIUM_ADMIN_EMAIL || 'admin@rakium.com';
const ADMIN_PASSWORD = process.env.RAKIUM_ADMIN_PASSWORD;
const OUT_FILE = process.env.OSM_LEADS_OUT || 'osm-leads-import.json';
const DRY_RUN = process.argv.includes('--dry-run');
const IMPORT_ONLY = process.argv.includes('--import-file');
const EXPANSION_ONLY = process.argv.includes('--expansion-only');
const MAX_PER_CITY = Number(process.env.OSM_MAX_PER_CITY || 160);
const OVERPASS_URL = process.env.OVERPASS_URL || 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';
const BATCH_SIZE = Number(process.env.OSM_IMPORT_BATCH_SIZE || 25);

const cities = [
  { name: 'Necochea', region: 'Buenos Aires', bbox: [-58.86, -38.66, -58.66, -38.48] },
  { name: 'Tandil', region: 'Buenos Aires', bbox: [-59.24, -37.42, -58.93, -37.20] },
  { name: 'Mar del Plata', region: 'Buenos Aires', bbox: [-57.68, -38.12, -57.47, -37.86] },
  { name: 'Bahia Blanca', region: 'Buenos Aires', bbox: [-62.38, -38.83, -62.12, -38.62] },
  { name: 'La Plata', region: 'Buenos Aires', bbox: [-58.08, -35.03, -57.82, -34.82] },
  { name: 'CABA', region: 'Buenos Aires', bbox: [-58.54, -34.71, -58.33, -34.52] },
  { name: 'Rosario', region: 'Santa Fe', bbox: [-60.80, -33.04, -60.58, -32.84] },
  { name: 'Cordoba', region: 'Cordoba', bbox: [-64.32, -31.51, -64.06, -31.30] },
  { name: 'Mendoza', region: 'Mendoza', bbox: [-68.94, -32.99, -68.75, -32.80] },
  { name: 'Neuquen', region: 'Neuquen', bbox: [-68.20, -38.99, -68.00, -38.86] },
  { name: 'Santa Fe', region: 'Santa Fe', bbox: [-60.78, -31.72, -60.62, -31.55] },
  { name: 'Parana', region: 'Entre Rios', bbox: [-60.60, -31.82, -60.42, -31.68] },
  { name: 'San Miguel de Tucuman', region: 'Tucuman', bbox: [-65.31, -26.89, -65.13, -26.74] },
  { name: 'Salta', region: 'Salta', bbox: [-65.50, -24.86, -65.35, -24.73] },
  { name: 'Resistencia', region: 'Chaco', bbox: [-59.06, -27.53, -58.90, -27.37] },
  { name: 'Corrientes', region: 'Corrientes', bbox: [-58.90, -27.56, -58.74, -27.42] },
  { name: 'Posadas', region: 'Misiones', bbox: [-56.02, -27.46, -55.84, -27.32] },
  { name: 'Bariloche', region: 'Rio Negro', bbox: [-71.43, -41.22, -71.16, -41.05] },
  { name: 'San Juan', region: 'San Juan', bbox: [-68.62, -31.61, -68.45, -31.47] },
  { name: 'Jujuy', region: 'Jujuy', bbox: [-65.38, -24.24, -65.20, -24.13] },
  { name: 'Quilmes', region: 'Buenos Aires', bbox: [-58.33, -34.78, -58.20, -34.66], group: 'expansion' },
  { name: 'Avellaneda', region: 'Buenos Aires', bbox: [-58.42, -34.71, -58.31, -34.62], group: 'expansion' },
  { name: 'Lanus', region: 'Buenos Aires', bbox: [-58.45, -34.75, -58.34, -34.66], group: 'expansion' },
  { name: 'Lomas de Zamora', region: 'Buenos Aires', bbox: [-58.49, -34.82, -58.36, -34.70], group: 'expansion' },
  { name: 'Moron', region: 'Buenos Aires', bbox: [-58.68, -34.70, -58.56, -34.59], group: 'expansion' },
  { name: 'San Isidro', region: 'Buenos Aires', bbox: [-58.59, -34.52, -58.45, -34.43], group: 'expansion' },
  { name: 'Tigre', region: 'Buenos Aires', bbox: [-58.70, -34.49, -58.48, -34.35], group: 'expansion' },
  { name: 'Pilar', region: 'Buenos Aires', bbox: [-58.98, -34.52, -58.78, -34.38], group: 'expansion' },
  { name: 'San Miguel', region: 'Buenos Aires', bbox: [-58.79, -34.60, -58.64, -34.49], group: 'expansion' },
  { name: 'Moreno', region: 'Buenos Aires', bbox: [-58.88, -34.70, -58.72, -34.55], group: 'expansion' },
  { name: 'Merlo', region: 'Buenos Aires', bbox: [-58.82, -34.75, -58.65, -34.60], group: 'expansion' },
  { name: 'Lujan', region: 'Buenos Aires', bbox: [-59.00, -34.66, -58.86, -34.52], group: 'expansion' },
  { name: 'Campana', region: 'Buenos Aires', bbox: [-58.99, -34.22, -58.88, -34.12], group: 'expansion' },
  { name: 'Zarate', region: 'Buenos Aires', bbox: [-59.08, -34.15, -58.98, -34.05], group: 'expansion' },
  { name: 'Pergamino', region: 'Buenos Aires', bbox: [-60.65, -33.95, -60.48, -33.82], group: 'expansion' },
  { name: 'Junin', region: 'Buenos Aires', bbox: [-61.03, -34.67, -60.86, -34.52], group: 'expansion' },
  { name: 'Olavarria', region: 'Buenos Aires', bbox: [-60.40, -36.96, -60.22, -36.82], group: 'expansion' },
  { name: 'Azul', region: 'Buenos Aires', bbox: [-59.95, -36.85, -59.75, -36.68], group: 'expansion' },
  { name: 'Tres Arroyos', region: 'Buenos Aires', bbox: [-60.35, -38.45, -60.20, -38.30], group: 'expansion' },
  { name: 'Pinamar', region: 'Buenos Aires', bbox: [-56.95, -37.16, -56.82, -37.03], group: 'expansion' },
  { name: 'Villa Gesell', region: 'Buenos Aires', bbox: [-57.10, -37.33, -56.94, -37.20], group: 'expansion' },
  { name: 'Miramar', region: 'Buenos Aires', bbox: [-57.90, -38.35, -57.77, -38.22], group: 'expansion' },
  { name: 'Rio Cuarto', region: 'Cordoba', bbox: [-64.43, -33.18, -64.25, -33.05], group: 'expansion' },
  { name: 'Villa Maria', region: 'Cordoba', bbox: [-63.32, -32.48, -63.18, -32.35], group: 'expansion' },
  { name: 'Villa Carlos Paz', region: 'Cordoba', bbox: [-64.55, -31.47, -64.43, -31.35], group: 'expansion' },
  { name: 'Rafaela', region: 'Santa Fe', bbox: [-61.58, -31.32, -61.42, -31.20], group: 'expansion' },
  { name: 'Venado Tuerto', region: 'Santa Fe', bbox: [-61.99, -33.80, -61.85, -33.68], group: 'expansion' },
  { name: 'Concordia', region: 'Entre Rios', bbox: [-58.10, -31.45, -57.90, -31.28], group: 'expansion' },
  { name: 'Gualeguaychu', region: 'Entre Rios', bbox: [-58.60, -33.08, -58.40, -32.95], group: 'expansion' },
  { name: 'San Rafael', region: 'Mendoza', bbox: [-68.45, -34.70, -68.25, -34.55], group: 'expansion' },
  { name: 'Maipu Mendoza', region: 'Mendoza', bbox: [-68.85, -33.05, -68.70, -32.92], group: 'expansion' },
  { name: 'Godoy Cruz', region: 'Mendoza', bbox: [-68.90, -32.96, -68.78, -32.86], group: 'expansion' },
  { name: 'Cipolletti', region: 'Rio Negro', bbox: [-68.05, -38.98, -67.90, -38.88], group: 'expansion' },
  { name: 'General Roca', region: 'Rio Negro', bbox: [-67.70, -39.10, -67.55, -38.98], group: 'expansion' },
  { name: 'Viedma', region: 'Rio Negro', bbox: [-63.05, -40.90, -62.88, -40.78], group: 'expansion' },
  { name: 'Trelew', region: 'Chubut', bbox: [-65.40, -43.32, -65.20, -43.20], group: 'expansion' },
  { name: 'Puerto Madryn', region: 'Chubut', bbox: [-65.15, -42.84, -64.95, -42.70], group: 'expansion' },
  { name: 'Comodoro Rivadavia', region: 'Chubut', bbox: [-67.65, -45.93, -67.40, -45.75], group: 'expansion' },
  { name: 'Rio Gallegos', region: 'Santa Cruz', bbox: [-69.35, -51.68, -69.15, -51.55], group: 'expansion' },
  { name: 'Ushuaia', region: 'Tierra del Fuego', bbox: [-68.45, -54.88, -68.20, -54.75], group: 'expansion' },
  { name: 'Formosa', region: 'Formosa', bbox: [-58.25, -26.25, -58.10, -26.12], group: 'expansion' },
  { name: 'La Rioja', region: 'La Rioja', bbox: [-66.95, -29.50, -66.75, -29.35], group: 'expansion' },
  { name: 'Catamarca', region: 'Catamarca', bbox: [-65.85, -28.55, -65.68, -28.40], group: 'expansion' },
  { name: 'Santiago del Estero', region: 'Santiago del Estero', bbox: [-64.35, -27.85, -64.18, -27.70], group: 'expansion' },
  { name: 'San Luis', region: 'San Luis', bbox: [-66.42, -33.38, -66.25, -33.22], group: 'expansion' },
  { name: 'Villa Mercedes', region: 'San Luis', bbox: [-65.55, -33.75, -65.35, -33.60], group: 'expansion' },
  { name: 'Reconquista', region: 'Santa Fe', bbox: [-59.78, -29.22, -59.58, -29.08], group: 'expansion' },
  { name: 'Obera', region: 'Misiones', bbox: [-55.18, -27.55, -55.05, -27.42], group: 'expansion' },
  { name: 'Eldorado', region: 'Misiones', bbox: [-54.75, -26.45, -54.55, -26.32], group: 'expansion' },
];

const wantedTags = [
  ['shop'],
  ['amenity', 'restaurant|cafe|bar|pub|fast_food|ice_cream|veterinary|dentist|doctors|clinic'],
  ['tourism', 'hotel|hostel|guest_house|apartment'],
  ['leisure', 'fitness_centre|sports_centre|dance'],
  ['office', 'estate_agent|lawyer|accountant|insurance|company|travel_agent|architect'],
  ['craft'],
];

const categoryLabels = {
  restaurant: 'Restaurante',
  cafe: 'Cafe',
  bar: 'Bar',
  pub: 'Bar',
  fast_food: 'Comida rapida',
  ice_cream: 'Heladeria',
  hotel: 'Hotel',
  hostel: 'Hostel',
  guest_house: 'Alojamiento',
  apartment: 'Alojamiento',
  fitness_centre: 'Gimnasio',
  sports_centre: 'Centro deportivo',
  dance: 'Danza',
  veterinary: 'Veterinaria',
  dentist: 'Odontologia',
  doctors: 'Consultorio medico',
  clinic: 'Clinica',
  estate_agent: 'Inmobiliaria',
  lawyer: 'Estudio juridico',
  accountant: 'Contable',
  insurance: 'Seguros',
  travel_agent: 'Turismo',
  architect: 'Arquitectura',
  clothes: 'Indumentaria',
  hairdresser: 'Peluqueria',
  beauty: 'Estetica',
  furniture: 'Muebleria',
  hardware: 'Ferreteria',
  bakery: 'Panaderia',
  car_repair: 'Taller mecanico',
};

function overpassQuery(city) {
  const [w, s, e, n] = city.bbox;
  const bbox = `${s},${w},${n},${e}`;
  const filters = wantedTags
    .map(([key, values]) => {
      const valueFilter = values ? `["${key}"~"^(${values})$"]` : `["${key}"]`;
      return `node["name"]${valueFilter}(${bbox});way["name"]${valueFilter}(${bbox});relation["name"]${valueFilter}(${bbox});`;
    })
    .join('');
  return `[out:json][timeout:60];(${filters});out center tags;`;
}

async function fetchOverpass(city) {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      Accept: 'application/json',
      'User-Agent': 'RakiumLeadResearch/1.0 (https://rakium.dev)',
    },
    body: overpassQuery(city),
  });
  if (!res.ok) {
    throw new Error(`Overpass ${city.name} ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.elements || [];
}

function getTag(tags, names) {
  for (const name of names) {
    const value = tags?.[name];
    if (value) return String(value).trim();
  }
  return undefined;
}

function categoryFrom(tags) {
  const raw =
    getTag(tags, ['shop']) ||
    getTag(tags, ['amenity']) ||
    getTag(tags, ['tourism']) ||
    getTag(tags, ['leisure']) ||
    getTag(tags, ['office']) ||
    getTag(tags, ['craft']);
  return categoryLabels[raw] || (raw ? raw.replace(/_/g, ' ') : undefined);
}

function addressFrom(tags) {
  const street = getTag(tags, ['addr:street']);
  const number = getTag(tags, ['addr:housenumber']);
  const city = getTag(tags, ['addr:city']);
  const parts = [street && number ? `${street} ${number}` : street || number, city].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

function socialUrl(value, network) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const clean = value.replace(/^@/, '').trim();
  return network === 'instagram' ? `https://instagram.com/${clean}` : clean;
}

function scoreLead(lead) {
  let score = 25;
  if (!lead.website) score += 35;
  if (lead.instagram) score += 20;
  if (!lead.instagram && !lead.facebook) score += 10;
  if (lead.phone) score += 8;
  if (lead.category) score += 7;
  return Math.min(score, 100);
}

function toLead(element, city) {
  const tags = element.tags || {};
  const website = getTag(tags, ['website', 'contact:website', 'url']);
  const instagram = socialUrl(getTag(tags, ['contact:instagram', 'instagram']), 'instagram');
  const facebook = socialUrl(getTag(tags, ['contact:facebook', 'facebook']), 'facebook');
  const phone = getTag(tags, ['phone', 'contact:phone']);
  const email = getTag(tags, ['email', 'contact:email']);
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  const category = categoryFrom(tags);
  const name = String(tags.name || '').trim();
  if (!name || !lat || !lon || !category) return null;

  const needsWebsite = !website;
  const sourceId = `osm:${element.type}/${element.id}`;
  const lead = {
    name,
    city: city.name,
    region: city.region,
    category,
    address: addressFrom(tags),
    latitude: lat,
    longitude: lon,
    phone,
    email,
    website,
    instagram,
    facebook,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
    source: 'CSV',
    sourceId,
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    needsWebsite,
    instagramQuality: instagram ? 'UNKNOWN' : undefined,
    priority: needsWebsite ? (phone || instagram || facebook ? 5 : 4) : 2,
    status: 'NEW',
    tags: ['osm', 'argentina', city.region, category].filter(Boolean),
    checklist: {
      hasWebsite: !!website,
      hasPhone: !!phone,
      hasInstagram: !!instagram,
      sourceReviewed: 'OpenStreetMap',
      needsManualInstagramReview: !instagram,
    },
    estimatedValue: needsWebsite ? 250000 : 120000,
    suggestedMessage: `Hola! Somos Rakium.dev. Vimos ${name} y creemos que podemos ayudarles a conseguir mas consultas con una web clara y mejor presencia digital. Te puedo mandar una idea puntual para ${category}?`,
    notes: `Lead importado desde OpenStreetMap. Prioridad calculada por presencia digital publica: ${needsWebsite ? 'sin website detectada' : 'website detectada'}. Revisar Instagram/branding antes de contactar.`,
  };
  lead.digitalPresenceScore = scoreLead(lead);
  return lead;
}

async function login() {
  if (!ADMIN_PASSWORD) {
    throw new Error('Set RAKIUM_ADMIN_PASSWORD before importing leads.');
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login fallido ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function bulkImport(token, leads) {
  const summary = { created: 0, updated: 0, skipped: 0, total: 0 };
  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${API_URL}/leads/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leads: batch }),
    });
    if (!res.ok) throw new Error(`Import fallido ${res.status}: ${await res.text()}`);
    const data = await res.json();
    summary.created += data.created || 0;
    summary.updated += data.updated || 0;
    summary.skipped += data.skipped || 0;
    summary.total += data.total || 0;
    console.log(`Import batch ${i / 100 + 1}: created=${data.created} updated=${data.updated} skipped=${data.skipped}`);
  }
  return summary;
}

async function main() {
  if (IMPORT_ONLY) {
    const filePayload = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    const token = await login();
    const summary = await bulkImport(token, filePayload.leads || []);
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const bySource = new Map();
  const targetCities = EXPANSION_ONLY ? cities.filter((city) => city.group === 'expansion') : cities;
  for (const city of targetCities) {
    try {
      const elements = await fetchOverpass(city);
      const cityLeads = elements
        .map((element) => toLead(element, city))
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority || b.digitalPresenceScore - a.digitalPresenceScore)
        .slice(0, MAX_PER_CITY);
      for (const lead of cityLeads) bySource.set(lead.sourceId, lead);
      console.log(`${city.name}: ${elements.length} OSM results, ${cityLeads.length} selected`);
    } catch (error) {
      console.error(`${city.name}: ${error.message}`);
    }
  }

  const leads = [...bySource.values()].sort(
    (a, b) => b.priority - a.priority || b.digitalPresenceScore - a.digitalPresenceScore || a.city.localeCompare(b.city),
  );
  fs.writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), count: leads.length, leads }, null, 2));
  console.log(`Generated ${leads.length} leads in ${OUT_FILE}`);

  if (DRY_RUN) return;
  const token = await login();
  const summary = await bulkImport(token, leads);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
