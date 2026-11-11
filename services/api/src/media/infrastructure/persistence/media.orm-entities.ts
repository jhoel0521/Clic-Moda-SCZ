import { Column, Entity, PrimaryColumn } from 'typeorm';

// Modelos de persistencia: NO son las entidades de dominio; el mapper convierte entre ambos.
@Entity({ name: 'media_assets' })
export class MediaAssetOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  alt!: string;

  @Column({ name: 'focal_x', type: 'double precision' })
  focalX!: number;

  @Column({ name: 'focal_y', type: 'double precision' })
  focalY!: number;

  @Column({ type: 'text' })
  fit!: string;

  @Column({ type: 'text' })
  background!: string;

  @Column({ type: 'integer' })
  width!: number;

  @Column({ type: 'integer' })
  height!: number;

  @Column({ name: 'master_mime', type: 'text' })
  masterMime!: string;

  @Column({ type: 'integer' })
  revision!: number;

  @Column({ type: 'boolean' })
  published!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity({ name: 'media_variants' })
export class MediaVariantOrmEntity {
  @PrimaryColumn({ name: 'asset_id', type: 'uuid' })
  assetId!: string;

  @PrimaryColumn({ type: 'text' })
  format!: string;

  @PrimaryColumn({ type: 'integer' })
  revision!: number;

  @Column({ type: 'integer' })
  width!: number;

  @Column({ type: 'integer' })
  height!: number;

  @Column({ type: 'integer' })
  bytes!: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
