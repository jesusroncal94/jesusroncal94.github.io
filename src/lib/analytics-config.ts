export const ANALYTICS: { endpoint: string; host: string; key: string } = {
  endpoint: 'https://eu.i.posthog.com/i/v0/e/',
  host: 'jesusroncal94.github.io',
  key: import.meta.env.PUBLIC_POSTHOG_KEY ?? '',
};
