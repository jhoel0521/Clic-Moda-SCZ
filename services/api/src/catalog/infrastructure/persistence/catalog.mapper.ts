import { Category } from '../../domain/entities/category.entity.js';
import { Product } from '../../domain/entities/product.entity.js';
import { Variant, variantProps } from '../../domain/entities/variant.entity.js';
import { CategoryId, ProductId, VariantId } from '../../domain/value-objects/ids.vo.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { CategoryName, ProductName, Slug } from '../../domain/value-objects/names.vo.js';
import { Color, Size, Sku } from '../../domain/value-objects/variant-attributes.vo.js';
import { CategoryOrmEntity } from './category.orm-entity.js';
import { ProductOrmEntity } from './product.orm-entity.js';
import { VariantOrmEntity } from './variant.orm-entity.js';

// Mappers entre el modelo de persistencia y el dominio. El dominio nunca ve entidades ORM.
export const CategoryMapper = {
  toDomain: (row: CategoryOrmEntity): Category =>
    Category.restore({
      id: CategoryId.of(row.id),
      name: CategoryName.of(row.name),
      slug: Slug.of(row.slug),
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),

  toRow: (category: Category): CategoryOrmEntity =>
    Object.assign(new CategoryOrmEntity(), {
      id: category.id.value,
      name: category.name.value,
      slug: category.slug.value,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }),
};

const variantToDomain = (row: VariantOrmEntity): Variant =>
  Variant.restore({
    id: VariantId.of(row.id),
    sku: Sku.of(row.sku),
    size: Size.of(row.size),
    color: row.color ? Color.of(row.color) : null,
    price: Money.ofCents(row.priceCents),
    active: row.active,
  });

const variantToRow = (productId: string, variant: Variant): VariantOrmEntity => {
  const props = variantProps(variant);
  return Object.assign(new VariantOrmEntity(), {
    id: props.id.value,
    productId,
    sku: props.sku.value,
    size: props.size.value,
    color: props.color?.value ?? null,
    priceCents: props.price.cents,
    active: props.active,
  });
};

// Las variantes se ordenan por fecha de alta y SKU para que el orden sea estable.
const byCreation = (a: VariantOrmEntity, b: VariantOrmEntity): number =>
  (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0) || a.sku.localeCompare(b.sku);

export const ProductMapper = {
  toDomain: (row: ProductOrmEntity): Product =>
    Product.restore({
      id: ProductId.of(row.id),
      categoryId: CategoryId.of(row.categoryId),
      name: ProductName.of(row.name),
      description: row.description,
      active: row.active,
      variants: [...row.variants].sort(byCreation).map(variantToDomain),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),

  toRows: (product: Product): { product: ProductOrmEntity; variants: VariantOrmEntity[] } => ({
    product: Object.assign(new ProductOrmEntity(), {
      id: product.id.value,
      categoryId: product.categoryId.value,
      name: product.name.value,
      description: product.description,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }),
    variants: product.variants.map((variant) => variantToRow(product.id.value, variant)),
  }),
};
