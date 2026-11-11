import { z } from 'zod';
import type { MediaAssetResult } from '../../application/dtos/media.dtos.js';

// DTOs de petición HTTP: único lugar donde se valida el formato de transporte.
const fit = z.enum(['cover', 'contain']);

// Los campos de un formulario multipart llegan como texto.
export const uploadFieldsSchema = z.object({
  alt: z.string().max(500),
  fit: fit.default('cover'),
  background: z.string().max(20).default('#ffffff'),
  focalX: z.coerce.number().default(0.5),
  focalY: z.coerce.number().default(0.5),
});
export type UploadFieldsDto = z.infer<typeof uploadFieldsSchema>;

export const framingRequestSchema = z.object({
  focalX: z.number(),
  focalY: z.number(),
  fit: fit.optional(),
  background: z.string().max(20).optional(),
});
export type FramingRequestDto = z.infer<typeof framingRequestSchema>;

// Nombre de archivo público: <formato>-<revisión>.<extensión>
export const PUBLIC_FILE = /^([a-z]+)-(\d+)\.(jpg|webp)$/;

// DTO de respuesta HTTP.
export interface MediaResponseDto {
  id: string;
  alt: string;
  focal: { x: number; y: number };
  fit: 'cover' | 'contain';
  background: string;
  width: number;
  height: number;
  revision: number;
  published: boolean;
  createdAt: string;
  variants: {
    format: string;
    revision: number;
    width: number;
    height: number;
    bytes: number;
    url: string;
  }[];
}

// Mapper aplicación -> HTTP.
export const toMediaResponse = (result: MediaAssetResult): MediaResponseDto => ({
  id: result.id,
  alt: result.alt,
  focal: { ...result.focal },
  fit: result.fit,
  background: result.background,
  width: result.width,
  height: result.height,
  revision: result.revision,
  published: result.published,
  createdAt: result.createdAt.toISOString(),
  variants: result.variants.map((variant) => ({ ...variant })),
});
