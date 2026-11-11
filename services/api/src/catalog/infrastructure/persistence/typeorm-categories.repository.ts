import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import type { CategoriesRepository } from '../../domain/categories.repository.port.js';
import type { Category } from '../../domain/entities/category.entity.js';
import { DuplicateCategoryError } from '../../domain/errors/catalog.errors.js';
import type { CategoryId } from '../../domain/value-objects/ids.vo.js';
import type { CategoryName } from '../../domain/value-objects/names.vo.js';
import { CategoryMapper } from './catalog.mapper.js';
import { CategoryOrmEntity } from './category.orm-entity.js';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmCategoriesRepository implements CategoriesRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity) private readonly categories: Repository<CategoryOrmEntity>
  ) {}

  async findById(id: CategoryId): Promise<Category | null> {
    const row = await this.categories.findOneBy({ id: id.value });
    return row ? CategoryMapper.toDomain(row) : null;
  }

  // La columna es citext: la comparación ya ignora mayúsculas.
  async findByName(name: CategoryName): Promise<Category | null> {
    const row = await this.categories.findOneBy({ name: name.value });
    return row ? CategoryMapper.toDomain(row) : null;
  }

  async list(): Promise<Category[]> {
    const rows = await this.categories.find({ order: { name: 'ASC' } });
    return rows.map(CategoryMapper.toDomain);
  }

  async save(category: Category): Promise<void> {
    try {
      await this.categories.save(CategoryMapper.toRow(category));
    } catch (error) {
      const code =
        error instanceof QueryFailedError ? (error.driverError as { code?: string }).code : '';
      throw code === UNIQUE_VIOLATION ? new DuplicateCategoryError(category.name.value) : error;
    }
  }

  async delete(id: CategoryId): Promise<void> {
    await this.categories.delete({ id: id.value });
  }
}
