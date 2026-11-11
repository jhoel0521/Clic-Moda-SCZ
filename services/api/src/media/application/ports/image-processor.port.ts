import type { CropPlan } from '../../domain/crop.js';
import type { MasterMime } from '../../domain/entities/media-asset.entity.js';
import type { ImageDimensions } from '../../domain/value-objects/image-values.vo.js';
import type { MediaFormat } from '../../domain/value-objects/media-format.vo.js';

export interface ImageInfo {
  /** Tipo real según los bytes (no según la extensión). */
  readonly type: 'jpeg' | 'png' | 'webp';
  readonly width: number;
  readonly height: number;
}

export interface NormalizedImage {
  readonly buffer: Buffer;
  readonly mime: MasterMime;
  readonly dimensions: ImageDimensions;
}

// Puerto de procesamiento de imágenes (sharp). Lo implementa infraestructura.
export interface ImageProcessorPort {
  // null si los bytes no son una imagen JPEG, PNG o WebP legible.
  inspect(input: Buffer): Promise<ImageInfo | null>;
  // Endereza la orientación, quita todos los metadatos y limita cada lado a `maxSide`.
  normalize(input: Buffer, maxSide: number): Promise<NormalizedImage>;
  // Genera el archivo del formato aplicando el recorte; respeta el peso máximo del formato.
  render(master: Buffer, format: MediaFormat, plan: CropPlan): Promise<Buffer>;
}

export const IMAGE_PROCESSOR = Symbol('ImageProcessorPort');
