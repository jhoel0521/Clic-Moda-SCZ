import { InMemoryRoleEventsRepository } from './in-memory-role-events.repository.js';
import { InMemoryUsersRepository } from './in-memory-users.repository.js';
import { roleEventsRepositoryContract } from './role-events-repository.contract.js';

roleEventsRepositoryContract('fake en memoria', () => {
  const users = new InMemoryUsersRepository();
  return { users, events: new InMemoryRoleEventsRepository(users) };
});
