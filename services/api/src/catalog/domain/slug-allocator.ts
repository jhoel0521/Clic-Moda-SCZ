import { Slug } from './value-objects/names.vo.js';

const MAX_ATTEMPTS = 1000;

// Primer slug libre a partir del base: "bota", "bota-2", "bota-3"… `taken` dice si ya está en uso.
export async function allocateSlug(
  base: Slug,
  taken: (candidate: Slug) => Promise<boolean>
): Promise<Slug> {
  if (!(await taken(base))) return base;
  for (let n = 2; n <= MAX_ATTEMPTS; n++) {
    const candidate = base.withSuffix(n);
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error('No se pudo asignar un slug libre al producto');
}
