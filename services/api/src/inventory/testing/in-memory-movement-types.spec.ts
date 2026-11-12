import { InMemoryMovementTypesRepository } from './in-memory-movement-types.repository.js';
import { movementTypesRepositoryContract } from './movement-types-repository.contract.js';
import { movementTypesUpdateContract } from './movement-types-update.contract.js';

movementTypesRepositoryContract('fake en memoria', () => InMemoryMovementTypesRepository.seeded());
movementTypesUpdateContract('fake en memoria', () => InMemoryMovementTypesRepository.seeded());
