import type { Category } from './entities/category.entity.js';
import type { CategoryId } from './value-objects/ids.vo.js';
import type { CategoryName } from './value-objects/names.vo.js';

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
export interface CategoriesRepository {
  findById(id: CategoryId): Promise<Category | null>;
  // Sin distinguir mayúsculas ni espacios sobrantes (el nombre ya llega normalizado).
  findByName(name: CategoryName): Promise<Category | null>;
  // Todas las categorías, ordenadas por nombre.
  list(): Promise<Category[]>;
  // Crea o actualiza (por id). Lanza ConflictError si el nombre o el slug ya son de otra categoría.
  save(category: Category): Promise<void>;
  // Borra la categoría. La base impide borrar una con productos (el caso de uso lo comprueba antes).
  delete(id: CategoryId): Promise<void>;
}

export const CATEGORIES_REPOSITORY = Symbol('CategoriesRepository');
