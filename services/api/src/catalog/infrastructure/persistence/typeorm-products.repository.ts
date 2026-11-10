import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository, type SelectQueryBuilder } from 'typeorm';
import { ConflictError } from '../../../shared/domain/errors/domain.error.js';
import type { Product } from '../../domain/entities/product.entity.js';
import { DuplicateSkuError } from '../../domain/errors/catalog.errors.js';
import type {
  ProductPage,
  ProductSearchFilter,
  ProductsRepository,
} from '../../domain/products.repository.port.js';
import { type CategoryId, ProductId, type VariantId } from '../../domain/value-objects/ids.vo.js';
import type { Sku } from '../../domain/value-objects/variant-attributes.vo.js';
import { ProductMapper } from './catalog.mapper.js';
import { ProductOrmEntity } from './product.orm-entity.js';
import { VariantOrmEntity } from './variant.orm-entity.js';

const UNIQUE_VIOLATION = '23505';

// Disponible de un producto: suma de (físico - reservado) de sus variantes activas. Lectura de solo
// lectura sobre las tablas de inventario: `catalog` no importa código de `inventory`.
const AVAILABLE_SQL = `COALESCE((SELECT SUM(s.on_hand - s.reserved) FROM product_variants v
  JOIN stock_levels s ON s.variant_id = v.id WHERE v.product_id = p.id AND v.active), 0)`;
const escapeLike = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

@Injectable()
export class TypeOrmProductsRepository implements ProductsRepository {
  constructor(
    @InjectRepository(ProductOrmEntity) private readonly products: Repository<ProductOrmEntity>,
    @InjectRepository(VariantOrmEntity) private readonly variants: Repository<VariantOrmEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findById(id: ProductId): Promise<Product | null> {
    const row = await this.products.findOne({
      where: { id: id.value },
      relations: { variants: true },
    });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async findByVariantId(id: VariantId): Promise<Product | null> {
    const variant = await this.variants.findOneBy({ id: id.value });
    return variant ? this.findById(ProductId.of(variant.productId)) : null;
  }

  skuExists(sku: Sku): Promise<boolean> {
    return this.variants.existsBy({ sku: sku.value });
  }

  async search(filter: ProductSearchFilter): Promise<ProductPage> {
    const query = this.filtered(filter);
    const total = await query.getCount();
    const ids = await query
      .select('p.id', 'id')
      .orderBy('p.name', 'ASC')
      .addOrderBy('p.id', 'ASC')
      .offset((filter.page - 1) * filter.pageSize)
      .limit(filter.pageSize)
      .getRawMany<{ id: string }>();
    const found = ids.map((row) => row.id);
    return {
      items: await this.loadInOrder(found),
      total,
      available: await this.availability(found),
    };
  }

  private async availability(ids: string[]): Promise<Record<string, number>> {
    if (ids.length === 0) return {};
    const rows: { id: string; available: string }[] = await this.dataSource.query(
      `SELECT p.id, ${AVAILABLE_SQL} AS available FROM products p WHERE p.id = ANY($1)`,
      [ids]
    );
    return Object.fromEntries(rows.map((row) => [row.id, Number(row.available)]));
  }

  countByCategory(categoryId: CategoryId): Promise<number> {
    return this.products.countBy({ categoryId: categoryId.value });
  }

  async save(product: Product): Promise<void> {
    const { product: row, variants } = ProductMapper.toRows(product);
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(ProductOrmEntity, row);
        await manager.save(VariantOrmEntity, variants);
      });
    } catch (error) {
      throw this.translate(error);
    }
  }

  private filtered(filter: ProductSearchFilter): SelectQueryBuilder<ProductOrmEntity> {
    const query = this.products.createQueryBuilder('p');
    if (filter.text) {
      query.andWhere(
        `(p.name ILIKE :text OR EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.sku ILIKE :text))`,
        { text: `%${escapeLike(filter.text.trim())}%` }
      );
    }
    if (filter.categoryId) query.andWhere('p.category_id = :cat', { cat: filter.categoryId.value });
    if (filter.stock) query.andWhere(`${AVAILABLE_SQL} ${filter.stock === 'out' ? '<= 0' : '> 0'}`);
    if (filter.active !== undefined)
      query.andWhere('p.active = :active', { active: filter.active });
    return query;
  }

  private async loadInOrder(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const rows = await this.products.find({
      where: { id: In(ids) },
      relations: { variants: true },
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    return ids.map((id) => ProductMapper.toDomain(byId.get(id) as ProductOrmEntity));
  }

  private translate(error: unknown): unknown {
    if (!(error instanceof QueryFailedError)) return error;
    const driver = error.driverError as { code?: string; constraint?: string; detail?: string };
    if (driver.code !== UNIQUE_VIOLATION) return error;
    if (driver.constraint === 'UQ_product_variants_sku') {
      return new DuplicateSkuError(/\(([^)]*)\)=\(([^)]*)\)/.exec(driver.detail ?? '')?.[2] ?? '');
    }
    return new ConflictError('Ya existe una variante con esa talla y color');
  }
}
