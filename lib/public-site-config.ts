const DEFAULT_TELEGRAM_BOT_URL = "https://t.me/Deine_Deutsch_Quiz_bot";
const DEFAULT_TELEGRAM_CHANNEL_URL = "https://t.me/doechkurse";
const DEFAULT_DEUTSCH_TRAINER_BOT_URL = "https://t.me/Trainer1512_bot";
const DEFAULT_SITE_URL = "https://deutschmit.de";
const DEFAULT_CONTACT_EMAIL = "info@deutschmit.de";

function normalizePublicEnv(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function getTelegramBotUrl(): string {
  return normalizePublicEnv(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL) ?? DEFAULT_TELEGRAM_BOT_URL;
}

export function getTelegramChannelUrl(): string {
  return (
    normalizePublicEnv(process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL) ??
    DEFAULT_TELEGRAM_CHANNEL_URL
  );
}

export function getDeutschTrainerBotUrl(): string {
  return (
    normalizePublicEnv(process.env.NEXT_PUBLIC_DEUTSCH_TRAINER_BOT_URL) ??
    DEFAULT_DEUTSCH_TRAINER_BOT_URL
  );
}

export function getSiteUrl(): string {
  return (
    normalizePublicEnv(process.env.NEXT_PUBLIC_SITE_URL) ??
    DEFAULT_SITE_URL
  );
}

export function getPublicContactEmail(): string {
  return (
    normalizePublicEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ??
    DEFAULT_CONTACT_EMAIL
  );
}

export const TELEGRAM_BOT_START_PAYLOAD = "site_public_home";
