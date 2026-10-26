/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin; empty in development (Vite proxies /api to the server). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
