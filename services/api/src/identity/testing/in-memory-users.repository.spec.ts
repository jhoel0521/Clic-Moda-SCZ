import { InMemoryUsersRepository } from './in-memory-users.repository.js';
import { usersRepositoryContract } from './users-repository.contract.js';

usersRepositoryContract('fake en memoria', () => new InMemoryUsersRepository());
