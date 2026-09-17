/**
 * Mode build.
 *
 * - Normal (Vercel / `next start`): data live dari GitHub API dengan ISR.
 * - Static export (GitHub Pages / hosting statis): `npm run export:static`
 *   memakai snapshot hasil build (`lib/mock-data.ts`) dan tidak membutuhkan
 *   runtime apa pun di server.
 */
export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
