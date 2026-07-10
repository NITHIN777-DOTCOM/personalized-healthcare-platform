import { StorageProvider } from './StorageProvider';
import fs from 'fs';
import path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(__dirname, '../../../storage');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(containerName: string, fileName: string, content: Buffer | string): Promise<string> {
    const containerDir = path.join(this.baseDir, containerName);
    if (!fs.existsSync(containerDir)) {
      fs.mkdirSync(containerDir, { recursive: true });
    }
    const filePath = path.join(containerDir, fileName);
    await fs.promises.writeFile(filePath, content);
    return `file://${filePath}`;
  }

  async downloadFile(containerName: string, fileName: string): Promise<string> {
    const filePath = path.join(this.baseDir, containerName, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${fileName} not found in container ${containerName}`);
    }
    return await fs.promises.readFile(filePath, 'utf-8');
  }
}
