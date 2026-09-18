/*
 * QrCard — kode QR halaman (server component, dirender saat build/SSR).
 * SVG digenerate lewat paket `qrcode`, ditanam langsung + tautan unduh
 * data-URI (tanpa JavaScript tambahan di client).
 */

import QRCode from 'qrcode';
import T from '@/components/T';

export default async function QrCard({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    width: 168,
    color: { dark: '#f2ecdf', light: '#14110d' }, // cream di atas ink
  });
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <div className="mt-10 flex flex-col items-start gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center">
      <div
        className="grid size-[148px] shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink/70 p-2.5 [&>svg]:size-full"
        aria-label={`QR: ${url}`}
        role="img"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="min-w-0">
        <div className="micro text-cream/45">qr // share</div>
        <h3 className="mt-1 font-display text-[22px] tracking-tight text-cream">
          <T k="qr.title" />
        </h3>
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-cream/55">
          <T k="qr.desc" />
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-cream/65">
            {url}
          </code>
          <a
            href={dataUri}
            download={filename}
            className="rounded-full bg-ember px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink transition hover:bg-ember-soft"
          >
            <T k="qr.download" />
          </a>
        </div>
      </div>
    </div>
  );
}
