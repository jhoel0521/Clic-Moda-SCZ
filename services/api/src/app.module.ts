import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { CatalogModule } from './catalog/catalog.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { HealthModule } from './health/infrastructure/http/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { envSchema } from './shared/infrastructure/config/env.schema.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { DomainErrorFilter } from './shared/infrastructure/http/domain-error.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    DatabaseModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    // Aplica el esquema Zod declarado en @Body({ schema }) / @Param({ schema }) de toda la API.
    { provide: APP_PIPE, useValue: new StandardSchemaValidationPipe({ transform: true }) },
  ],
})
export class AppModule {}
