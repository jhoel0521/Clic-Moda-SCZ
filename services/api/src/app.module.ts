import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HealthModule } from './health/infrastructure/http/health.module.js';
import { envSchema } from './shared/infrastructure/config/env.schema.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { DomainErrorFilter } from './shared/infrastructure/http/domain-error.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    DatabaseModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}
