/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_SITE_LABEL: string;
  readonly VITE_X_URL: string;
  readonly VITE_DISCORD_URL: string;
  readonly VITE_TELEGRAM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
