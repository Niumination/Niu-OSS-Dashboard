import type { MetadataRoute } from 'next';

// Wajib untuk `output: 'export'` (sama seperti robots/sitemap).
export const dynamic = 'force-static';

/**
 * PWA manifest — di-generate Next.js sebagai /manifest.webmanifest.
 * Ikon dihasilkan scripts/gen-pwa-icons.mjs (tanpa dependensi eksternal).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Niumination — Dasbor OSS',
    short_name: 'Niumination',
    description:
      'Landing page + dasbor OSS interaktif — repositori, studi kasus, status layanan, dan metrik dari github.com/Niumination.',
    lang: 'id',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0b0a08',
    theme_color: '#14110d',
    categories: ['developer', 'portfolio', 'productivity'],
    // Fase 2: share target — bagikan tautan (mis. repo GitHub) ke aplikasi
    // ini dari menu berbagi OS; ditangani /share (GET, ramah ekspor statis).
    share_target: {
      action: '/share',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
