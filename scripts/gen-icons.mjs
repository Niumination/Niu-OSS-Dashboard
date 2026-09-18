/**
 * Generator semua ikon PNG situs — tanpa dependensi eksternal.
 *
 *   node scripts/gen-icons.mjs
 *
 * Menggambar brand mark (hexagon ember + titik cyan di atas latar ink)
 * dengan 2x supersampling + encoder PNG manual (IHDR/IDAT/IEND):
 *
 *   app/apple-icon.png        180x180  (rounded, luar transparan)
 *   public/icons/icon-192.png 192x192  (rounded)
 *   public/icons/icon-512.png 512x512  (rounded)
 *   public/icons/maskable-512.png 512x512 (latar penuh + safe-zone 80%)
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INK = [20, 17, 13]; // #14110d
const EMBER = [224, 90, 30]; // #e05a1e
const CYAN = [0, 229, 255]; // #00e5ff

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* Signed distance: rounded rect (koordinat px final). */
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/* Jarak titik ke segmen. */
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

/**
 * Render satu ikon.
 * @param {number} size  sisi kanvas (px)
 * @param {object} opts
 *   bgScale  : skala rounded-rect latar terhadap sisi (1 = penuh/solid)
 *   markScale: skala brand mark terhadap normal (maskable < 1)
 *   solid    : true -> latar penuh solid (tanpa rounded/transparan)
 */
function renderIcon(size, { markScale = 1, solid = false } = {}) {
  const SS = 2;
  // Geometri basis dalam "unit" 64 (viewBox brand mark), diskalakan ke kanvas.
  const K = (size / 64) * markScale;
  const cx = size / 2;
  const cy = size / 2;
  const HEX = [
    [32, 14], [47.6, 23], [47.6, 41], [32, 50], [16.4, 41], [16.4, 23], [32, 14],
  ].map(([x, y]) => [cx + (x - 32) * K, cy + (y - 32) * K]);
  const STROKE_HW = (4.5 / 2) * K;
  const DOT = { x: cx + (47 - 32) * K, y: cy + (17 - 32) * K, r: 5 * K };
  // Rounded-rect latar: normal 56/64 dari sisi; solid = seluruh kanvas.
  const BG = solid
    ? { cx, cy, hw: size / 2, hh: size / 2, r: 0 }
    : { cx, cy, hw: 28 * (size / 64), hh: 28 * (size / 64), r: 14 * (size / 64) };

  const px = Buffer.alloc(size * size * 4);
  for (let oy = 0; oy < size; oy++) {
    for (let ox = 0; ox < size; ox++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = ox + (sx + 0.5) / SS;
          const y = oy + (sy + 0.5) / SS;

          const covBg = solid ? 1 : clamp01(0.5 - sdRoundRect(x, y, BG.cx, BG.cy, BG.hw, BG.hh, BG.r));
          if (covBg <= 0) continue;

          let sr = INK[0], sg = INK[1], sb = INK[2];

          let dHex = Infinity;
          for (let i = 0; i < HEX.length - 1; i++) {
            const [ax, ay] = HEX[i];
            const [bx, by] = HEX[i + 1];
            dHex = Math.min(dHex, segDist(x, y, ax, ay, bx, by));
          }
          const covHex = clamp01(STROKE_HW + 0.5 - dHex);
          if (covHex > 0) {
            sr = EMBER[0] * covHex + sr * (1 - covHex);
            sg = EMBER[1] * covHex + sg * (1 - covHex);
            sb = EMBER[2] * covHex + sb * (1 - covHex);
          }

          const covDot = clamp01(0.5 - (Math.hypot(x - DOT.x, y - DOT.y) - DOT.r));
          if (covDot > 0) {
            sr = CYAN[0] * covDot + sr * (1 - covDot);
            sg = CYAN[1] * covDot + sg * (1 - covDot);
            sb = CYAN[2] * covDot + sb * (1 - covDot);
          }

          r += sr * covBg;
          g += sg * covBg;
          b += sb * covBg;
          a += covBg;
        }
      }
      const i = (oy * size + ox) * 4;
      px[i] = a > 0 ? Math.round(r / a) : 0;
      px[i + 1] = a > 0 ? Math.round(g / a) : 0;
      px[i + 2] = a > 0 ? Math.round(b / a) : 0;
      px[i + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  return encodePng(px, size, size);
}

/* --- encoder PNG minimal -------------------------------------------------- */
let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(px, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0; // filter: none
    px.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --- jalankan -------------------------------------------------------------- */
const root = process.cwd();
const iconsDir = join(root, 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

const outputs = [
  { path: join(root, 'app', 'apple-icon.png'), png: renderIcon(180) },
  { path: join(iconsDir, 'icon-192.png'), png: renderIcon(192) },
  { path: join(iconsDir, 'icon-512.png'), png: renderIcon(512) },
  // Maskable: latar penuh + mark 62% agar aman di safe-zone bundar 80%.
  { path: join(iconsDir, 'maskable-512.png'), png: renderIcon(512, { markScale: 0.62, solid: true }) },
];

for (const { path, png } of outputs) {
  writeFileSync(path, png);
  console.log(`✔ ${path.replace(root + '/', '')} (${png.length.toLocaleString('id-ID')} bytes)`);
}
