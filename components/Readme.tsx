'use client';

import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/*
 * Readme — merender README markdown menjadi HTML aman.
 * marked (parse) + DOMPurify (sanitasi XSS) hanya berjalan di browser;
 * sebelum hydrasi ditampilkan skeleton. Limit 60.000 karakter untuk README besar.
 */

const LIMIT = 60_000;

export default function Readme({ source }: { source: string }) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (!source) return;
    let live = true;
    try {
      const parsed = marked.parse(source.slice(0, LIMIT), {
        async: false,
        gfm: true,
        breaks: false,
      }) as string;
      const clean = DOMPurify.sanitize(parsed, {
        ADD_ATTR: ['target'],
      });
      if (live) setHtml(clean);
    } catch {
      if (live) setHtml(`<p>${source.slice(0, 2000)}</p>`);
    }
    return () => {
      live = false;
    };
  }, [source]);

  const truncated = useMemo(() => source.length > LIMIT, [source]);

  if (!html) {
    return (
      <div className="space-y-3 p-6" aria-hidden="true">
        <div className="skel h-7 w-2/3 rounded-md" />
        <div className="skel h-4 w-full rounded-md" />
        <div className="skel h-4 w-5/6 rounded-md" />
        <div className="skel h-40 w-full rounded-xl" />
        <div className="skel h-4 w-4/6 rounded-md" />
      </div>
    );
  }

  return (
    <div>
      <article className="readme" dangerouslySetInnerHTML={{ __html: html }} />
      {truncated && (
        <p className="px-6 pb-5 font-mono text-[10px] text-cream/35">
          … (dipotong di {LIMIT.toLocaleString('id-ID')} karakter — buka sumber untuk versi penuh)
        </p>
      )}
    </div>
  );
}
