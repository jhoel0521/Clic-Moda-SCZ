// Entrada y salida de los casos de uso de configuración. Texto plano: la validación vive en el dominio.
export class UpdateSettingsCommand {
  constructor(
    readonly brandName: string,
    readonly tagline: string,
    readonly brandColor: string,
    readonly logoMediaId: string | null,
    readonly seoTitle: string,
    readonly seoDescription: string,
    readonly shareMediaId: string | null,
    readonly whatsapp: string,
    readonly address: string,
    readonly pickupHours: string,
    readonly mapUrl: string | null,
    readonly instagram: string | null,
    readonly tiktok: string | null,
    readonly facebook: string | null
  ) {}
}

export interface ImageResult {
  readonly mediaId: string;
  /** Ruta bajo el dominio de la tienda (/m/<id>/<formato>-<revisión>.<ext>). */
  readonly path: string;
  readonly alt: string;
}

export interface ShareImageResult extends ImageResult {
  readonly width: number;
  readonly height: number;
  readonly type: string;
}

export interface SettingsResult {
  readonly brandName: string;
  readonly tagline: string;
  readonly color: {
    readonly primary: string;
    readonly dark: string;
    readonly light: string;
    readonly soft: string;
    readonly onPrimary: string;
  };
  readonly logo: ImageResult | null;
  readonly seo: {
    readonly title: string;
    readonly description: string;
    readonly shareImage: ShareImageResult | null;
  };
  readonly contact: {
    readonly whatsapp: string;
    readonly address: string;
    readonly pickupHours: string;
    readonly mapUrl: string | null;
  };
  readonly social: {
    readonly instagram: string | null;
    readonly tiktok: string | null;
    readonly facebook: string | null;
  };
  readonly updatedAt: string;
}
