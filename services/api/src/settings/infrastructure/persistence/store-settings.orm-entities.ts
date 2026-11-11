import { Column, Entity, PrimaryColumn } from 'typeorm';

// Modelo de persistencia (NO es la entidad de dominio): el mapper convierte entre ambos.
@Entity({ name: 'store_settings' })
export class StoreSettingsOrmEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ name: 'brand_name', type: 'text' })
  brandName!: string;

  @Column({ type: 'text' })
  tagline!: string;

  @Column({ name: 'brand_color', type: 'text' })
  brandColor!: string;

  @Column({ name: 'logo_media_id', type: 'uuid', nullable: true })
  logoMediaId!: string | null;

  @Column({ name: 'seo_title', type: 'text' })
  seoTitle!: string;

  @Column({ name: 'seo_description', type: 'text' })
  seoDescription!: string;

  @Column({ name: 'share_media_id', type: 'uuid', nullable: true })
  shareMediaId!: string | null;

  @Column({ type: 'text' })
  whatsapp!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ name: 'pickup_hours', type: 'text' })
  pickupHours!: string;

  @Column({ name: 'map_url', type: 'text', nullable: true })
  mapUrl!: string | null;

  @Column({ name: 'instagram_url', type: 'text', nullable: true })
  instagramUrl!: string | null;

  @Column({ name: 'tiktok_url', type: 'text', nullable: true })
  tiktokUrl!: string | null;

  @Column({ name: 'facebook_url', type: 'text', nullable: true })
  facebookUrl!: string | null;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
