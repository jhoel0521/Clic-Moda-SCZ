import { MediaAsset } from '../domain/entities/media-asset.entity.js';
import { MediaVariant } from '../domain/entities/media-variant.entity.js';
import type { MediaAssetsRepository } from '../domain/media-assets.repository.port.js';
import {
  AltText,
  FocalPoint,
  Framing,
  ImageDimensions,
  Revision,
} from '../domain/value-objects/image-values.vo.js';
import { MediaFormat } from '../domain/value-objects/media-format.vo.js';
import { MediaId } from '../domain/value-objects/media-id.vo.js';

type Factory = () => Promise<MediaAssetsRepository> | MediaAssetsRepository;

const asset = (createdAt = new Date()): MediaAsset =>
  MediaAsset.create(
    {
      alt: AltText.of('Bota Andes de perfil'),
      framing: Framing.of(FocalPoint.of(0.3, 0.7), 'contain', '#101010'),
      dimensions: ImageDimensions.of(3000, 2000),
      masterMime: 'image/jpeg',
    },
    createdAt
  );

const variant = (owner: MediaAsset, format: string, revision: number, createdAt = new Date()) =>
  MediaVariant.create({
    assetId: owner.id,
    format: MediaFormat.of(format),
    revision: Revision.of(revision),
    dimensions: ImageDimensions.of(1200, 630),
    bytes: 100_000,
    createdAt,
  });

function assetCases(make: Factory): void {
  it('findById devuelve null si no existe', async () => {
    expect(await (await make()).findById(MediaId.generate())).toBeNull();
  });

  it('guarda una imagen y la recupera con todos sus datos', async () => {
    const [repo, saved] = [await make(), asset()];
    await repo.save(saved);

    const found = await repo.findById(saved.id);
    expect([found?.alt.value, found?.framing.focal.x, found?.framing.fit]).toEqual([
      'Bota Andes de perfil',
      0.3,
      'contain',
    ]);
    expect([found?.framing.background, found?.dimensions.width, found?.revision.value]).toEqual([
      '#101010',
      3000,
      1,
    ]);
  });
}

function bulkCases(make: Factory): void {
  it('findByIds devuelve solo las que existen, en una sola llamada', async () => {
    const [repo, a, b] = [await make(), asset(), asset()];
    await repo.save(a);
    await repo.save(b);

    const found = await repo.findByIds([a.id, MediaId.generate(), b.id]);

    expect(found.map((item) => item.id.value).sort()).toEqual([a.id.value, b.id.value].sort());
  });

  it('findByIds sin identificadores devuelve una lista vacía', async () => {
    expect(await (await make()).findByIds([])).toEqual([]);
  });
}

function assetUpdateCases(make: Factory): void {
  it('save actualiza por id: reencuadrar sube la revisión', async () => {
    const [repo, saved] = [await make(), asset()];
    await repo.save(saved);
    saved.reframe(Framing.of(FocalPoint.of(0.9, 0.1)));
    await repo.save(saved);

    expect((await repo.findById(saved.id))?.revision.value).toBe(2);
    expect(await repo.list()).toHaveLength(1);
  });

  it('list ordena de la más reciente a la más antigua', async () => {
    const repo = await make();
    const [old, recent] = [asset(new Date('2026-01-01')), asset(new Date('2026-06-01'))];
    await repo.save(old);
    await repo.save(recent);

    expect((await repo.list()).map((a) => a.id.value)).toEqual([recent.id.value, old.id.value]);
  });
}

function variantCases(make: Factory): void {
  it('guarda variantes y las encuentra por imagen, formato y revisión', async () => {
    const [repo, owner] = [await make(), asset()];
    await repo.save(owner);
    await repo.saveVariants([variant(owner, 'link', 1), variant(owner, 'story', 1)]);

    const found = await repo.findVariant(owner.id, MediaFormat.of('link'), Revision.first());
    expect([found?.bytes, found?.storageKey]).toEqual([100_000, `m/${owner.id.value}/link-1.jpg`]);
    expect(await repo.listVariants(owner.id)).toHaveLength(2);
  });

  it('findVariant devuelve null si no existe esa revisión', async () => {
    const [repo, owner] = [await make(), asset()];
    await repo.save(owner);

    expect(await repo.findVariant(owner.id, MediaFormat.of('link'), Revision.of(5))).toBeNull();
  });
}

function variantReplaceCases(make: Factory): void {
  it('guardar otra vez la misma variante la reemplaza, no la duplica', async () => {
    const [repo, owner] = [await make(), asset()];
    await repo.save(owner);
    await repo.saveVariants([variant(owner, 'link', 1)]);
    await repo.saveVariants([variant(owner, 'link', 1)]);

    expect(await repo.listVariants(owner.id)).toHaveLength(1);
  });

  it('delete borra la imagen y sus variantes', async () => {
    const [repo, owner] = [await make(), asset()];
    await repo.save(owner);
    await repo.saveVariants([variant(owner, 'link', 1)]);
    await repo.delete(owner.id);

    expect(await repo.findById(owner.id)).toBeNull();
    expect(await repo.listVariants(owner.id)).toEqual([]);
  });
}

function obsoleteCases(make: Factory): void {
  const [old, recent] = [new Date('2026-01-01'), new Date('2026-06-01')];
  const cutoff = new Date('2026-03-01');

  async function seed(repo: MediaAssetsRepository) {
    const owner = asset();
    await repo.save(owner);
    owner.reframe(Framing.default());
    await repo.save(owner);
    await repo.saveVariants([variant(owner, 'link', 1, old), variant(owner, 'link', 2, old)]);
    await repo.saveVariants([variant(owner, 'story', 1, recent)]);
    return owner;
  }

  it('solo devuelve variantes de revisiones anteriores y más viejas que el corte', async () => {
    const repo = await make();
    await seed(repo);

    const obsolete = await repo.findObsoleteVariants(cutoff);

    expect(obsolete.map((v) => v.storageKey.split('/')[2])).toEqual(['link-1.jpg']);
  });

  it('deleteVariants las borra y deja las demás', async () => {
    const repo = await make();
    const owner = await seed(repo);
    await repo.deleteVariants(await repo.findObsoleteVariants(cutoff));

    expect(await repo.listVariants(owner.id)).toHaveLength(2);
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function mediaAssetsRepositoryContract(label: string, make: Factory): void {
  describe(`MediaAssetsRepository: ${label}`, () => {
    assetCases(make);
    assetUpdateCases(make);
    bulkCases(make);
    variantCases(make);
    variantReplaceCases(make);
    obsoleteCases(make);
  });
}
