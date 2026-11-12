// Lógica del script de fotos de desarrollo (sin tocar el disco ni la red salvo por lo que se inyecta).
// Sube cada foto por la API (POST /media: la API la guarda en el almacenamiento y registra su enlace en la
// base de datos) y la asigna al producto (PUT /catalog/products/:id/photos), igual que el panel.
export const MAX_PHOTOS = 8;
const FILE = /^(?<slug>[a-z0-9]+(?:-[a-z0-9]+)*)-(?<order>\d{1,2})\.(?<ext>jpe?g|png|webp)$/i;
const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// "bota-andes-2.jpg" → { slug: 'bota-andes', order: 2 }; cualquier otro nombre se ignora (null).
export function parseName(name) {
  const match = FILE.exec(name);
  if (!match?.groups) return null;
  const { slug, order, ext } = match.groups;
  return { name, slug: slug.toLowerCase(), order: Number(order), type: TYPES[ext.toLowerCase()] };
}

// Agrupa los archivos por producto, en orden (la primera foto es la principal), hasta 8.
export function groupBySlug(names) {
  const groups = new Map();
  for (const file of names.map(parseName).filter(Boolean)) {
    groups.set(file.slug, [...(groups.get(file.slug) ?? []), file]);
  }
  for (const [slug, files] of groups) {
    groups.set(slug, files.sort((a, b) => a.order - b.order).slice(0, MAX_PHOTOS));
  }
  return groups;
}

// Qué se hace con cada producto: subir, o saltarlo con el motivo (no existe, ya tiene fotos).
export function plan(groups, products, { force = false } = {}) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return [...groups].map(([slug, files]) => {
    const product = bySlug.get(slug);
    if (!product) return { slug, files, skip: 'no existe ese producto' };
    if (product.photos.length > 0 && !force) return { slug, files, skip: 'ya tiene fotos (usa --force)' };
    return { slug, files, product };
  });
}

const json = (token, body) => ({
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

async function ok(response, what) {
  if (response.ok) return response.json();
  throw new Error(`${what}: HTTP ${response.status} ${await response.text()}`);
}

export async function login({ api, fetcher, email, password }) {
  const response = await fetcher(`${api}/auth/login`, { method: 'POST', ...json('', { email, password }) });
  return (await ok(response, 'Inicio de sesión')).accessToken;
}

export async function listProducts({ api, fetcher, token }) {
  const response = await fetcher(`${api}/catalog/products?pageSize=100`, { headers: { Authorization: `Bearer ${token}` } });
  return (await ok(response, 'Listado de productos')).items;
}

export async function uploadPhoto({ api, fetcher, token }, file, bytes, alt) {
  const form = new FormData();
  form.set('file', new Blob([bytes], { type: file.type }), file.name);
  form.set('alt', alt);
  const response = await fetcher(`${api}/media`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  return (await ok(response, `Subida de ${file.name}`)).id;
}

export async function setPhotos({ api, fetcher, token }, productId, mediaIds) {
  const response = await fetcher(`${api}/catalog/products/${productId}/photos`, { method: 'PUT', ...json(token, { mediaIds }) });
  return ok(response, 'Asignación de fotos');
}

// Sube las fotos de un producto en orden y las asigna de una vez (si algo falla no queda a medias asignado).
export async function applyPlan(ctx, item, read) {
  const { product, files } = item;
  const ids = [];
  for (const [index, file] of files.entries()) {
    ids.push(await uploadPhoto(ctx, file, await read(file.name), `${product.name}, foto ${index + 1}`));
  }
  await setPhotos(ctx, product.id, ids);
  return ids.length;
}
