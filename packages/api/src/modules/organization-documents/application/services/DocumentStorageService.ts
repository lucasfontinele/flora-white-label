export interface UploadDocumentInput {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  content: Uint8Array;
}

export interface UploadDocumentOutput {
  storageKey: string;
  mimeType: string;
  size: number;
}

export interface DocumentStorageService {
  upload(input: UploadDocumentInput): Promise<UploadDocumentOutput>;
  getDownloadUrl(storageKey: string): Promise<string>;
}

