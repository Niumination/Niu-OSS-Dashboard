import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: '**.github.io' },
    ],
  },
  async headers() {
    return [
      {
        // API publik v1: file statis public/api/v1 dilayani sebelum route
        // handler — set CORS/cache di level ini (di GitHub Pages, Pages
        // sudah menyetel Access-Control-Allow-Origin: * otomatis).
        source: '/api/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=300' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Catatan: X-Frame-Options sengaja TIDAK di-set agar situs bisa
          // di-embed (preview, widget, dsb). Proteksi clickjacking tidak
          // relevan: tidak ada form login/sensitif yang di-render di sini.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
