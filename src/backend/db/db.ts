import fs from 'fs';
import path from 'path';
import type { IUser, IProduct, IOrder, ICuponDescuento, IResena, IBannerPromocional } from '@src/core/models';

export interface Database {
  users: IUser[];
  products: IProduct[];
  orders: IOrder[];
  coupons: ICuponDescuento[];
  reviews: IResena[];
  banners: IBannerPromocional[];
}

// Extendemos IUser para incluir el password en la base de datos
export interface IUserWithPassword extends IUser {
  password: string;
}

export interface FullDatabase extends Omit<Database, 'users'> {
  users: IUserWithPassword[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

/**
 * Obtiene el estado actual de la base de datos.
 */
export function getDb(): FullDatabase {
  if (!fs.existsSync(DB_PATH)) {
    // Si no existe, inicializamos una estructura vacía (esto no debería pasar tras el seed)
    return {
      users: [],
      products: [],
      orders: [],
      coupons: [],
      reviews: [],
      banners: [],
    };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

/**
 * Guarda el estado de la base de datos en el archivo.
 */
export function saveDb(db: FullDatabase): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Busca todos los elementos de una tabla.
 */
export function findAll<K extends keyof FullDatabase>(table: K): FullDatabase[K] {
  const db = getDb();
  return db[table];
}

/**
 * Busca un elemento por su ID en una tabla.
 */
export function findById<T extends { id: string }>(table: keyof FullDatabase, id: string): T | null {
  const db = getDb();
  const list = db[table] as unknown as T[];
  return list.find((item) => item.id === id) ?? null;
}

/**
 * Inserta un nuevo elemento en una tabla.
 */
export function insert<T extends { id: string }>(table: keyof FullDatabase, item: T): T {
  const db = getDb();
  (db[table] as any[]).push(item);
  saveDb(db);
  return item;
}

/**
 * Actualiza un elemento existente en una tabla.
 */
export function update<T extends { id: string }>(table: keyof FullDatabase, item: T): T {
  const db = getDb();
  const list = db[table] as any[];
  const index = list.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    list[index] = item;
    saveDb(db);
  }
  return item;
}

/**
 * Elimina un elemento de una tabla por su ID.
 */
export function remove(table: keyof FullDatabase, id: string): void {
  const db = getDb();
  const list = db[table] as any[];
  const index = list.findIndex((i) => i.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    saveDb(db);
  }
}
