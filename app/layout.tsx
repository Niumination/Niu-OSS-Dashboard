import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site.config';

/* Tipografi (referensi template):
   - Instrument Serif  -> display headings
   - Inter             -> body / UI
   - JetBrains Mono    -> micro-label, kode, angka */
const display = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const base = process.env.SITE_URL ?? 'https://niumination.github.io';

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: 'Niumination — OSS Dashboard',
    template: '%s — Niumination',
  },
  description: SITE.description,
  keywords: [
    'niumination',
    'github portfolio',
    'open source',
    'aceh',
    'civic tech',
    'ai tooling',
    'dotfiles',
    'nextjs',
  ],
  authors: [{ name: 'Niumination', url: SITE.github }],
  creator: 'Niumination',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: base,
    siteName: 'Niumination',
    title: 'Niumination — OSS Dashboard',
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Niumination — OSS Dashboard',
    description: SITE.description,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#14110d',
  width: 'device-width',
  initialScale: 1,
};

const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Niumination',
  url: SITE.github,
  jobTitle: 'Pengembang Full-Stack & Engineer AI Tooling',
  sameAs: [SITE.github, SITE.sponsors, SITE.buyMeACoffee],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Aceh Tengah',
    addressRegion: 'Aceh',
    addressCountry: 'ID',
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Niumination — Dasbor OSS',
  url: base,
  inLanguage: 'id',
  publisher: { '@type': 'Person', name: 'Niumination', url: SITE.github },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${base}/repositories?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#konten"
          className="fixed top-2 left-2 z-[100] -translate-y-24 rounded-full bg-ember px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink transition-transform focus:translate-y-0"
        >
          Lewati ke konten
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        {children}
      </body>
    </html>
  );
}
