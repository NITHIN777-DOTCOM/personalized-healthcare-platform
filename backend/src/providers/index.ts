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

// Lazy Cache instances
let _secretProvider: SecretProvider | null = null;
let _aiProvider: AIProvider | null = null;
let _appLogger: AppLogger | null = null;
let _storageProvider: StorageProvider | null = null;

// Explicit getters
export const getSecretProvider = (): SecretProvider => {
  if (!_secretProvider) {
    _secretProvider = isTrue(process.env.USE_AZURE_KEYVAULT)
      ? new AzureKeyVaultSecretProvider()
      : new LocalSecretProvider();
  }
  return _secretProvider;
};

export const getAIProvider = (): AIProvider => {
  if (!_aiProvider) {
    _aiProvider = isTrue(process.env.USE_AZURE_AI)
      ? new AzureLanguageRecommendationProvider()
      : new LocalRecommendationProvider();
  }
  return _aiProvider;
};

export const getAppLogger = (): AppLogger => {
  if (!_appLogger) {
    _appLogger = isTrue(process.env.USE_AZURE_MONITOR)
      ? new AzureMonitorLogger()
      : new LocalLogger();
  }
  return _appLogger;
};

export const getStorageProvider = (): StorageProvider => {
  if (!_storageProvider) {
    _storageProvider = isTrue(process.env.USE_AZURE_STORAGE)
      ? new AzureBlobStorageProvider()
      : new LocalStorageProvider();
  }
  return _storageProvider;
};

// Exported Proxies to preserve structural compatibility and prevent import-time execution
export const secretProvider = new Proxy({} as SecretProvider, {
  get: (_, prop) => {
    const instance = getSecretProvider() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const aiProvider = new Proxy({} as AIProvider, {
  get: (_, prop) => {
    const instance = getAIProvider() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const appLogger = new Proxy({} as AppLogger, {
  get: (_, prop) => {
    const instance = getAppLogger() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const storageProvider = new Proxy({} as StorageProvider, {
  get: (_, prop) => {
    const instance = getStorageProvider() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export default {
  secretProvider,
  aiProvider,
  appLogger,
  storageProvider,
};
