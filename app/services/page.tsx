import type { Metadata } from 'next';
import {
  Check,
  Code2,
  CreditCard,
  MessagesSquare,
  QrCode,
  Stethoscope,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import ServicesCtas from '@/components/ServicesCtas';
import { getGithubSnapshot } from '@/lib/github';
import { SERVICE_PACKAGES, SITE } from '@/lib/site.config';
import { formatIDR } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Services & Commissions',
  description:
    'Konsultasi Teknis, Audit & Optimasi, dan Custom Web App oleh Niumination — mulai dari brief langsung ke email/WhatsApp.',
};

const PKG_ICON = {
  consult: MessagesSquare,
  audit: Stethoscope,
  custom: Code2,
} as const;

const PROCESS = [
  {
    step: '01',
    title: 'Brief & Diskusi',
    desc: 'Isi form (atau chat WA) — ceritakan tujuan, fitur, timeline, dan teknologi yang sudah ada.',
  },
  {
    step: '02',
    title: 'Proposal & Quote',
    desc: 'Dapat rincian scope, harga final, dan estimasi waktu dalam 1–24 jam kerja.',
  },
  {
    step: '03',
    title: 'Build & Review',
    desc: 'Pembangunan bertahap dengan checkpoint review. Kode di-review bersama, commit terlihat.',
  },
  {
    step: '04',
    title: 'Deploy & Support',
    desc: 'Go-live di Vercel (atau infrastruktur Anda) + masa support pasca-launch.',
  },
];

export default async function ServicesPage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header className="max-w-2xl">
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            03 // services & commissions
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            Sewa Jasa & Konsultasi
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-cream/60">
            Tiga paket jelas, tanpa jargon. Mulai dari sesi konsultasi 60 menit sampai aplikasi web
            full-stack — semuanya dikerjakan oleh satu orang yang juga menjaga 90+ repositori publik.
          </p>
        </header>

        {/* Package cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SERVICE_PACKAGES.map((p) => {
            const Icon = PKG_ICON[p.icon];
            return (
              <div
                key={p.id}
                className={`card-glow relative flex flex-col rounded-3xl border p-6 ${
                  p.highlight
                    ? 'border-ember/40 bg-ember/[0.06] shadow-glow'
                    : 'border-white/[0.09] bg-white/[0.025]'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-ember px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-ink">
                    paling populer
                  </span>
                )}
                <span
                  className={`grid size-11 place-items-center rounded-xl ${
                    p.highlight ? 'bg-ember/20 text-ember' : 'bg-white/[0.05] text-cream/75'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 text-[17px] font-semibold text-cream">{p.name}</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-cream/55">{p.blurb}</p>
                <div className="mt-4 font-display text-[28px] tabular-nums text-cream">
                  {formatIDR(p.price)}
                  <span className="ml-2 font-mono text-[10px] tracking-wider text-cream/45">{p.unit}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-cream/70">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ember" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA (buka modal pembayaran/booking) */}
        <ServicesCtas />

        {/* Proses kerja */}
        <section className="mt-16">
          <div className="micro text-cream/45">proses // alur kerja</div>
          <h2 className="mt-2 font-display text-[30px] tracking-tight md:text-[38px]">
            Empat langkah, jelas.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div
                key={p.step}
                className="relative rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="font-mono text-[11px] text-ember">{p.step}</div>
                <h3 className="mt-2 text-[14.5px] font-semibold text-cream">{p.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-cream/55">{p.desc}</p>
                {i < PROCESS.length - 1 && (
                  <span className="absolute top-1/2 -right-[7px] hidden h-px w-3 bg-gradient-to-r from-ember/50 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Metode pembayaran */}
        <section className="mt-16">
          <div className="micro text-cream/45">payment // metode</div>
          <h2 className="mt-2 font-display text-[30px] tracking-tight md:text-[38px]">
            Bayar dengan cara yang paling mudah.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <QrCode className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream">Midtrans SNAP</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                QRIS, GoPay, OVO, ShopeePay, DANA, VA bank. Aktif otomatis saat{' '}
                <code className="font-mono text-[10.5px] text-ember-soft">MIDTRANS_CLIENT_KEY</code>{' '}
                terkonfigurasi.
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <CreditCard className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream">Stripe (internasional)</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                Hosted payment link untuk klien luar negeri (USD). Aktif saat{' '}
                <code className="font-mono text-[10.5px] text-ember-soft">STRIPE_PAYMENT_LINK</code>{' '}
                terisi.
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <MessagesSquare className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream">Transfer & Sponsor</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                Transfer bank manual setelah penawaran final. Untuk donasi: GitHub Sponsors / Buy Me
                a Coffee — <a href={SITE.buyMeACoffee} className="text-ember-soft hover:underline" target="_blank" rel="noreferrer">buka</a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
