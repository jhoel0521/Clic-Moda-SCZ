import { z } from 'zod';
import { UpdateSettingsCommand } from '../../application/dtos/settings.dtos.js';

// DTO de petición HTTP: solo el formato de transporte y un tope de tamaño por campo (así el cuerpo
// completo nunca pasa de unos pocos KB). Las reglas de negocio las valida el dominio.
const text = (max: number) => z.string().max(max);
const optionalText = (max: number) => z.string().max(max).nullable().default(null);

export const updateSettingsSchema = z.object({
  brandName: text(100),
  tagline: text(200),
  brandColor: text(20),
  logoMediaId: optionalText(64),
  seoTitle: text(200),
  seoDescription: text(500),
  shareMediaId: optionalText(64),
  whatsapp: text(40),
  address: text(500),
  pickupHours: text(500),
  mapUrl: optionalText(1000),
  instagram: optionalText(1000),
  tiktok: optionalText(1000),
  facebook: optionalText(1000),
});
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;

// Mapper HTTP -> aplicación.
export const toUpdateCommand = (dto: UpdateSettingsDto): UpdateSettingsCommand =>
  new UpdateSettingsCommand(
    dto.brandName,
    dto.tagline,
    dto.brandColor,
    dto.logoMediaId,
    dto.seoTitle,
    dto.seoDescription,
    dto.shareMediaId,
    dto.whatsapp,
    dto.address,
    dto.pickupHours,
    dto.mapUrl,
    dto.instagram,
    dto.tiktok,
    dto.facebook
  );
