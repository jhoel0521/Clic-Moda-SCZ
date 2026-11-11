import {
  AltText,
  FocalPoint,
  Framing,
  ImageDimensions,
  Revision,
} from '../value-objects/image-values.vo.js';
import { MediaFormat } from '../value-objects/media-format.vo.js';
import { MediaAsset } from './media-asset.entity.js';
import { MediaVariant } from './media-variant.entity.js';

const newAsset = () =>
  MediaAsset.create({
    alt: AltText.of('Bota Andes de perfil'),
    framing: Framing.default(),
    dimensions: ImageDimensions.of(3000, 2000),
    masterMime: 'image/jpeg',
  });

describe('MediaAsset', () => {
  it('nace publicada, en la revisión 1 y con id propio', () => {
    const asset = newAsset();

    expect([asset.revision.value, asset.published, asset.id.value.length]).toEqual([1, true, 36]);
  });

  it('reencuadrar sube la revisión y conserva lo demás', () => {
    const asset = newAsset();
    const later = new Date('2026-11-12T10:00:00Z');

    asset.reframe(Framing.of(FocalPoint.of(0.2, 0.8)), later);

    expect([asset.revision.value, asset.framing.focal.x, asset.updatedAt]).toEqual([2, 0.2, later]);
  });

  it('cambiar el texto alternativo no crea una revisión', () => {
    const asset = newAsset();

    asset.describe(AltText.of('Otra descripción'));

    expect([asset.alt.value, asset.revision.value]).toEqual(['Otra descripción', 1]);
  });

  it('se puede despublicar y volver a publicar', () => {
    const asset = newAsset();

    asset.unpublish();
    const hidden = asset.published;
    asset.publish();

    expect([hidden, asset.published]).toEqual([false, true]);
  });
});

const variantOf = (asset: MediaAsset, format: string, revision: number) =>
  MediaVariant.create({
    assetId: asset.id,
    format: MediaFormat.of(format),
    revision: Revision.of(revision),
    dimensions: ImageDimensions.of(1200, 630),
    bytes: 120_000,
    createdAt: new Date(),
  });

describe('MediaVariant', () => {
  it('su clave de almacenamiento incluye imagen, formato, revisión y extensión', () => {
    const asset = newAsset();

    expect(variantOf(asset, 'link', 3).storageKey).toBe(`m/${asset.id.value}/link-3.jpg`);
  });

  it('las variantes WebP usan la extensión webp', () => {
    expect(variantOf(newAsset(), 'card', 1).storageKey.endsWith('/card-1.webp')).toBe(true);
  });
});
