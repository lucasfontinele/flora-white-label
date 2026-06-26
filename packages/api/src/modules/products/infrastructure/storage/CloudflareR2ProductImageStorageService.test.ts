import { describe, expect, it } from "vitest";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { CloudflareR2ProductImageStorageService } from "./CloudflareR2ProductImageStorageService.js";

const baseConfig = {
  accountId: "account-1",
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucketName: "uploads",
  signedUrlExpiresInSeconds: 900,
};

describe("CloudflareR2ProductImageStorageService", () => {
  it("uploads using the R2 endpoint, bucket, key, content type, and length", async () => {
    const sentCommands: unknown[] = [];
    const service = new CloudflareR2ProductImageStorageService(baseConfig, {
      client: {
        send: async (command) => {
          sentCommands.push(command);
          return {};
        },
      },
    });

    const output = await service.upload({
      storageKey: "organizations/org-1/products/product-1/cover-images/1-cover.png",
      fileName: "cover.png",
      mimeType: "image/png",
      size: 128,
      content: new Uint8Array([1, 2, 3]),
    });

    expect(service.endpoint).toBe("https://account-1.r2.cloudflarestorage.com");
    expect(output).toEqual({
      storageKey: "organizations/org-1/products/product-1/cover-images/1-cover.png",
      mimeType: "image/png",
      size: 128,
    });
    expect(sentCommands[0]).toBeInstanceOf(PutObjectCommand);
    expect((sentCommands[0] as PutObjectCommand).input).toMatchObject({
      Bucket: "uploads",
      Key: "organizations/org-1/products/product-1/cover-images/1-cover.png",
      ContentType: "image/png",
      ContentLength: 128,
    });
  });

  it("generates a signed image URL without exposing credentials", async () => {
    const sentCommands: unknown[] = [];
    const service = new CloudflareR2ProductImageStorageService(
      { ...baseConfig, signedUrlExpiresInSeconds: 300 },
      {
        client: {
          send: async (command) => {
            sentCommands.push(command);
            return {};
          },
        },
        signUrl: async (_client, command, options) => {
          expect(command).toBeInstanceOf(GetObjectCommand);
          expect(command.input).toMatchObject({ Bucket: "uploads", Key: "cover/key.png" });
          expect(options).toEqual({ expiresIn: 300 });
          return "https://signed.local/cover/key.png";
        },
      },
    );

    await expect(service.getImageUrl("cover/key.png")).resolves.toBe(
      "https://signed.local/cover/key.png",
    );
    expect(sentCommands).toHaveLength(0);
  });

  it("deletes an object by key", async () => {
    const sentCommands: unknown[] = [];
    const service = new CloudflareR2ProductImageStorageService(baseConfig, {
      client: {
        send: async (command) => {
          sentCommands.push(command);
          return {};
        },
      },
    });

    await service.delete("cover/key.png");

    expect(sentCommands[0]).toBeInstanceOf(DeleteObjectCommand);
    expect((sentCommands[0] as DeleteObjectCommand).input).toMatchObject({
      Bucket: "uploads",
      Key: "cover/key.png",
    });
  });
});
