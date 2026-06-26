import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  ProductImageStorageService,
  UploadProductImageInput,
  UploadProductImageOutput,
} from "../../application/services/ProductImageStorageService.js";

export interface CloudflareR2ProductImageStorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  signedUrlExpiresInSeconds: number;
}

export interface CloudflareR2ProductImageStorageTestOverrides {
  client?: Pick<S3Client, "send">;
  signUrl?: (
    client: Pick<S3Client, "send">,
    command: GetObjectCommand,
    options: { expiresIn: number },
  ) => Promise<string>;
}

export class CloudflareR2ProductImageStorageService implements ProductImageStorageService {
  private readonly client: Pick<S3Client, "send">;
  private readonly bucketName: string;
  private readonly signedUrlExpiresInSeconds: number;
  readonly endpoint: string;

  constructor(
    config: CloudflareR2ProductImageStorageConfig,
    private readonly overrides: CloudflareR2ProductImageStorageTestOverrides = {},
  ) {
    this.bucketName = config.bucketName;
    this.signedUrlExpiresInSeconds = config.signedUrlExpiresInSeconds;
    this.endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

    const clientConfig: S3ClientConfig = {
      region: "auto",
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };

    this.client = overrides.client ?? new S3Client(clientConfig);
  }

  async upload(input: UploadProductImageInput): Promise<UploadProductImageOutput> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.storageKey,
        Body: input.content,
        ContentType: input.mimeType,
        ContentLength: input.size,
      }),
    );

    return {
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      size: input.size,
    };
  }

  async getImageUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    if (this.overrides.signUrl) {
      return this.overrides.signUrl(this.client, command, {
        expiresIn: this.signedUrlExpiresInSeconds,
      });
    }

    return getSignedUrl(this.client as S3Client, command, {
      expiresIn: this.signedUrlExpiresInSeconds,
    });
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      }),
    );
  }
}
