export interface StorageProvider {
  uploadFile(containerName: string, fileName: string, content: Buffer | string): Promise<string>;
  downloadFile(containerName: string, fileName: string): Promise<string>;
}
