import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Env } from './shared/infrastructure/config/env.schema.js';
import { setupDocs } from './shared/infrastructure/docs/docs.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupDocs(app);
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
