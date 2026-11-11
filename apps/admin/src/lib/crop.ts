// Geometría del recorte: COPIA de services/api/src/media/domain/crop.ts (misma fórmula, mismos casos de
// prueba) para que la vista previa del panel muestre exactamente lo que genera la API. Si uno cambia,
// debe cambiar el otro: los casos fijos de crop.test.ts son idénticos en ambos proyectos.
export type FormatName = 'link' | 'square' | 'portrait' | 'story' | 'thumb' | 'card';
export type FitMode = 'cover' | 'contain';

export interface Size {
  width: number;
  height: number;
}

export interface Framing {
  focalX: number;
  focalY: number;
  fit: FitMode;
  background: string;
}

export type CropPlan =
  | { fit: 'cover'; x: number; y: number; width: number; height: number }
  | { fit: 'contain'; background: string; left: number; top: number; width: number; height: number };

export const FORMAT_SIZES: Record<FormatName, Size> = {
  link: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  thumb: { width: 320, height: 320 },
  card: { width: 800, height: 1000 },
};

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

function coverPlan(src: Size, out: Size, framing: Framing): CropPlan {
  const scale = Math.max(out.width / src.width, out.height / src.height);
  const width = Math.min(src.width, Math.round(out.width / scale));
  const height = Math.min(src.height, Math.round(out.height / scale));
  const x = clamp(Math.round(framing.focalX * src.width - width / 2), 0, src.width - width);
  const y = clamp(Math.round(framing.focalY * src.height - height / 2), 0, src.height - height);
  return { fit: 'cover', x, y, width, height };
}

function containPlan(src: Size, out: Size, background: string): CropPlan {
  const scale = Math.min(out.width / src.width, out.height / src.height);
  const width = Math.round(src.width * scale);
  const height = Math.round(src.height * scale);
  const left = Math.floor((out.width - width) / 2);
  const top = Math.floor((out.height - height) / 2);
  return { fit: 'contain', background, left, top, width, height };
}

export function computeCrop(src: Size, format: FormatName, framing: Framing): CropPlan {
  const out = FORMAT_SIZES[format];
  return framing.fit === 'contain' ? containPlan(src, out, framing.background) : coverPlan(src, out, framing);
}

// Qué parte de la foto queda a la vista (1 = toda). Sirve para avisar de recortes agresivos.
export function visibleFraction(plan: CropPlan, src: Size): number {
  if (plan.fit === 'contain') return 1;
  return (plan.width * plan.height) / (src.width * src.height);
}
