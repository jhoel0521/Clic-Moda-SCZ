// Lógica de la lista de fotos de un producto (pura, sin React). La primera foto es la principal.
export const MAX_PHOTOS = 8;

// Mueve la foto de `index` una posición (delta -1 sube, +1 baja). Fuera de rango no cambia nada.
export function move(list: readonly string[], index: number, delta: -1 | 1): string[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target] as string, next[index] as string];
  return next;
}

export const remove = (list: readonly string[], id: string): string[] => list.filter((item) => item !== id);

// Agrega al final (sin repetir y sin pasar del máximo).
export function append(list: readonly string[], id: string): string[] {
  if (list.includes(id) || list.length >= MAX_PHOTOS) return [...list];
  return [...list, id];
}

export const isDirty = (current: readonly string[], saved: readonly string[]): boolean =>
  current.length !== saved.length || current.some((id, index) => id !== saved[index]);

// Texto que se anuncia a los lectores de pantalla tras cada cambio.
export const movedMessage = (position: number, total: number): string =>
  position === 1
    ? 'Foto movida a la posición 1: ahora es la principal'
    : `Foto movida a la posición ${position} de ${total}`;

// Errores de la API por foto ("photos.1" → "Foto 2: …").
export function photoErrors(issues: readonly { field: string; message: string }[]): string[] {
  return issues.map((issue) => {
    const match = /^photos\.(\d+)$/.exec(issue.field);
    return match ? `Foto ${Number(match[1]) + 1}: ${issue.message}` : issue.message;
  });
}
