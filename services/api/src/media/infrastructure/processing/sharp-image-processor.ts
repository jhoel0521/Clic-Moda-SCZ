import { Injectable } from '@nestjs/common';
import sharp, { type Sharp } from 'sharp';
import type {
  ImageInfo,
  ImageProcessorPort,
  NormalizedImage,
} from '../../application/ports/image-processor.port.js';
import type { CropPlan } from '../../domain/crop.js';
import { ImageDimensions } from '../../domain/value-objects/image-values.vo.js';
import type { MediaFormat } from '../../domain/value-objects/media-format.vo.js';

const SUPPORTED = ['jpeg', 'png', 'webp'] as const;
// Del más nítido al más liviano: se baja la calidad hasta cumplir el peso máximo del formato.
const JPEG_QUALITIES = [85, 78, 70, 62, 54, 46, 38];
const WEBP_QUALITY = 80;
// Tope de píxeles al decodificar: protege la memoria ante imágenes malintencionadas.
const DECODE_PIXEL_LIMIT = 50_000_000;

@Injectable()
export class SharpImageProcessor implements ImageProcessorPort {
  async inspect(input: Buffer): Promise<ImageInfo | null> {
    try {
      const meta = await sharp(input).metadata();
      const type = SUPPORTED.find((supported) => supported === meta.format);
      if (!type || !meta.width || !meta.height) return null;
      return { type, width: meta.width, height: meta.height };
    } catch {
      return null;
    }
  }

  // sharp quita los metadatos (EXIF, GPS) salvo que se pida lo contrario; rotate() aplica la orientación.
  async normalize(input: Buffer, maxSide: number): Promise<NormalizedImage> {
    const base = sharp(input, { limitInputPixels: DECODE_PIXEL_LIMIT })
      .rotate()
      .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true });
    const keepsAlpha = (await sharp(input).metadata()).hasAlpha === true;
    const out = keepsAlpha ? base.png() : base.jpeg({ quality: 92, mozjpeg: true });
    const { data, info } = await out.toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      mime: keepsAlpha ? 'image/png' : 'image/jpeg',
      dimensions: ImageDimensions.of(info.width, info.height),
    };
  }

  async render(master: Buffer, format: MediaFormat, plan: CropPlan): Promise<Buffer> {
    const canvas = await this.frame(master, format, plan);
    if (format.mime === 'image/webp') return canvas.webp({ quality: WEBP_QUALITY }).toBuffer();
    return this.jpegWithinLimit(canvas, format.maxBytes);
  }

  private async frame(master: Buffer, format: MediaFormat, plan: CropPlan): Promise<Sharp> {
    if (plan.fit === 'cover') {
      const region = { left: plan.x, top: plan.y, width: plan.width, height: plan.height };
      return sharp(master).extract(region).resize(format.width, format.height);
    }
    const inner = await sharp(master).resize(plan.width, plan.height).toBuffer();
    const background = plan.background;
    return sharp({
      create: { width: format.width, height: format.height, channels: 3, background },
    }).composite([{ input: inner, left: plan.left, top: plan.top }]);
  }

  private async jpegWithinLimit(canvas: Sharp, maxBytes?: number): Promise<Buffer> {
    let last = Buffer.alloc(0);
    for (const quality of JPEG_QUALITIES) {
      last = await canvas.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
      if (!maxBytes || last.length <= maxBytes) return last;
    }
    return last;
  }
}
