'use client';

import { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/utils';

/*
 * <TimeAgo iso="..." /> — teks waktu relatif ("3 jam lalu") yang aman-hidrasi
 * dan selalu segar di halaman statis.
 *
 * Masalah yang diselesaikan: halaman kini statis murni (tanpa ISR) agar dokumen
 * HTML + payload flight RSC selalu berasal dari satu render build (mencegah
 * hydration mismatch React #418 di Vercel). Konsekuensinya, `timeAgo()` yang
 * dipanggil di server akan membeku pada nilai saat build. Komponen ini:
 *   1. SSR/prerender: mem-bake nilai saat build (tampil sebelum hidrasi).
 *   2. Hidrasi: klien menghitung ulang — `suppressHydrationWarning` menenangkan
 *      React atas beda teks tersebut (nilai klien menang, tanpa error #418).
 *   3. Pasca-mount: berdetak tiap 60 detik agar label tetap mutakhir.
 *
 * Jangan pakai pola ini untuk data yang harus konsisten antara server dan
 * klien — ini khusus label waktu yang maknanya bergantung "sekarang".
 */
export default function TimeAgo({
  iso,
  tick = true,
  className,
}: {
  iso: string | null | undefined;
  /** Berdetak tiap 60 dtk (default). Set false untuk label statis. */
  tick?: boolean;
  className?: string;
}) {
  // null = fase render awal (SSR + hidrasi pertama); angka = pasca-mount.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!tick) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [tick]);

  const label = timeAgo(iso, now ?? Date.now());
  return (
    <span suppressHydrationWarning className={className}>
      {label}
    </span>
  );
}
