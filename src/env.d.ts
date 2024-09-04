/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/client" />

interface ImportMetaEnv {
  readonly STEAM_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
