import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildSeo, linkImage, siteOrigin, type SeoInput } from './seo';

const ID = '9f3a21b4-0c1d-4e5f-8a6b-7c8d9e0f1a2b';
const base: SeoInput = {
  siteName: 'Clic Moda SC',
  title: 'Bota Andes',
  description: 'Bota de cuero con horma ancha, tallas 38 a 42.',
  path: '/p/bota-andes',
  origin: 'https://tienda.test',
};

const find = (meta: ReturnType<typeof buildSeo>['meta'], key: string) =>
  meta.find((tag) => tag.property === key || tag.name === key)?.content;

describe('absoluteUrl', () => {
  it('arma una URL absoluta desde el origen', () => {
    expect(absoluteUrl('/m/x/link-1.jpg', 'https://tienda.test')).toBe(
      'https://tienda.test/m/x/link-1.jpg'
    );
    expect(absoluteUrl('/a', 'https://tienda.test/')).toBe('https://tienda.test/a');
  });
});

describe('buildSeo: página con imagen propia', () => {
  const seo = buildSeo({
    ...base,
    kind: 'product',
    image: linkImage(ID, 3, 'Bota coñac de perfil'),
  });

  it('trae las etiquetas obligatorias', () => {
    expect(find(seo.meta, 'og:title')).toBe('Bota Andes');
    expect(find(seo.meta, 'og:description')).toBe(base.description);
    expect(find(seo.meta, 'og:url')).toBe('https://tienda.test/p/bota-andes');
    expect(find(seo.meta, 'og:type')).toBe('product');
    expect(seo.canonical).toBe('https://tienda.test/p/bota-andes');
  });

  it('describe la imagen con URL absoluta, medidas, tipo y texto alternativo', () => {
    expect(find(seo.meta, 'og:image')).toBe(`https://tienda.test/m/${ID}/link-3.jpg`);
    expect(find(seo.meta, 'og:image:width')).toBe('1200');
    expect(find(seo.meta, 'og:image:height')).toBe('630');
    expect(find(seo.meta, 'og:image:type')).toBe('image/jpeg');
    expect(find(seo.meta, 'og:image:alt')).toBe('Bota coñac de perfil');
    expect(find(seo.meta, 'twitter:card')).toBe('summary_large_image');
  });

  it('el título incluye el nombre de la tienda', () => {
    expect(seo.title).toBe('Bota Andes · Clic Moda SC');
  });
});

describe('buildSeo: respaldo de imagen', () => {
  it('usa la imagen de la marca si la página no tiene una', () => {
    const seo = buildSeo({ ...base, fallbackImage: linkImage(ID, 1, 'Logo') });

    expect(find(seo.meta, 'og:image')).toBe(`https://tienda.test/m/${ID}/link-1.jpg`);
  });

  it('sin ninguna imagen no declara og:image y baja a tarjeta resumen', () => {
    const seo = buildSeo(base);

    expect(find(seo.meta, 'og:image')).toBeUndefined();
    expect(find(seo.meta, 'twitter:card')).toBe('summary');
  });

  it('el título no repite el nombre cuando son iguales', () => {
    expect(buildSeo({ ...base, title: 'Clic Moda SC' }).title).toBe('Clic Moda SC');
  });
});

describe('siteOrigin', () => {
  it('usa SITE_URL de la ejecución y, si falta o está vacío, el origen de la petición', () => {
    expect(siteOrigin('http://localhost:10012', { SITE_URL: 'https://tienda.test' })).toBe(
      'https://tienda.test'
    );
    expect(siteOrigin('http://localhost:10012', {})).toBe('http://localhost:10012');
    expect(siteOrigin('http://localhost:10012', { SITE_URL: '  ' })).toBe('http://localhost:10012');
  });
});
