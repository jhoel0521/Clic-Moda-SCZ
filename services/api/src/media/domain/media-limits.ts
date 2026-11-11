// Límites de lo que se acepta al subir una imagen.
export const MEDIA_LIMITS = {
  maxBytes: 12 * 1024 * 1024,
  maxPixels: 50_000_000,
  /** Lado corto mínimo para aceptar la imagen. */
  minShortSide: 600,
  /** Por debajo de esto se avisa (la UI) que algunos formatos saldrán con poca nitidez. */
  recommendedShortSide: 1080,
  /** Tamaño máximo por lado de la copia maestra normalizada. */
  masterMaxSide: 3000,
  /** Días que se conservan las revisiones anteriores. */
  keepObsoleteDays: 30,
} as const;
