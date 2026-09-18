'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Coffee,
  CreditCard,
  Github,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  QrCode,
  Stethoscope,
  Code2,
  MessagesSquare,
  X,
} from 'lucide-react';
import { SERVICE_PACKAGES, SITE, type ServicePackage } from '@/lib/site.config';
import { cx, formatIDR } from '@/lib/utils';
import type { PaymentTab } from './ui-context';

/*
 * ============================================================================
 *  PaymentModal — sistem monetisasi
 * ----------------------------------------------------------------------------
 *  Tab 1 "Dukung OSS": donasi sekali / bulanan dengan nominal cepat,
 *    metode: GitHub Sponsors, BuyMeACoffee, Midtrans SNAP (QRIS/VA/e-wallet,
 *    aktif jika NEXT_PUBLIC_MIDTRANS_CLIENT_KEY terisi), Stripe (hosted
 *    payment link, aktif jika NEXT_PUBLIC_STRIPE_PAYMENT_LINK terisi).
 *  Tab 2 "Sewa Jasa": 3 paket (Konsultasi Teknis, Audit & Optimization,
 *    Custom Web App) -> form brief -> checkout/kontak langsung via
 *    email (mailto) & WhatsApp (wa.me).
 * ============================================================================
 */

interface Props {
  open: boolean;
  initialTab: PaymentTab;
  onClose: () => void;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
    document.body.appendChild(s);
  });
}

export default function PaymentModal({ open, initialTab, onClose }: Props) {
  const [tab, setTab] = useState<PaymentTab>(initialTab);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    // Fokus masuk ke panel dialog; saat ditutup, fokus dikembalikan ke
    // elemen pemicu (standar aksesibilitas dialog).
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[85] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Donasi & layanan"
        >
          <motion.div
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="relative flex min-h-full items-start justify-center p-4 md:p-8">
            <motion.section
              ref={panelRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.985 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative my-2 w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-ink-2 p-6 shadow-card focus:outline-none md:my-6 md:p-9"
            >
              <div className="pointer-events-none absolute -top-24 -right-24 size-[340px] rounded-full bg-ember/25 blur-3xl animate-float-orb" />
              <div className="dotgrid pointer-events-none absolute inset-0 text-cream opacity-[0.05]" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/70 transition hover:bg-white/[0.12] hover:text-cream"
              >
                <X className="size-4" />
              </button>

              <div className="relative">
                <div className="micro flex items-center gap-2 text-cream/55">
                  <span className="size-1.5 rounded-full bg-ember" />
                  {tab === 'oss' ? 'monetisasi // dukungan' : 'monetisasi // jasa'}
                </div>
                <h2 className="mt-2 font-display text-[30px] leading-[1.02] tracking-tight text-cream md:text-[38px]">
                  {tab === 'oss' ? 'Dukung Open Source.' : 'Sewa Jasa & Konsultasi.'}
                </h2>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-cream/60">
                  {tab === 'oss'
                    ? 'Semua repo di sini dibangun dan dirawat gratis. Donasi Anda menjaga server, domain, dan waktu membangunnya.'
                    : 'Pilih paket, kirim brief, dan kita mulai. Pembayaran (Midtrans/transfer/Stripe) dikonfirmasi setelah penawaran final.'}
                </p>

                <div className="mt-5 flex gap-2">
                  <TabButton active={tab === 'oss'} onClick={() => setTab('oss')} icon={Heart}>
                    Dukung OSS
                  </TabButton>
                  <TabButton active={tab === 'services'} onClick={() => setTab('services')} icon={Stethoscope}>
                    Sewa Jasa
                  </TabButton>
                </div>

                <div className="mt-6">
                  {tab === 'oss' ? <OssTab /> : <ServicesTab />}
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex h-10 items-center gap-2 rounded-full border px-5 font-mono text-[10.5px] uppercase tracking-wider transition-colors',
        active
          ? 'border-ember bg-ember/15 text-cream shadow-glow'
          : 'border-white/12 bg-white/[0.03] text-cream/55 hover:text-cream',
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

/* ------------------------------ Tab: OSS -------------------------------- */

function OssTab() {
  const [freq, setFreq] = useState<'once' | 'monthly'>('once');
  const [amount, setAmount] = useState<number>(50000);
  const [custom, setCustom] = useState('');
  const [midStatus, setMidStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const finalAmount = useMemo(() => {
    const c = Number(custom.replace(/\D/g, ''));
    return c > 0 ? c : amount;
  }, [custom, amount]);

  const payMidtrans = async () => {
    if (!SITE.midtransClientKey || midStatus === 'loading') return;
    setMidStatus('loading');
    try {
      await loadScript('https://app.midtrans.com/snap/snap.js');
      const w = window as unknown as {
        snap: {
          pay: (payload: Record<string, unknown>) => void;
          buildPaymentMethods: (methods: string[]) => Record<string, unknown>;
        };
      };
      w.snap.pay({
        clientKey: SITE.midtransClientKey,
        transactionItems: [
          {
            name: freq === 'monthly' ? 'Donasi bulanan OSS' : 'Donasi OSS',
            price: finalAmount,
            quantity: 1,
          },
        ],
        ...w.snap.buildPaymentMethods(['qris', 'gopay', 'shopeepay', 'ovo', 'dana', 'va_bri', 'va_mandiri']),
        onSuccess: () => {
          setMidStatus('idle');
        },
        onPending: () => setMidStatus('idle'),
        onError: () => setMidStatus('error'),
        onClose: () => setMidStatus('idle'),
      });
    } catch {
      setMidStatus('error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-0.5" role="group">
          {(
            [
              ['once', 'Sekali'],
              ['monthly', 'Bulanan'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFreq(k)}
              aria-pressed={freq === k}
              className={cx(
                'rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors',
                freq === k ? 'bg-ember text-ink' : 'text-cream/55 hover:text-cream',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-cream/45">
          {freq === 'monthly' ? 'recurring — via GitHub Sponsors' : 'sekali bayar'}
        </span>
      </div>

      <div>
        <div className="micro mb-2.5 text-cream/45">nominal donasi</div>
        <div className="flex flex-wrap gap-2">
          {SITE.donationAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustom('');
              }}
              aria-pressed={!custom && amount === a}
              className={cx(
                'h-10 rounded-full border px-4 font-mono text-[12px] tabular-nums transition-colors',
                !custom && amount === a
                  ? 'border-ember bg-ember/15 text-cream shadow-glow'
                  : 'border-white/12 bg-white/[0.03] text-cream/65 hover:border-white/30',
              )}
            >
              {formatIDR(a)}
            </button>
          ))}
          <div
            className={cx(
              'flex h-10 items-center gap-2 rounded-full border px-4 transition-colors',
              custom ? 'border-ember bg-ember/10' : 'border-white/12 bg-white/[0.03]',
            )}
          >
            <span className="font-mono text-[11px] text-cream/50">Rp</span>
            <input
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, '').slice(0, 9))}
              placeholder="custom"
              aria-label="Nominal donasi custom"
              className="w-24 bg-transparent font-mono text-[12px] tabular-nums text-cream outline-none placeholder:text-cream/30"
            />
          </div>
        </div>
        <div className="mt-2 font-mono text-[10.5px] text-cream/40">
          Total: <span className="text-cream/80">{formatIDR(finalAmount)}</span>
          {freq === 'monthly' ? ' /bulan' : ''}
        </div>
      </div>

      <div className="space-y-2.5">
        <MethodRow
          icon={Github}
          name="GitHub Sponsors"
          desc={freq === 'monthly' ? 'Recurring bulanan — cara paling resmi & rendah biaya.' : 'Donasi sekali / bulanan langsung via GitHub.'}
          href={SITE.sponsors}
          cta="Donasi"
        />
        <MethodRow
          icon={Coffee}
          name="Buy Me a Coffee"
          desc="Satu klik, tanpa rekening. Cocok untuk dukungan kecil yang cepat."
          href={SITE.buyMeACoffee}
          cta="Traktir ☕"
        />
        <MethodRow
          icon={QrCode}
          name="Midtrans — QRIS / VA / E-Wallet"
          desc={
            SITE.midtransClientKey
              ? 'Checkout Snap: QRIS, GoPay, OVO, ShopeePay, DANA, VA bank.'
              : 'Aktif setelah NEXT_PUBLIC_MIDTRANS_CLIENT_KEY diisi di environment.'
          }
          cta="Checkout"
          onClick={payMidtrans}
          disabled={!SITE.midtransClientKey}
          state={midStatus}
        />
        <MethodRow
          icon={CreditCard}
          name="Stripe — kartu internasional"
          desc={
            SITE.stripePaymentLink
              ? 'Hosted payment link Stripe (USD). Ideal untuk donor luar negeri.'
              : 'Aktif setelah NEXT_PUBLIC_STRIPE_PAYMENT_LINK diisi di environment.'
          }
          href={SITE.stripePaymentLink || undefined}
          cta="Buka Stripe"
          disabled={!SITE.stripePaymentLink}
        />
      </div>

      <p className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11.5px] leading-relaxed text-cream/45">
        Dana digunakan untuk: server & domain proyek civic (Pemdi Aceh Tengah), biaya riset tooling
        AI, dan operasional menjaga 90+ repositori publik tetap hidup.
      </p>
    </div>
  );
}

function MethodRow({
  icon: Icon,
  name,
  desc,
  cta,
  href,
  onClick,
  disabled = false,
  state = 'idle',
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  state?: 'idle' | 'loading' | 'error';
}) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors',
        disabled ? 'border-white/[0.06] bg-white/[0.015] opacity-60' : 'border-white/10 bg-white/[0.03] hover:border-ember/30',
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ember/10 text-ember">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-cream/90">{name}</div>
        <div className="mt-0.5 text-[11.5px] leading-snug text-cream/50">{desc}</div>
      </div>
      {href && !disabled ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 items-center gap-1.5 rounded-full bg-ember px-5 font-mono text-[10.5px] uppercase tracking-wider text-ink transition hover:bg-ember-soft"
        >
          {cta} <ChevronRight className="size-3.5" />
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled || state === 'loading'}
          className={cx(
            'flex h-10 items-center gap-1.5 rounded-full px-5 font-mono text-[10.5px] uppercase tracking-wider transition',
            disabled
              ? 'cursor-not-allowed border border-white/10 text-cream/35'
              : 'bg-ember text-ink hover:bg-ember-soft',
          )}
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> memproses…
            </>
          ) : state === 'error' ? (
            'coba lagi'
          ) : (
            <>
              {cta} <ChevronRight className="size-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* --------------------------- Tab: Services ------------------------------- */

function ServicesTab() {
  const [sel, setSel] = useState<ServicePackage | null>(null);
  const [form, setForm] = useState({ name: '', email: '', wa: '', brief: '' });
  const [sent, setSent] = useState(false);

  const mailtoHref = useMemo(() => {
    if (!sel) return '#';
    const subject = `Request ${sel.name} — via niumination dashboard`;
    const body = [
      'Halo Niumination,',
      '',
      `Saya tertarik dengan paket: ${sel.name} (${formatIDR(sel.price)}${sel.unit})`,
      `Nama: ${form.name}`,
      `Email: ${form.email}`,
      `WhatsApp: ${form.wa}`,
      '',
      'Detail kebutuhan:',
      form.brief || '-',
      '',
      '— dikirim dari dashboard niumination',
    ].join('\n');
    return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [sel, form]);

  const waHref = useMemo(() => {
    if (!sel) return '#';
    const text = [
      `Halo! Saya tertarik dengan paket ${sel.name} (${formatIDR(sel.price)}${sel.unit}).`,
      form.name ? `Nama: ${form.name}` : '',
      form.wa ? `WhatsApp: ${form.wa}` : '',
      form.brief ? `Detail: ${form.brief}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  }, [sel, form]);

  if (sent) {
    return (
      <div className="grid place-items-center rounded-3xl border border-success/25 bg-success/[0.06] px-6 py-12 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h3 className="mt-4 font-display text-2xl text-cream">Request terkirim!</h3>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-cream/60">
          Balasan diproses dalam 1–24 jam kerja. Cek email/{` `}WhatsApp Anda — berikutnya tinggal
          konfirmasi penawaran & pembayaran.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSel(null);
            setForm({ name: '', email: '', wa: '', brief: '' });
          }}
          className="mt-5 h-10 rounded-full border border-white/15 px-5 font-mono text-[10.5px] uppercase tracking-wider text-cream/75 transition hover:border-ember/50 hover:text-cream"
        >
          Kirim request lain
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {sel ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ember/15 text-ember">
              {sel.icon === 'consult' ? (
                <MessagesSquare className="size-[18px]" />
              ) : sel.icon === 'audit' ? (
                <Stethoscope className="size-[18px]" />
              ) : (
                <Code2 className="size-[18px]" />
              )}
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-cream">{sel.name}</div>
              <div className="font-mono text-[11px] text-ember-soft">
                {formatIDR(sel.price)} <span className="text-cream/40">{sel.unit}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSel(null)}
              className="font-mono text-[10px] uppercase tracking-wider text-cream/45 underline-offset-4 transition hover:text-cream hover:underline"
            >
              ganti paket
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Nama" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Nama lengkap" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="nama@email.com" />
            <Field label="WhatsApp" value={form.wa} onChange={(v) => setForm((f) => ({ ...f, wa: v }))} placeholder="62812…" />
            <div className="sm:col-span-2">
              <label className="micro text-cream/45">detail kebutuhan</label>
              <textarea
                value={form.brief}
                onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
                rows={4}
                placeholder="Ceritakan proyek/aplikasi Anda: fitur yang diharapkan, timeline, teknologi saat ini…"
                className="mt-1.5 w-full resize-none rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-[13px] leading-relaxed text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-ember/50"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={mailtoHref}
              onClick={() => setSent(true)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ember px-5 font-mono text-[10.5px] uppercase tracking-wider text-ink transition hover:bg-ember-soft hover:shadow-glow"
            >
              <Mail className="size-3.5" /> Kirim via Email
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setSent(true)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-success/40 bg-success/10 px-5 font-mono text-[10.5px] uppercase tracking-wider text-success transition hover:bg-success/20"
            >
              <MessageCircle className="size-3.5" /> Chat WhatsApp
            </a>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-cream/40">
            Tidak ada biaya di tahap ini — pembayaran baru dikonfirmasi setelah penawaran final
            (Midtrans / transfer bank / Stripe).
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="cards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-3 md:grid-cols-3"
        >
          {SERVICE_PACKAGES.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setSel(p)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cx(
                'card-glow group flex flex-col rounded-3xl border p-5 text-left transition-colors',
                p.highlight
                  ? 'border-ember/40 bg-ember/[0.07]'
                  : 'border-white/10 bg-white/[0.02] hover:border-ember/30',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cx(
                    'grid size-10 place-items-center rounded-xl',
                    p.highlight ? 'bg-ember/20 text-ember' : 'bg-white/[0.05] text-cream/70',
                  )}
                >
                  {p.icon === 'consult' ? (
                    <MessagesSquare className="size-[18px]" />
                  ) : p.icon === 'audit' ? (
                    <Stethoscope className="size-[18px]" />
                  ) : (
                    <Code2 className="size-[18px]" />
                  )}
                </span>
                {p.highlight && (
                  <span className="rounded-full bg-ember px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-wider text-ink">
                    populer
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-cream">{p.name}</h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-cream/55">{p.blurb}</p>
              <div className="mt-3 font-display text-[22px] tabular-nums text-cream">
                {formatIDR(p.price)}
                <span className="ml-1.5 font-mono text-[10px] tracking-wider text-cream/45">{p.unit}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11.5px] leading-snug text-cream/65">
                    <Check className="mt-0.5 size-3 shrink-0 text-ember" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 font-mono text-[10px] uppercase tracking-wider text-cream/75 transition group-hover:border-ember/60 group-hover:bg-ember/10 group-hover:text-cream">
                Pilih paket <ChevronRight className="size-3.5" />
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="micro text-cream/45">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 text-[13px] text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-ember/50"
      />
    </div>
  );
}
