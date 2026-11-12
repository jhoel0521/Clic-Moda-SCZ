import { eventDeliveriesContract } from './event-deliveries.contract.js';
import { InMemoryEventDeliveries } from './in-memory-event-deliveries.js';

eventDeliveriesContract('fake en memoria', () => {
  const deliveries = new InMemoryEventDeliveries();
  return { deliveries, publish: async (event) => deliveries.publish(event) };
});
