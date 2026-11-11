import { CategoryId } from '../value-objects/ids.vo.js';
import { CategoryName, Slug } from '../value-objects/names.vo.js';

export interface CategoryProps {
  id: CategoryId;
  name: CategoryName;
  slug: Slug;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  private constructor(private props: CategoryProps) {}

  static create(name: CategoryName, now: Date = new Date()): Category {
    return new Category({
      id: CategoryId.generate(),
      name,
      slug: Slug.fromText(name.value),
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: CategoryProps): Category {
    return new Category({ ...props });
  }

  // El slug sigue al nombre para que la URL nunca quede desfasada.
  rename(name: CategoryName, now: Date = new Date()): void {
    this.props = { ...this.props, name, slug: Slug.fromText(name.value), updatedAt: now };
  }

  get id(): CategoryId {
    return this.props.id;
  }

  get name(): CategoryName {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
