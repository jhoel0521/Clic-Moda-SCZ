import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Clic Moda API')
    .setDescription('API compartida de la tienda, el panel de administración y el tiempo real')
    .setVersion('0.0.0')
    .build();

  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: 'docs/json',
  });
}
