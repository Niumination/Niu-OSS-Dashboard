'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Heart, Wrench } from 'lucide-react';
import { useUi } from './ui-context';

/** CTA di halaman /services — memicu modal pembayaran/booking global. */
export default function ServicesCtas() {
  const { openPayment } = useUi();
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => openPayment('services')}
        className="group flex h-12 items-center gap-2.5 rounded-full bg-ember px-7 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
      >
        <Wrench className="size-4" />
        Mulai Proses
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => openPayment('oss')}
        className="flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-7 font-mono text-[11px] uppercase tracking-wider text-cream transition hover:border-ember/50"
      >
        <Heart className="size-4 text-ember" />
        Dukung OSS
      </motion.button>
    </div>
  );
}
