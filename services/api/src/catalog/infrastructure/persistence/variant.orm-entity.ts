import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity.js';

@Entity({ name: 'product_variants' })
export class VariantOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product?: Relation<ProductOrmEntity>;

  @Column({ type: 'citext', unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 20 })
  size!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  color!: string | null;

  @Column({ name: 'price_cents', type: 'integer' })
  priceCents!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  // Las fechas las pone la base (DEFAULT now()); solo se leen para ordenar las variantes.
  @Column({ name: 'created_at', type: 'timestamptz', insert: false, update: false })
  createdAt?: Date;
}
