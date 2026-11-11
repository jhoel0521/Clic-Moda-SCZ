import type { CropPlan } from '../domain/crop.js';
import { ImageDimensions } from '../domain/value-objects/image-values.vo.js';
import type { MediaFormat } from '../domain/value-objects/media-format.vo.js';
import type {
  ImageInfo,
  ImageProcessorPort,
  NormalizedImage,
} from '../application/ports/image-processor.port.js';

// Imagen de mentira para pruebas: la "foto" es un JSON con el tipo y las medidas. No hay píxeles.
export const fakeImage = (type: ImageInfo['type'], width: number, height: number): Buffer =>
  Buffer.from(JSON.stringify({ type, width, height }));

export class FakeImageProcessor implements ImageProcessorPort {
  readonly rendered: { format: string; plan: CropPlan }[] = [];

  inspect(input: Buffer): Promise<ImageInfo | null> {
    try {
      const parsed = JSON.parse(input.toString()) as Partial<ImageInfo>;
      const valid = ['jpeg', 'png', 'webp'].includes(parsed.type ?? '');
      return Promise.resolve(valid ? (parsed as ImageInfo) : null);
    } catch {
      return Promise.resolve(null);
    }
  }

  async normalize(input: Buffer, maxSide: number): Promise<NormalizedImage> {
    const info = (await this.inspect(input)) as ImageInfo;
    const scale = Math.min(1, maxSide / Math.max(info.width, info.height));
    const dimensions = ImageDimensions.of(
      Math.round(info.width * scale),
      Math.round(info.height * scale)
    );
    const mime = info.type === 'png' ? 'image/png' : 'image/jpeg';
    return { buffer: fakeImage(info.type, dimensions.width, dimensions.height), mime, dimensions };
  }

  render(_master: Buffer, format: MediaFormat, plan: CropPlan): Promise<Buffer> {
    this.rendered.push({ format: format.name, plan });
    return Promise.resolve(Buffer.from(`${format.name}:${JSON.stringify(plan)}`));
  }
}
