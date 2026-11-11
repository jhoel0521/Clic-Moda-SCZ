import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity.js';

// Una foto del producto: solo la referencia a la imagen del módulo de imágenes (sin clave foránea hacia
// él: borrar una imagen no debe fallar ni arrastrar productos). `position` 0 es la foto principal.
@Entity({ name: 'product_photos' })
export class ProductPhotoOrmEntity {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @PrimaryColumn({ type: 'smallint' })
  position!: number;

  @ManyToOne(() => ProductOrmEntity, (product) => product.photos)
  @JoinColumn({ name: 'product_id' })
  product?: Relation<ProductOrmEntity>;

  @Column({ name: 'media_id', type: 'uuid' })
  mediaId!: string;
}
