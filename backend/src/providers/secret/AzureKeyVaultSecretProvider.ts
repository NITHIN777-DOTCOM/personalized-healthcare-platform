/// <reference path="../../types/azure.d.ts" />
import { SecretProvider } from './SecretProvider';

export class AzureKeyVaultSecretProvider implements SecretProvider {
  private client: any = null;
  private vaultUrl: string;

  constructor() {
    this.vaultUrl = process.env.AZURE_KEYVAULT_URL || '';
  }

  private async getClient() {
    if (this.client) return this.client;
    if (!this.vaultUrl) return null;
    try {
      // Dynamic imports to keep SDK optional
      const { SecretClient } = await import('@azure/keyvault-secrets');
      const { DefaultAzureCredential } = await import('@azure/identity');
      
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(this.vaultUrl, credential);
      return this.client;
    } catch (error) {
      console.warn('⚠️ Azure Key Vault SDK not available or failed to load. Using fallback.');
      return null;
    }
  }

  async getSecret(key: string): Promise<string> {
    const client = await this.getClient();
    if (client) {
      try {
        const response = await client.getSecret(key);
        return response.value || '';
      } catch (err) {
        console.error(`❌ Failed to retrieve secret ${key} from Key Vault:`, err);
      }
    }
    // Fallback to local environment
    return process.env[key] || '';
  }
}
