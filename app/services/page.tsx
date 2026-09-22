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
import TitleSync from '@/components/TitleSync';
import ServicesCtas from '@/components/ServicesCtas';
import { getGithubSnapshot } from '@/lib/github';
import { SERVICE_PACKAGES, SITE } from '@/lib/site.config';
import { formatIDR } from '@/lib/utils';
import T from '@/components/T';

// Statik murni tanpa ISR: regenerasi ISR di Vercel pernah mencampur generasi
// render (DOM segar vs payload flight RSC basi) sehingga hydration gagal
// (React #418) di semua halaman. Data diperbarui per deploy — cron mingguan
// refresh-data push data baru -> auto-redeploy. Lihat CHANGELOG [Stack 2026.1].

export const metadata: Metadata = {
  title: 'Jasa & Komisi',
  description:
    'Konsultasi, audit, sampai aplikasi web custom — tiga paket jelas dari developer yang kodenya bisa Anda periksa dulu. Hubungi via email/WhatsApp.',
  alternates: { canonical: '/services' },
};

const PKG_ICON = {
  consult: MessagesSquare,
  audit: Stethoscope,
  custom: Code2,
} as const;

const PROCESS = [
  { step: '01', tKey: '1t', dKey: '1d' },
  { step: '02', tKey: '2t', dKey: '2d' },
  { step: '03', tKey: '3t', dKey: '3d' },
  { step: '04', tKey: '4t', dKey: '4d' },
];

export default async function ServicesPage() {
  const snap = await getGithubSnapshot();

  return (
    <AppShell snapshot={snap}>
      <TitleSync k="title.services" />
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <header className="max-w-2xl">
          <div className="micro flex items-center gap-2 text-cream/45">
            <span className="size-1.5 rounded-full bg-ember" />
            <T k="svc.micro" />
          </div>
          <h1 className="mt-3 font-display text-[40px] leading-[1.0] tracking-tight md:text-[54px]">
            <T k="svc.title" />
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-cream/60">
            <T k="svc.desc" />
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
                    <T k="svc.popular" />
                  </span>
                )}
                <span
                  className={`grid size-11 place-items-center rounded-xl ${
                    p.highlight ? 'bg-ember/20 text-ember' : 'bg-white/[0.05] text-cream/75'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 text-[17px] font-semibold text-cream"><T k={`pkg.${p.id}.name`} /></h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-cream/55"><T k={`pkg.${p.id}.blurb`} /></p>
                <div className="mt-4 font-display text-[28px] tabular-nums text-cream">
                  {formatIDR(p.price)}
                  <span className="ml-2 font-mono text-[10px] tracking-wider text-cream/45"><T k={`pkg.${p.id}.unit`} /></span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f, fi) => (
                    <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-cream/70">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ember" />
                      <T k={`svc.f.${p.id}.${fi + 1}`} />
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
          <div className="micro text-cream/45"><T k="svc.proc.micro" /></div>
          <h2 className="mt-2 font-display text-[30px] tracking-tight md:text-[38px]">
            <T k="svc.proc.title" />
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div
                key={p.step}
                className="relative rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="font-mono text-[11px] text-ember">{p.step}</div>
                <h3 className="mt-2 text-[14.5px] font-semibold text-cream"><T k={`svc.proc.${p.tKey}`} /></h3>
                <p className="mt-2 text-[12px] leading-relaxed text-cream/55"><T k={`svc.proc.${p.dKey}`} /></p>
                {i < PROCESS.length - 1 && (
                  <span className="absolute top-1/2 -right-[7px] hidden h-px w-3 bg-gradient-to-r from-ember/50 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Metode pembayaran */}
        <section className="mt-16">
          <div className="micro text-cream/45"><T k="svc.pay.micro" /></div>
          <h2 className="mt-2 font-display text-[30px] tracking-tight md:text-[38px]">
            <T k="svc.pay.title" />
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <QrCode className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream"><T k="svc.pay.m1.t" /></h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                <T k="svc.pay.m1a" />{' '}
                <code className="font-mono text-[10.5px] text-ember-soft">MIDTRANS_CLIENT_KEY</code>{' '}
                <T k="svc.pay.m1b" />
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <CreditCard className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream"><T k="svc.pay.m2.t" /></h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                <T k="svc.pay.m2a" />{' '}
                <code className="font-mono text-[10.5px] text-ember-soft">STRIPE_PAYMENT_LINK</code>{' '}
                <T k="svc.pay.m2b" />
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <MessagesSquare className="size-5 text-ember" />
              <h3 className="mt-3 text-[14px] font-semibold text-cream"><T k="svc.pay.m3.t" /></h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
                <T k="svc.pay.m3a" />{' '}
                <a href={SITE.buyMeACoffee} className="text-ember-soft hover:underline" target="_blank" rel="noreferrer"><T k="svc.pay.open" /></a>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
