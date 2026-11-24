/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_INSECURE_URL: string;
  readonly VITE_API_SECURE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
