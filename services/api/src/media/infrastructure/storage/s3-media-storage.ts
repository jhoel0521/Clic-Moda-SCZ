import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { MediaStoragePort, StoredObject } from '../../application/ports/media-storage.port.js';

export interface S3Settings {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
}

const DELETE_BATCH = 1000;

// Almacenamiento en SeaweedFS (compatible con S3). Bucket privado: solo la API tiene las claves.
export class S3MediaStorage implements MediaStoragePort {
  private readonly client: S3Client;

  constructor(private readonly settings: S3Settings) {
    this.client = new S3Client({
      endpoint: settings.endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: { accessKeyId: settings.accessKey, secretAccessKey: settings.secretKey },
    });
  }

  // Crea el bucket si no existe (idempotente). Se llama al arrancar la API.
  async ensureBucket(): Promise<void> {
    const Bucket = this.settings.bucket;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket }));
    }
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    const { bucket: Bucket } = this.settings;
    await this.client.send(
      new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType })
    );
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const out = await this.client.send(
        new GetObjectCommand({ Bucket: this.settings.bucket, Key: key })
      );
      const bytes = await out.Body?.transformToByteArray();
      if (!bytes) return null;
      return {
        body: Buffer.from(bytes),
        contentType: out.ContentType ?? 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof NoSuchKey) return null;
      throw error;
    }
  }

  async delete(keys: string[]): Promise<void> {
    for (let i = 0; i < keys.length; i += DELETE_BATCH) {
      const Objects = keys.slice(i, i + DELETE_BATCH).map((Key) => ({ Key }));
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.settings.bucket,
          Delete: { Objects, Quiet: true },
        })
      );
    }
  }
}
