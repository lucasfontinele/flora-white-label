export interface UploadProductImageInput {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: Uint8Array;
}

export interface UploadProductImageOutput {
  storageKey: string;
  mimeType: string;
  size: number;
}

/**
 * Abstraction over the object storage that backs product cover images. The
 * application layer depends only on this port; the concrete Cloudflare R2
 * adapter lives in infrastructure. The stored value is always the object
 * `storageKey`; a presigned/public URL is derived from it via `getImageUrl`.
 */
export interface ProductImageStorageService {
  upload(input: UploadProductImageInput): Promise<UploadProductImageOutput>;
  getImageUrl(storageKey: string): Promise<string>;
  delete(storageKey: string): Promise<void>;
}
