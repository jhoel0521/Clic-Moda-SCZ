import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './shared/infrastructure/config/env.schema.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { HealthModule } from './health/infrastructure/http/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
