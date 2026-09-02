function read(name: keyof ImportMetaEnv): string {
  const raw = import.meta.env[name];
  if (typeof raw !== "string" || raw.length === 0) {
    throw new Error(`${name} is missing. Copy .env.example to .env`);
  }
  return raw.replace(/^['"]|['"]$/g, "").trim();
}

export const env = {
  siteUrl: read("VITE_SITE_URL"),
  siteLabel: read("VITE_SITE_LABEL"),
  xUrl: read("VITE_X_URL"),
  discordUrl: read("VITE_DISCORD_URL"),
  telegramUrl: read("VITE_TELEGRAM_URL"),
} as const;
