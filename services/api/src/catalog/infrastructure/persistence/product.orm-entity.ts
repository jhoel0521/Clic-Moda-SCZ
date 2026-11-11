import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from 'typeorm';
import { ProductPhotoOrmEntity } from './product-photo.orm-entity.js';
import { VariantOrmEntity } from './variant.orm-entity.js';

@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 80 })
  slug!: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @OneToMany(() => VariantOrmEntity, (variant) => variant.product)
  variants!: Relation<VariantOrmEntity[]>;

  @OneToMany(() => ProductPhotoOrmEntity, (photo) => photo.product)
  photos?: Relation<ProductPhotoOrmEntity[]>;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
