import React from 'react';

/**
 * Builder OpenGraph image (JSX untuk satori / @vercel/og).
 *
 * Font yang tersedia di runtime satori bawaan @vercel/og hanya "sans serif"
 * (700) — jadi semua elemen memakainya; aksen tipografis dibuat lewat
 * letterSpacing / weight / warna. SVG inline (path/circle) didukung satori.
 */

export const OG = {
  bg: '#14110d',
  panel: '#1b1712',
  cream: '#f2ecdf',
  dim: 'rgba(242,236,223,0.55)',
  faint: 'rgba(242,236,223,0.32)',
  line: 'rgba(242,236,223,0.12)',
  ember: '#e05a1e',
  emberSoft: '#f07f45',
  cyan: '#00e5ff',
} as const;

const FONT = 'sans serif' as const;

function clamp(s: string | null, n: number): string {
  const t = s ?? '';
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path
        d="M32 14l15.6 9v18L32 50l-15.6-9V23z"
        fill="none"
        stroke={OG.ember}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <circle cx="47" cy="17" r="5.5" fill={OG.cyan} />
    </svg>
  );
}

function StatBox({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '22px 34px',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${OG.line}`,
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 44, color: OG.cream, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 15, color: OG.dim, letterSpacing: 3 }}>{label}</div>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: accent }} />
    </div>
  );
}

function Chip({ label, dotColor }: { label: string; dotColor?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: '10px 22px',
        borderRadius: 999,
        border: `1px solid ${OG.line}`,
        background: 'rgba(255,255,255,0.04)',
        fontFamily: FONT,
      }}
    >
      {dotColor ? <div style={{ width: 14, height: 14, borderRadius: 7, background: dotColor }} /> : null}
      <div style={{ fontSize: 18, color: OG.cream, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: OG.bg,
        padding: '56px 64px',
        boxSizing: 'border-box',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 5,
          background: `linear-gradient(90deg, ${OG.ember} 0%, ${OG.emberSoft} 45%, ${OG.cyan} 100%)`,
        }}
      />
      {children}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderTop: `1px solid ${OG.line}`,
          paddingTop: 22,
        }}
      >
        <div style={{ fontSize: 19, color: OG.faint, letterSpacing: 1 }}>
          open systems, built in public.
        </div>
        <div style={{ fontSize: 19, color: OG.emberSoft, letterSpacing: 1 }}>
          github.com/Niumination
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            background: OG.panel,
            border: `2px solid ${OG.ember}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrandMark />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 56, color: OG.cream, fontWeight: 700, letterSpacing: -1 }}>
            niumination
          </div>
          <div style={{ fontSize: 21, color: OG.dim, letterSpacing: 1 }}>
            github.com/Niumination · aceh tengah, id
          </div>
        </div>
      </div>
      <div style={{ fontSize: 17, color: OG.faint, letterSpacing: 5 }}>OSS DASHBOARD</div>
    </div>
  );
}

export function HomeOg({
  repos,
  stars,
  followers,
}: {
  repos: number;
  stars: number;
  followers: number;
}) {
  return (
    <Frame>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, width: '100%' }}>
        <div style={{ fontSize: 32, color: 'rgba(242,236,223,0.82)', lineHeight: 1.4, letterSpacing: 0.5 }}>
          {
            'Full-stack developer & AI tooling engineer — civic tech, ' +
            '\n' +
            'terminal-native AI, dan dotfiles yang benar-benar boot.'
          }
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 22 }}>
          <StatBox value={String(repos)} label="REPOSITORIES" accent={OG.ember} />
          <StatBox value={String(stars)} label="STARS" accent={OG.cyan} />
          <StatBox value={String(followers)} label="FOLLOWERS" accent={OG.emberSoft} />
        </div>
      </div>
    </Frame>
  );
}

export function RepoOg({
  name,
  description,
  language,
  stars,
  fork,
}: {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  fork: boolean;
}) {
  const desc = clamp(description, 108) || 'Repositori publik Niumination.';
  return (
    <Frame>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 50, color: OG.cream, fontWeight: 700, letterSpacing: -1 }}>
            {clamp(name, 32)}
          </div>
          <div style={{ fontSize: 23, color: 'rgba(242,236,223,0.65)', lineHeight: 1.45 }}>
            {desc}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Chip label={language ?? 'no language'} dotColor={language ? OG.cyan : undefined} />
          <Chip label={`${stars} stars`} dotColor="#f5c518" />
          <Chip label={fork ? 'fork' : 'original'} dotColor={fork ? OG.ember : OG.emberSoft} />
        </div>
      </div>
    </Frame>
  );
}
