// Etiquetas de SEO y de compartir (Open Graph y X). Se calculan en el servidor, sin JavaScript, para que
// WhatsApp, Facebook, X y Google las lean del HTML.
export interface SeoImage {
  /** Ruta bajo el dominio de la tienda (p. ej. /m/<id>/link-3.jpg). */
  path: string;
  alt: string;
  width: number;
  height: number;
  type: string;
}

export interface SeoInput {
  siteName: string;
  title: string;
  description: string;
  /** Ruta de la página (p. ej. /p/bota-andes). */
  path: string;
  /** Origen público de la tienda (https://tienda.com). */
  origin: string;
  kind?: 'website' | 'product';
  image?: SeoImage;
  /** Imagen de la marca: se usa si la página no tiene una propia. */
  fallbackImage?: SeoImage;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SeoResult {
  title: string;
  canonical: string;
  meta: MetaTag[];
}

// Medidas del formato `link` del módulo de medios (1200x630 JPEG): son las que declara og:image:*.
export const linkImage = (assetId: string, revision: number, alt: string): SeoImage => ({
  path: `/m/${assetId}/link-${String(revision)}.jpg`,
  alt,
  width: 1200,
  height: 630,
  type: 'image/jpeg',
});

export const absoluteUrl = (path: string, origin: string): string =>
  new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();

const property = (name: string, content: string): MetaTag => ({ property: name, content });

function imageTags(image: SeoImage, origin: string): MetaTag[] {
  return [
    property('og:image', absoluteUrl(image.path, origin)),
    property('og:image:width', String(image.width)),
    property('og:image:height', String(image.height)),
    property('og:image:type', image.type),
    property('og:image:alt', image.alt),
  ];
}

export function buildSeo(input: SeoInput): SeoResult {
  const canonical = absoluteUrl(input.path, input.origin);
  const image = input.image ?? input.fallbackImage;
  const meta: MetaTag[] = [
    { name: 'description', content: input.description },
    property('og:type', input.kind ?? 'website'),
    property('og:site_name', input.siteName),
    property('og:title', input.title),
    property('og:description', input.description),
    property('og:url', canonical),
    ...(image ? imageTags(image, input.origin) : []),
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
  ];
  const title = input.title === input.siteName ? input.title : `${input.title} · ${input.siteName}`;
  return { title, canonical, meta };
}
