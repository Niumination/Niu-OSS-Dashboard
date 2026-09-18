'use client';

import { useReportWebVitals } from 'next/web-vitals';

/*
 * WebVitals — melaporkan metrik Core Web Vitals (LCP, INP, CLS, TTFB, FCP)
 * ke /api/vitals (server mode). Mode statis / kegagalan jaringan diabaikan
 * senyap — komponen ini tidak pernah mengganggu pengalaman pengguna.
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    try {
      const body = JSON.stringify({
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
        path: window.location.pathname,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/vitals', new Blob([body], { type: 'application/json' }));
      } else {
        void fetch('/api/vitals', { method: 'POST', body, keepalive: true });
      }
    } catch {
      // diam — observabilitas tidak boleh membuat error pengguna
    }
  });
  return null;
}
