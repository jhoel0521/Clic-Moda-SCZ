import type { CategoriesRepository } from '../domain/categories.repository.port.js';
import { Category } from '../domain/entities/category.entity.js';
import { DuplicateCategoryError } from '../domain/errors/catalog.errors.js';
import { CategoryId } from '../domain/value-objects/ids.vo.js';
import { CategoryName } from '../domain/value-objects/names.vo.js';

type Factory = () => Promise<CategoriesRepository> | CategoriesRepository;

const category = (name: string): Category => Category.create(CategoryName.of(name));

function readCases(make: Factory): void {
  it('findById devuelve null si no existe', async () => {
    expect(await (await make()).findById(CategoryId.generate())).toBeNull();
  });

  it('guarda una categoría y la recupera con todos sus datos', async () => {
    const [repo, zapatillas] = [await make(), category('Zapatillas Urbanas')];
    await repo.save(zapatillas);

    const found = await repo.findById(zapatillas.id);
    expect([found?.name.value, found?.slug.value, found?.active]).toEqual([
      'Zapatillas Urbanas',
      'zapatillas-urbanas',
      true,
    ]);
  });

  it('findByName no distingue mayúsculas', async () => {
    const [repo, botas] = [await make(), category('Botas')];
    await repo.save(botas);

    expect((await repo.findByName(CategoryName.of('BOTAS')))?.id.equals(botas.id)).toBe(true);
    expect(await repo.findByName(CategoryName.of('Otra'))).toBeNull();
  });
}

function writeCases(make: Factory): void {
  it('save actualiza por id: renombrar cambia nombre y slug', async () => {
    const [repo, botas] = [await make(), category('Botas')];
    await repo.save(botas);
    botas.rename(CategoryName.of('Botines'));
    await repo.save(botas);

    const found = await repo.findById(botas.id);
    expect([found?.name.value, found?.slug.value]).toEqual(['Botines', 'botines']);
    expect(await repo.list()).toHaveLength(1);
  });

  it('list ordena por nombre', async () => {
    const repo = await make();
    for (const name of ['Sandalias', 'Botas', 'Zapatillas']) await repo.save(category(name));

    expect((await repo.list()).map((item) => item.name.value)).toEqual([
      'Botas',
      'Sandalias',
      'Zapatillas',
    ]);
  });
}

function deleteCases(make: Factory): void {
  it('delete elimina la categoría', async () => {
    const [repo, botas] = [await make(), category('Botas')];
    await repo.save(botas);
    await repo.delete(botas.id);

    expect(await repo.findById(botas.id)).toBeNull();
  });
}

function conflictCases(make: Factory): void {
  it('rechaza un nombre repetido sin distinguir mayúsculas y no guarda la segunda', async () => {
    const [repo, first] = [await make(), category('Zapatillas')];
    await repo.save(first);

    await expect(repo.save(category('ZAPATILLAS'))).rejects.toThrow(DuplicateCategoryError);
    expect(await repo.list()).toHaveLength(1);
  });

  it('rechaza un nombre distinto que produce el mismo slug ("Niños" y "Ninos")', async () => {
    const repo = await make();
    await repo.save(category('Niños'));

    await expect(repo.save(category('Ninos'))).rejects.toThrow(DuplicateCategoryError);
  });

  it('una categoría puede conservar su propio nombre al guardarse otra vez', async () => {
    const [repo, botas] = [await make(), category('Botas')];
    await repo.save(botas);

    await expect(repo.save(botas)).resolves.toBeUndefined();
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function categoriesRepositoryContract(label: string, make: Factory): void {
  describe(`CategoriesRepository: ${label}`, () => {
    readCases(make);
    writeCases(make);
    deleteCases(make);
    conflictCases(make);
  });
}
