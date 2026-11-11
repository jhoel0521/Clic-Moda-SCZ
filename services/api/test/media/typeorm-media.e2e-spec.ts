import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { MEDIA_ASSETS_REPOSITORY } from '../../src/media/domain/media-assets.repository.port.js';
import { S3MediaStorage } from '../../src/media/infrastructure/storage/s3-media-storage.js';
import { mediaAssetsRepositoryContract } from '../../src/media/testing/media-assets-repository.contract.js';
import { mediaStorageContract } from '../../src/media/testing/media-storage.contract.js';
import { truncateAll } from '../support/db.js';

describe('Imágenes sobre Postgres (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La MISMA suite que corre contra el fake en memoria, ahora contra Postgres real.
  mediaAssetsRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(moduleRef.get(DataSource));
    return moduleRef.get(MEDIA_ASSETS_REPOSITORY);
  });
});

// SeaweedFS real (docker compose). Sin claves de S3 en el entorno (p. ej. un CI sin infraestructura)
// esta suite no se ejecuta; el contrato sigue cubierto por el doble en memoria y por el disco.
const { S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;

if (S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY) {
  mediaStorageContract('SeaweedFS (S3)', async () => {
    const storage = new S3MediaStorage({
      endpoint: S3_ENDPOINT,
      bucket: 'clic-moda-media-test',
      accessKey: S3_ACCESS_KEY,
      secretKey: S3_SECRET_KEY,
    });
    await storage.ensureBucket();
    return storage;
  });
}
