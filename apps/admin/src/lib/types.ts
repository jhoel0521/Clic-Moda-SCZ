// Formas de las respuestas de la API que usa el panel.
export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  productCount: number;
}

export interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string | null;
  price: string; // "349.90"
  active: boolean;
}

// `available`: unidades disponibles (suma de las variantes activas); solo viene en los listados.
export interface Product {
  available?: number;
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  active: boolean;
  variants: Variant[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const errorMessage = (failure: unknown): string =>
  failure instanceof Error ? failure.message : 'Ocurrió un error inesperado';
