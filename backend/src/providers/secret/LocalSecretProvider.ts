import { SecretProvider } from './SecretProvider';

export class LocalSecretProvider implements SecretProvider {
  async getSecret(key: string): Promise<string> {
    return process.env[key] || '';
  }
}
