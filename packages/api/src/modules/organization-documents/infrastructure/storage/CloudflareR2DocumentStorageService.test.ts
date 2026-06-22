import { describe, expect, it } from "vitest";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { CloudflareR2DocumentStorageService } from "./CloudflareR2DocumentStorageService.js";

describe("CloudflareR2DocumentStorageService", () => {
  it("uploads using the R2 endpoint, bucket, key, content type, and length", async () => {
    const sentCommands: unknown[] = [];
    const service = new CloudflareR2DocumentStorageService(
      {
        accountId: "account-1",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        bucketName: "documents",
        signedUrlExpiresInSeconds: 900,
      },
      {
        client: {
          send: async (command) => {
            sentCommands.push(command);
            return {};
          },
        },
      },
    );

    const output = await service.upload({
      storageKey: "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
      fileName: "receita.pdf",
      mimeType: "application/pdf",
      size: 128,
      content: new Uint8Array([1, 2, 3]),
    });

    expect(service.endpoint).toBe("https://account-1.r2.cloudflarestorage.com");
    expect(output).toEqual({
      storageKey: "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
      mimeType: "application/pdf",
      size: 128,
    });
    expect(sentCommands[0]).toBeInstanceOf(PutObjectCommand);
    expect((sentCommands[0] as PutObjectCommand).input).toMatchObject({
      Bucket: "documents",
      Key: "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
      ContentType: "application/pdf",
      ContentLength: 128,
    });
  });

  it("generates a signed download URL without exposing credentials", async () => {
    const sentCommands: unknown[] = [];
    const service = new CloudflareR2DocumentStorageService(
      {
        accountId: "account-1",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        bucketName: "documents",
        signedUrlExpiresInSeconds: 300,
      },
      {
        client: {
          send: async (command) => {
            sentCommands.push(command);
            return {};
          },
        },
        signUrl: async (_client, command, options) => {
          expect(command).toBeInstanceOf(GetObjectCommand);
          expect(command.input).toMatchObject({
            Bucket: "documents",
            Key: "storage/key.pdf",
          });
          expect(options).toEqual({ expiresIn: 300 });
          return "https://signed.local/storage/key.pdf";
        },
      },
    );

    await expect(service.getDownloadUrl("storage/key.pdf")).resolves.toBe(
      "https://signed.local/storage/key.pdf",
    );
    expect(sentCommands).toHaveLength(0);
  });
});
