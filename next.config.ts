import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
          // ── CSP fase 1: REPORT-ONLY (AUDIT-2026.5 §T2) ──────────────────
          // Halaman situs ini statik murni (prerender) sehingga nonce
          // per-request tidak mungkin — jalur bertahap: pantau pelanggaran
          // 2–4 minggu via /api/csp-report (log Vercel), lalu naikkan ke
          // enforcement dengan menyalin nilai ini ke key
          // 'Content-Security-Policy' setelah bersih.
          // - script-src 'unsafe-inline': payload flight Next inline
          // - 'unsafe-eval': Snap.js Midtrans (modus pembayaran)
          // - frame-ancestors terbuka: kebijakan embed (lihat catatan di atas)
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.github.com https://vitals.vercel-insights.com https://*.insights.vercel.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors *",
              'report-uri /api/csp-report',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
