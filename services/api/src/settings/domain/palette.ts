// Paleta de la tienda a partir de UN color primario. Módulo PURO y sin dependencias: el admin copia esta
// misma lógica (src/lib/palette.ts) para la vista previa, con casos de prueba fijos idénticos.
export interface Palette {
  primary: string;
  dark: string;
  light: string;
  soft: string;
  onPrimary: string;
}

export interface ContrastReport {
  ok: boolean;
  reasons: string[];
  /** Mismo matiz con menos luminosidad que sí cumple; null si no existe. */
  suggestion: string | null;
}

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export const WHITE = '#ffffff';
export const PAGE_BACKGROUND = '#ffffff';
export const TEXT_ON_SOFT = '#24151c';
export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_UI_CONTRAST = 3;

type Rgb = [number, number, number];
type Hsl = [number, number, number];

const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;

const toHex = (rgb: Rgb): string =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

const channel = (v: number): number => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const [r, g, b] = toRgb(hex).map(channel) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function toHsl(hex: string): Hsl {
  const [r, g, b] = toRgb(hex).map((v) => v / 255) as Rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl([h, s, l]: Hsl): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): number => {
    const k = (n + h / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return toHex([f(0), f(8), f(4)]);
}

const withLightness = (hex: string, lightness: number): string => {
  const [h, s] = toHsl(hex);
  return fromHsl([h, s, Math.min(Math.max(lightness, 0), 1)]);
};

// Mezcla con blanco (amount 0 = color, 1 = blanco).
const tint = (hex: string, amount: number): string =>
  toHex(toRgb(hex).map((v) => v + (255 - v) * amount) as Rgb);

export function derivePalette(primary: string): Palette {
  const base = primary.toLowerCase();
  const l = toHsl(base)[2];
  return {
    primary: base,
    dark: withLightness(base, l - 0.1),
    light: withLightness(base, l + 0.15),
    soft: tint(base, 0.92),
    onPrimary: WHITE,
  };
}

function reasonsFor(color: string): string[] {
  const reasons: string[] = [];
  const onWhite = contrastRatio(WHITE, color);
  if (onWhite < MIN_TEXT_CONTRAST) {
    reasons.push(
      `El texto blanco sobre este color tiene contraste ${onWhite.toFixed(2)}:1 y se pide ${String(MIN_TEXT_CONTRAST)}:1`
    );
  }
  if (contrastRatio(color, PAGE_BACKGROUND) < MIN_UI_CONTRAST) {
    reasons.push(
      `Contra el fondo de la página el contraste es menor a ${String(MIN_UI_CONTRAST)}:1`
    );
  }
  return reasons;
}

const passes = (color: string): boolean => reasonsFor(color).length === 0;

// Mismo matiz, baja la luminosidad en pasos de 1 % hasta cumplir.
export function nearestPassing(color: string): string | null {
  const start = toHsl(color)[2];
  for (let step = 1; start - step / 100 >= 0.05; step++) {
    const candidate = withLightness(color, start - step / 100);
    if (passes(candidate)) return candidate;
  }
  return null;
}

export function checkContrast(color: string): ContrastReport {
  const reasons = reasonsFor(color.toLowerCase());
  return {
    ok: reasons.length === 0,
    reasons,
    suggestion: reasons.length ? nearestPassing(color.toLowerCase()) : null,
  };
}

// La variante suave (fondos claros) debe dejar leer el texto del estándar.
export const softIsReadable = (palette: Palette): boolean =>
  contrastRatio(TEXT_ON_SOFT, palette.soft) >= MIN_TEXT_CONTRAST;
