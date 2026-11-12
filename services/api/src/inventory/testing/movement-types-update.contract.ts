import type { MovementTypesRepository } from '../domain/movement-types.repository.port.js';
import { TypeCode, TypeName } from '../domain/value-objects/type-values.vo.js';

type Factory = () => Promise<MovementTypesRepository> | MovementTypesRepository;

function renameCase(make: Factory): void {
  it('guarda el nombre nuevo sin tocar el código ni la clase', async () => {
    const types = await make();
    const sale = await types.findByCode(TypeCode.of('SALE'));
    sale?.rename(TypeName.of('Venta al cliente'));
    if (sale) await types.update(sale);

    const found = await types.findByCode(TypeCode.of('SALE'));

    expect([found?.name.value, found?.code.value, found?.kind]).toEqual([
      'Venta al cliente',
      'SALE',
      'WITHDRAW',
    ]);
  });
}

function deactivateCase(make: Factory): void {
  it('un tipo desactivado sale de la lista por omisión y vuelve con includeInactive', async () => {
    const types = await make();
    const gift = await types.findByCode(TypeCode.of('GIFT'));
    gift?.deactivate();
    if (gift) await types.update(gift);

    const active = await types.list({ includeInactive: false });
    const all = await types.list({ includeInactive: true });

    expect(active.map((type) => type.code.value)).not.toContain('GIFT');
    expect(all.map((type) => type.code.value)).toContain('GIFT');
  });
}

// Contrato de los cambios sobre un tipo existente: nombre y estado activo (el código y la clase no cambian).
export function movementTypesUpdateContract(label: string, make: Factory): void {
  describe(`MovementTypesRepository (cambios): ${label}`, () => {
    renameCase(make);
    deactivateCase(make);
  });
}
