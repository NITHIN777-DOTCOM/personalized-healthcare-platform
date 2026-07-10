import { secretProvider } from '../index';

export const initializeSecrets = async () => {
  const isTrue = (val: any) => String(val).toLowerCase() === 'true';

  // 1. Immediately return if USE_AZURE_KEYVAULT is false
  if (!isTrue(process.env.USE_AZURE_KEYVAULT)) {
    return;
  }

  // 2. Immediately return if Azure Key Vault URL is missing
  if (!process.env.AZURE_KEYVAULT_URL) {
    console.warn('⚠️ Azure Key Vault enabled but AZURE_KEYVAULT_URL is missing. Falling back to local secrets.');
    return;
  }

  // 3. Immediately return if Azure credentials are missing
  const hasSpCredentials = !!(process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET);
  const hasManagedIdentity = !!(process.env.IDENTITY_ENDPOINT || process.env.IDENTITY_HEADER || process.env.MSI_ENDPOINT || process.env.MSI_SECRET);
  
  if (!hasSpCredentials && !hasManagedIdentity) {
    console.warn('⚠️ Azure Key Vault enabled but credentials (Service Principal or Managed Identity) are missing. Falling back to local secrets.');
    return;
  }

  try {
    console.log('🔑 Pre-fetching secrets from Azure Key Vault...');
    const keys = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    
    // Enforce a strict 2.5 second timeout to prevent blocking startup under any network lag/failure
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Azure Key Vault connection request timed out')), 2500)
    );

    const fetchSecretsPromise = (async () => {
      for (const key of keys) {
        const secret = await secretProvider.getSecret(key);
        if (secret) {
          process.env[key] = secret;
        }
      }
    })();

    await Promise.race([fetchSecretsPromise, timeoutPromise]);
    console.log('✅ Azure Key Vault secrets successfully loaded into process.env');
  } catch (err: any) {
    // If initialization fails or times out, log a warning and fall back to existing local env variables
    console.warn(`⚠️ Azure Key Vault initialization failed/timed out: ${err?.message || err}. Falling back to local .env configuration.`);
  }
};
export default initializeSecrets;
