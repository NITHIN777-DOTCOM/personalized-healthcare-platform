import { secretProvider } from '../index';

export const initializeSecrets = async () => {
  const isTrue = (val: any) => String(val).toLowerCase() === 'true';
  if (isTrue(process.env.USE_AZURE_KEYVAULT)) {
    try {
      console.log('🔑 USE_AZURE_KEYVAULT is enabled. Pre-fetching secrets from Azure Key Vault...');
      const keys = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
      for (const key of keys) {
        const secret = await secretProvider.getSecret(key);
        if (secret) {
          process.env[key] = secret;
        }
      }
      console.log('✅ Azure Key Vault secrets successfully loaded into process.env');
    } catch (err) {
      console.error('❌ Failed to initialize secrets from Azure Key Vault:', err);
    }
  }
};
