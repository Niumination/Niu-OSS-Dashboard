/**
 * Mode build.
 *
 * - Normal (Vercel / `next start`): data live dari GitHub API dengan ISR.
 * - Static export (GitHub Pages / hosting statis): `npm run export:static`
 *   memakai snapshot hasil build (`lib/mock-data.ts`) dan tidak membutuhkan
 *   runtime apa pun di server.
 */
export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

/**
 * URL kanonik situs (canonical, OG, sitemap, feed).
 *
 * `process.env.SITE_URL ?? 'default'` TIDAK cukup: env var yang ADA tapi
 * kosong (mis. `SITE_URL=` di Vercel) lolos dari `??`, sehingga
 * `new URL('')` melempar `ERR_INVALID_URL` saat build —
 * "Failed to collect page data for /_not-found". `?.trim() || default`
 * menutup kasus kosong dan spasi.
 *
 * Catatan deploy: set `SITE_URL` ke domain produksi (https://niumination.web.id).
 */
export const siteUrl = process.env.SITE_URL?.trim() || 'https://niumination.web.id';
