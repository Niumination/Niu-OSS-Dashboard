'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/*
 * ScrollTop — tombol melayang "kembali ke atas" untuk halaman panjang
 * (grid 90+ kartu, daftar studi). Muncul setelah scroll ±1,5 layar,
 * hormati prefers-reduced-motion (fade tanpa slide).
 *
 * Aksesibel: tombol dengan aria-label, focus-ring konsisten situs.
 */
export default function ScrollTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion() === true;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setShow(window.scrollY > window.innerHeight * 1.5);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 12 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
          className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full border border-white/15 bg-ink-2/90 text-cream/70 shadow-card backdrop-blur transition-colors hover:border-ember/50 hover:text-ember focus-ring-soft"
        >
          <ArrowUp className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
