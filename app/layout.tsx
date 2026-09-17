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
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#14110d',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Niumination',
  url: SITE.github,
  jobTitle: 'Full-Stack Developer & AI Tooling Engineer',
  sameAs: [SITE.github, SITE.sponsors, SITE.buyMeACoffee],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Aceh Tengah',
    addressRegion: 'Aceh',
    addressCountry: 'ID',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
