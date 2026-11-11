import type { MediaFormat } from './value-objects/media-format.vo.js';
import type { Framing, ImageDimensions } from './value-objects/image-values.vo.js';

// Calcula cómo encuadrar la foto en un formato. Función PURA y determinista: el admin copia esta misma
// geometría (src/lib/crop.ts) para que la vista previa coincida con lo que genera la API.
export type CropPlan =
  | { fit: 'cover'; x: number; y: number; width: number; height: number }
  | {
      fit: 'contain';
      background: string;
      left: number;
      top: number;
      width: number;
      height: number;
    };

interface Box {
  width: number;
  height: number;
}

// Fondo de los formatos que conservan la transparencia (logo).
export const TRANSPARENT = 'transparent';

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

// Ventana (en píxeles de la foto) con la proporción del formato, centrada en el enfoque y sin salirse.
function coverPlan(src: Box, out: Box, focal: { x: number; y: number }): CropPlan {
  const scale = Math.max(out.width / src.width, out.height / src.height);
  const width = Math.min(src.width, Math.round(out.width / scale));
  const height = Math.min(src.height, Math.round(out.height / scale));
  const x = clamp(Math.round(focal.x * src.width - width / 2), 0, src.width - width);
  const y = clamp(Math.round(focal.y * src.height - height / 2), 0, src.height - height);
  return { fit: 'cover', x, y, width, height };
}

// La foto completa, centrada en el lienzo del formato, sobre el fondo elegido.
function containPlan(src: Box, out: Box, background: string): CropPlan {
  const scale = Math.min(out.width / src.width, out.height / src.height);
  const width = Math.round(src.width * scale);
  const height = Math.round(src.height * scale);
  const left = Math.floor((out.width - width) / 2);
  const top = Math.floor((out.height - height) / 2);
  return { fit: 'contain', background, left, top, width, height };
}

export function computeCrop(src: ImageDimensions, format: MediaFormat, framing: Framing): CropPlan {
  const out = { width: format.width, height: format.height };
  if (format.wholeOnTransparent) return containPlan(src, out, TRANSPARENT);
  if (framing.fit === 'contain') return containPlan(src, out, framing.background);
  return coverPlan(src, out, framing.focal);
}

// Qué parte de la foto queda a la vista (1 = toda). Sirve para avisar de recortes agresivos.
export function visibleFraction(plan: CropPlan, src: ImageDimensions): number {
  if (plan.fit === 'contain') return 1;
  return (plan.width * plan.height) / src.pixels;
}
