// Un hecho ya consumado (no una orden): lo guarda un contexto junto con su cambio y otros lo escuchan.
export interface DomainEventRecord {
  readonly id: string;
  // Número de orden: solo es creciente dentro de una misma variante (o agregado); entre agregados distintos
  // no dice nada. El payload lleva el estado resultante para que un suscriptor ignore un evento viejo.
  readonly seq: number;
  readonly type: string;
  readonly aggregateId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly occurredAt: Date;
}

// Quien reacciona a los eventos. La entrega es AL MENOS UNA VEZ: un suscriptor cuyo efecto no se confirme
// junto con la marca de «ejecutada» debe ser idempotente (el id del evento sirve de clave).
export interface EventSubscriber {
  readonly name: string;
  handle(event: DomainEventRecord): Promise<void>;
}
