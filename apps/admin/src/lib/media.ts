import type { CSSProperties } from 'react';
import {
  FORMAT_SIZES,
  computeCrop,
  visibleFraction,
  type CropPlan,
  type FitMode,
  type FormatName,
  type Framing,
  type Size,
} from './crop';

export interface MediaVariant {
  format: FormatName;
  revision: number;
  width: number;
  height: number;
  bytes: number;
  url: string;
}

export interface MediaItem {
  id: string;
  alt: string;
  focal: { x: number; y: number };
  fit: FitMode;
  background: string;
  width: number;
  height: number;
  revision: number;
  published: boolean;
  createdAt: string;
  variants: MediaVariant[];
}

export interface ShareFormat {
  name: FormatName;
  label: string;
  usage: string;
}

// Los cuatro formatos para otros canales. El mismo archivo `story` sirve al estado de WhatsApp, a las
// historias y a los reels: solo cambian las zonas seguras que tapa cada app.
export const SHARE_FORMATS: ShareFormat[] = [
  { name: 'link', label: 'Vista previa de enlace', usage: 'WhatsApp, Facebook, X y Telegram al pegar el enlace' },
  { name: 'square', label: 'Cuadrado', usage: 'Publicación de Instagram o Facebook' },
  { name: 'portrait', label: 'Vertical 4:5', usage: 'Publicación de Instagram' },
  { name: 'story', label: 'Historia 9:16', usage: 'Estado de WhatsApp, historias y reels' },
];

export interface SafeZones {
  top: number;
  bottom: number;
  sides: number;
}

export const DEFAULT_SAFE_ZONES: SafeZones = { top: 14, bottom: 35, sides: 6 };

export const RECOMMENDED_SHORT_SIDE = 1080;
export const LINK_MAX_BYTES = 300_000;
const MIN_VISIBLE = 0.5;

// Las imágenes salen por el panel (que reenvía a la API); las públicas no necesitan sesión.
export const masterUrl = (id: string): string => `/api/media/${id}/master`;
const WEBP_FORMATS: FormatName[] = ['thumb', 'card', 'logo'];
export const variantUrl = (item: MediaItem, format: FormatName): string =>
  `/api/public/media/${item.id}/${format}-${item.revision}.${WEBP_FORMATS.includes(format) ? 'webp' : 'jpg'}`;

export const framingOf = (item: MediaItem): Framing => ({
  focalX: item.focal.x,
  focalY: item.focal.y,
  fit: item.fit,
  background: item.background,
});

const sizeOf = (item: MediaItem): Size => ({ width: item.width, height: item.height });

export function planFor(item: MediaItem, format: FormatName, framing: Framing): CropPlan {
  return computeCrop(sizeOf(item), format, framing);
}

// Avisos que no impiden guardar: ayudan a decidir si conviene otra foto o el modo "completa".
export function warnings(item: MediaItem, format: FormatName, framing: Framing): string[] {
  const out: string[] = [];
  const shortSide = Math.min(item.width, item.height);
  if (shortSide < RECOMMENDED_SHORT_SIDE) {
    out.push(
      `La foto es pequeña (lado corto de ${shortSide} px): puede verse con poca nitidez en ${RECOMMENDED_SHORT_SIDE} px.`
    );
  }
  const shown = visibleFraction(planFor(item, format, framing), sizeOf(item));
  if (shown < MIN_VISIBLE) {
    out.push(`Este formato muestra solo el ${Math.round(shown * 100)} % de la foto. Prueba el modo «Foto completa».`);
  }
  const bytes = item.variants.find((v) => v.format === format)?.bytes ?? 0;
  if (format === 'link' && bytes > LINK_MAX_BYTES)
    out.push('La vista previa pesa más de 300 KB: WhatsApp puede no mostrarla.');
  return out;
}

// Estilo de la foto dentro de un recuadro con la proporción del formato (position: relative, overflow oculto).
export function previewStyle(plan: CropPlan, src: Size, format: FormatName): CSSProperties {
  const out = FORMAT_SIZES[format];
  if (plan.fit === 'contain') {
    return {
      position: 'absolute',
      left: `${(plan.left / out.width) * 100}%`,
      top: `${(plan.top / out.height) * 100}%`,
      width: `${(plan.width / out.width) * 100}%`,
      height: `${(plan.height / out.height) * 100}%`,
    };
  }
  return {
    position: 'absolute',
    maxWidth: 'none',
    width: `${(src.width / plan.width) * 100}%`,
    left: `${(-plan.x / plan.width) * 100}%`,
    top: `${(-plan.y / plan.height) * 100}%`,
  };
}

const STEP = 0.02;
const clamp01 = (n: number): number => Math.min(1, Math.max(0, Math.round(n * 1000) / 1000));

export type Direction = 'up' | 'down' | 'left' | 'right' | 'center';

// Mueve el enfoque con botones o teclado (alternativa al arrastre). `big` da pasos de 10 %.
export function nudge(focal: { x: number; y: number }, direction: Direction, big = false): { x: number; y: number } {
  const step = big ? STEP * 5 : STEP;
  if (direction === 'center') return { x: 0.5, y: 0.5 };
  const dx = direction === 'left' ? -step : direction === 'right' ? step : 0;
  const dy = direction === 'up' ? -step : direction === 'down' ? step : 0;
  return { x: clamp01(focal.x + dx), y: clamp01(focal.y + dy) };
}

// Posición del puntero dentro de un recuadro → enfoque entre 0 y 1.
export function focalFromPointer(
  point: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number }
) {
  return { x: clamp01((point.x - box.left) / box.width), y: clamp01((point.y - box.top) / box.height) };
}
