/**
 * Build static export (untuk GitHub Pages / hosting statis tanpa server).
 *
 *   npm run export:static
 *
 * Alur:
 *   1. Regenerasi snapshot fallback (npm run gen:mock) agar data build segar.
 *   2. Ganti next.config.ts dengan varian `output: 'export'` (config asli di-backup).
 *   3. Pindahkan app/api/ ke luar (route handler tidak didukung static export).
 *   4. next build dengan NEXT_PUBLIC_STATIC_EXPORT=1 — semua halaman & OG image
 *      dirender statis dari snapshot; generateStaticParams memastikan 91+ halaman
 *      detail repo ikut ter-generate.
 *   5. Pulihkan semua file. Hasil ada di out/ — deploy isian out/ ke Pages.
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const cfg = join(root, 'next.config.ts');
const cfgBackup = join(root, '.next-config-server.bak');
const apiDir = join(root, 'app', 'api');
const apiDisabled = join(root, '.app-api-disabled');
const repoPage = join(root, 'app', 'repo', '[slug]', 'page.tsx');
let repoPageBackup = null;

function sh(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

const restore = () => {
  try {
    if (existsSync(cfgBackup)) {
      writeFileSync(cfg, readFileSync(cfgBackup, 'utf8'));
      rmSync(cfgBackup, { force: true });
    }
    if (existsSync(apiDisabled) && !existsSync(apiDir)) {
      cpSync(apiDisabled, apiDir, { recursive: true });
      rmSync(apiDisabled, { recursive: true, force: true });
    }
    if (repoPageBackup !== null) {
      writeFileSync(repoPage, repoPageBackup, 'utf8');
      repoPageBackup = null;
    }
    // Catatan: folder out/ TIDAK dihapus di sini — ia adalah hasil build.
    // Out/ hanya dibersihkan saat build GAGAL (lihat blok catch).
  } catch (e) {
    console.error('Gagal memulihkan file:', e.message);
  }
};

process.on('exit', () => {
  if (existsSync(cfgBackup) || existsSync(apiDisabled)) restore();
});

try {
  sh('node scripts/gen-mock.mjs');
  // API publik v1 (JSON statis) ikut di-regenerate dari snapshot segar.
  sh('node scripts/gen-api.mjs');

  if (!existsSync(cfgBackup)) writeFileSync(cfgBackup, readFileSync(cfg, 'utf8'));
  writeFileSync(
    cfg,
    `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
`,
  );
  console.log('✔ next.config.ts -> varian static export');

  if (existsSync(apiDir)) {
    if (existsSync(apiDisabled)) rmSync(apiDisabled, { recursive: true, force: true });
    mkdirSync(apiDisabled, { recursive: true });
    cpSync(apiDir, apiDisabled, { recursive: true });
    rmSync(apiDir, { recursive: true });
    console.log('✔ app/api/ dinonaktifkan (tidak didukung static export)');
  }

  // Pada output:'export', dynamicParams: true tidak boleh ada.
  if (existsSync(repoPage)) {
    repoPageBackup = readFileSync(repoPage, 'utf8');
    writeFileSync(
      repoPage,
      repoPageBackup.replace('export const dynamicParams = true;', 'export const dynamicParams = false;'),
      'utf8',
    );
    console.log('✔ dynamicParams di-patch -> false (syarat static export)');
  }

  const env = { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: '1' };
  try {
    execSync('next build', { cwd: root, stdio: 'inherit', env });
  } catch (e) {
    // Build gagal: hapus artefak partial agar tidak keliru di-deploy.
    rmSync(join(root, 'out'), { recursive: true, force: true });
    throw e;
  }
  console.log('\n✔ Build sukses. Hasil: out/ — salin isian out/ ke branch yang dilayani GitHub Pages (lihat README).');
} finally {
  restore();
}
