import type { ClockPort, VariantLookupPort } from '../application/ports/inventory.ports.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';

// Reloj controlable: las pruebas avanzan el tiempo a mano.
export class FakeClock implements ClockPort {
  constructor(private current: Date = new Date('2026-11-10T10:00:00Z')) {}

  now(): Date {
    return new Date(this.current);
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

// Variantes conocidas para las pruebas: se registran a mano con su estado.
export class InMemoryVariantLookup implements VariantLookupPort {
  private readonly variants = new Map<string, { active: boolean }>();

  add(id: VariantId, active = true): void {
    this.variants.set(id.value, { active });
  }

  async lookup(id: VariantId): Promise<{ readonly active: boolean } | null> {
    return this.variants.get(id.value) ?? null;
  }
}
