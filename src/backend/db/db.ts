import type {
  IUser,
  IProduct,
  IOrder,
  ICuponDescuento,
  IResena,
  IBannerPromocional,
  IEtiqueta,
} from '@src/core/models';
import seed from '../../../data/db.json';

export interface IUserWithPassword extends IUser {
  password: string;
}

export interface FullDatabase {
  users: IUserWithPassword[];
  products: IProduct[];
  orders: IOrder[];
  coupons: ICuponDescuento[];
  reviews: IResena[];
  banners: IBannerPromocional[];
  etiquetas: IEtiqueta[];
}

/**
 * Base de datos de la DEMO: vive en el navegador de cada visitante.
 * - Se inicializa con data/db.json (datos de ejemplo).
 * - Si localStorage falla (cuota llena, bloqueado), sigue funcionando en memoria.
 */
const STORAGE_KEY = 'clic-moda-demo-db-v1';
const DAY_MS = 24 * 60 * 60 * 1000;

let memoryDb: FullDatabase | null = null;

function freshDb(): FullDatabase {
  const db = JSON.parse(JSON.stringify(seed)) as FullDatabase;
  const now = Date.now();
  // Fechas relativas: la demo siempre se ve "viva", sin importar cuándo se abra.
  for (const product of db.products) {
    if (product.isFlashSale) product.flashSaleEndsAt = new Date(now + 2.4 * DAY_MS).toISOString();
  }
  db.orders.forEach((order, index) => {
    const date = new Date(now - index * 0.6 * DAY_MS).toISOString();
    order.createdAt = date;
    order.updatedAt = date;
  });
  return db;
}

export function getDb(): FullDatabase {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(seed)) as FullDatabase;
  if (memoryDb) return memoryDb;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FullDatabase;
  } catch {
    // Almacenamiento no disponible o dañado: se reinicia con los datos de ejemplo.
  }
  const db = freshDb();
  saveDb(db);
  return db;
}

export function saveDb(db: FullDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    memoryDb = null;
  } catch {
    memoryDb = db;
  }
}

/** Vuelve la demo a su estado inicial (botón "Reiniciar demo"). */
export function resetDb(): void {
  memoryDb = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem('clic-moda-cart');
    window.localStorage.removeItem('clic-moda-auth');
  } catch {
    // Nada que limpiar.
  }
}

export function findAll<K extends keyof FullDatabase>(table: K): FullDatabase[K] {
  return getDb()[table];
}

export function findById<T extends { id: string }>(
  table: keyof FullDatabase,
  id: string
): T | null {
  const list = getDb()[table] as unknown as T[];
  return list.find((item) => item.id === id) ?? null;
}

export function insert<T extends { id: string }>(table: keyof FullDatabase, item: T): T {
  const db = getDb();
  (db[table] as Array<{ id: string }>).push(item);
  saveDb(db);
  return item;
}

export function update<T extends { id: string }>(table: keyof FullDatabase, item: T): T {
  const db = getDb();
  const list = db[table] as Array<{ id: string }>;
  const index = list.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    list[index] = item;
    saveDb(db);
  }
  return item;
}

export function remove(table: keyof FullDatabase, id: string): void {
  const db = getDb();
  const list = db[table] as Array<{ id: string }>;
  const index = list.findIndex((i) => i.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    saveDb(db);
  }
}
