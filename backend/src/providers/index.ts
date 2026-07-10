import { SecretProvider } from './secret/SecretProvider';
import { LocalSecretProvider } from './secret/LocalSecretProvider';
import { AzureKeyVaultSecretProvider } from './secret/AzureKeyVaultSecretProvider';

import { AIProvider } from './ai/AIProvider';
import { LocalRecommendationProvider } from './ai/LocalRecommendationProvider';
import { AzureLanguageRecommendationProvider } from './ai/AzureLanguageRecommendationProvider';

import { AppLogger } from './logger/AppLogger';
import { LocalLogger } from './logger/LocalLogger';
import { AzureMonitorLogger } from './logger/AzureMonitorLogger';

import { StorageProvider } from './storage/StorageProvider';
import { LocalStorageProvider } from './storage/LocalStorageProvider';
import { AzureBlobStorageProvider } from './storage/AzureBlobStorageProvider';

// Utility helper to evaluate boolean feature flags
const isTrue = (val: any) => String(val).toLowerCase() === 'true';

// 1. Secret Provider Selection
export const secretProvider: SecretProvider = isTrue(process.env.USE_AZURE_KEYVAULT)
  ? new AzureKeyVaultSecretProvider()
  : new LocalSecretProvider();

// 2. AI Provider Selection
export const aiProvider: AIProvider = isTrue(process.env.USE_AZURE_AI)
  ? new AzureLanguageRecommendationProvider()
  : new LocalRecommendationProvider();

// 3. Logger Provider Selection
export const appLogger: AppLogger = isTrue(process.env.USE_AZURE_MONITOR)
  ? new AzureMonitorLogger()
  : new LocalLogger();

// 4. Storage Provider Selection
export const storageProvider: StorageProvider = isTrue(process.env.USE_AZURE_STORAGE)
  ? new AzureBlobStorageProvider()
  : new LocalStorageProvider();
export default {
  secretProvider,
  aiProvider,
  appLogger,
  storageProvider,
};
