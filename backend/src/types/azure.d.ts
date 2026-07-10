// Type definitions for optional Azure SDK modules to support compilation without local installs
declare module '@azure/keyvault-secrets' {
  export const SecretClient: any;
}
declare module '@azure/identity' {
  export const DefaultAzureCredential: any;
}
declare module '@azure/openai' {
  export const OpenAIClient: any;
  export const AzureKeyCredential: any;
}
declare module 'applicationinsights' {
  export const setup: any;
  export const defaultClient: any;
}
declare module '@azure/storage-blob' {
  export const BlobServiceClient: any;
}
