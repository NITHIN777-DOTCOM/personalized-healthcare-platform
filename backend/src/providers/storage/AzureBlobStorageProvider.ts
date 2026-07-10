/// <reference path="../../types/azure.d.ts" />
import { StorageProvider } from './StorageProvider';
import path from 'path';

export class AzureBlobStorageProvider implements StorageProvider {
  private blobServiceClient: any = null;
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
  }

  private async getClient() {
    if (this.blobServiceClient) return this.blobServiceClient;
    if (!this.connectionString) return null;
    try {
      const { BlobServiceClient } = await import('@azure/storage-blob');
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      return this.blobServiceClient;
    } catch (err) {
      console.warn('⚠️ Azure Blob Storage SDK not available or failed to load. Using mockup.');
      return null;
    }
  }

  async uploadFile(containerName: string, fileName: string, content: Buffer | string): Promise<string> {
    const client = await this.getClient();
    if (client) {
      try {
        const containerClient = client.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.upload(content, content.length);
        return blockBlobClient.url;
      } catch (err) {
        console.error('❌ Failed to upload to Azure Blob Storage:', err);
      }
    }

    // Mock/Local Fallback
    console.log(`[Azure Blob Storage Mock] Uploading ${fileName} to container ${containerName}`);
    const fs = await import('fs');
    const baseDir = path.resolve(__dirname, '../../../storage');
    const containerDir = path.join(baseDir, containerName);
    if (!fs.existsSync(containerDir)) {
      fs.mkdirSync(containerDir, { recursive: true });
    }
    fs.writeFileSync(path.join(containerDir, fileName), content);
    return `mock-blob://${containerName}/${fileName}`;
  }

  async downloadFile(containerName: string, fileName: string): Promise<string> {
    const client = await this.getClient();
    if (client) {
      try {
        const containerClient = client.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const downloadResponse = await blockBlobClient.download(0);
        return await this.streamToString(downloadResponse.readableStreamBody);
      } catch (err) {
        console.error('❌ Failed to download from Azure Blob Storage:', err);
      }
    }

    // Mock/Local Fallback
    console.log(`[Azure Blob Storage Mock] Downloading ${fileName} from container ${containerName}`);
    const fs = await import('fs');
    const filePath = path.join(path.resolve(__dirname, '../../../storage'), containerName, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileName} not found in mock blob container ${containerName}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async streamToString(readableStream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      readableStream.on('data', (data: any) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }
}
