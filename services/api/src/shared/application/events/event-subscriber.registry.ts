import { Injectable } from '@nestjs/common';
import type { EventSubscriber } from './event.types.js';

// Los suscriptores se registran solos (desde el constructor de su proveedor): `registry.register(this)`.
// El despachador consulta este registro; no hay ninguno registrado en producción en este change.
@Injectable()
export class EventSubscriberRegistry {
  private readonly subscribers = new Map<string, EventSubscriber>();

  register(subscriber: EventSubscriber): void {
    if (this.subscribers.has(subscriber.name)) {
      throw new Error(`Ya hay un suscriptor de eventos llamado "${subscriber.name}"`);
    }
    this.subscribers.set(subscriber.name, subscriber);
  }

  names(): string[] {
    return [...this.subscribers.keys()];
  }

  find(name: string): EventSubscriber | undefined {
    return this.subscribers.get(name);
  }
}
