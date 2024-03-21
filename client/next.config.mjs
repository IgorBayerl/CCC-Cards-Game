/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import nextTranslate from 'next-translate-plugin'
import withPWA from 'next-pwa'

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  ...nextTranslate(),

  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  }),
  images: {
    domains: ['github.com','avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_DISCORD_CLIENT_ID: 'NEXT_PUBLIC_DISCORD_CLIENT_ID',
  }
}
export default config;
