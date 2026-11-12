import { Global, Module } from '@nestjs/common';
import { EVENT_DELIVERIES } from '../../application/events/event-deliveries.port.js';
import { EventSubscriberRegistry } from '../../application/events/event-subscriber.registry.js';
import { EventDispatcher } from './event-dispatcher.js';
import { EventOutbox } from './event-outbox.js';
import { TypeOrmEventDeliveries } from './typeorm-event-deliveries.js';

// Motor de eventos compartido: guarda el evento con el cambio (outbox), crea las entregas, las despacha y
// deja ver su estado. Global: cualquier contexto publica con `EventOutbox` y se suscribe con el registro.
@Global()
@Module({
  providers: [
    EventOutbox,
    EventSubscriberRegistry,
    EventDispatcher,
    { provide: EVENT_DELIVERIES, useClass: TypeOrmEventDeliveries },
  ],
  exports: [EventOutbox, EventSubscriberRegistry, EventDispatcher, EVENT_DELIVERIES],
})
export class EventsModule {}
