/**
 * Generator apple-touch-icon PNG (180x180) — tanpa dependensi eksternal.
 *
 * Menggambar ulang brand mark (hexagon ember + titik cyan di atas latar ink)
 * dengan 2x supersampling, lalu mengodekan PNG (IHDR/IDAT/IEND) manual.
 *
 *   node scripts/gen-apple-icon.mjs   -> app/apple-icon.png
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 180; // ukuran final
const SS = 2; // faktor supersampling

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

/* Geometri brand mark dalam viewBox 64 (diambil dari app/icon.svg). */
const K = OUT / 64; // skala viewBox -> px final
const HEX = [
  [32, 14], [47.6, 23], [47.6, 41], [32, 50], [16.4, 41], [16.4, 23], [32, 14],
];
const STROKE_HW = (4.5 / 2) * K; // setengah lebar stroke (px final)
const DOT = { x: 47 * K, y: 17 * K, r: 5 * K };
const BG = { cx: OUT / 2, cy: OUT / 2, hw: 28 * K, hh: 28 * K, r: 14 * K };

/* --- render dengan supersampling ---------------------------------------- */
const px = Buffer.alloc(OUT * OUT * 4);
for (let oy = 0; oy < OUT; oy++) {
  for (let ox = 0; ox < OUT; ox++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const x = ox + (sx + 0.5) / SS;
        const y = oy + (sy + 0.5) / SS;

        const covBg = clamp01(0.5 - sdRoundRect(x, y, BG.cx, BG.cy, BG.hw, BG.hh, BG.r));
        if (covBg <= 0) continue;

        let sr = INK[0], sg = INK[1], sb = INK[2];

        let dHex = Infinity;
        for (let i = 0; i < HEX.length - 1; i++) {
          const [ax, ay] = HEX[i];
          const [bx, by] = HEX[i + 1];
          dHex = Math.min(dHex, segDist(x, y, ax * K, ay * K, bx * K, by * K));
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
    const i = (oy * OUT + ox) * 4;
    // warna tidak-premultiplied = total / total-alpha; alpha = rata-rata coverage
    px[i] = a > 0 ? Math.round(r / a) : 0;
    px[i + 1] = a > 0 ? Math.round(g / a) : 0;
    px[i + 2] = a > 0 ? Math.round(b / a) : 0;
    px[i + 3] = Math.round((a / (SS * SS)) * 255);
  }
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

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(OUT, 0);
ihdr.writeUInt32BE(OUT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const raw = Buffer.alloc(OUT * (1 + OUT * 4));
for (let y = 0; y < OUT; y++) {
  raw[y * (1 + OUT * 4)] = 0; // filter: none
  px.copy(raw, y * (1 + OUT * 4) + 1, y * OUT * 4, (y + 1) * OUT * 4);
}
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const outPath = join(process.cwd(), 'app', 'apple-icon.png');
writeFileSync(outPath, png);
const svgPath = join(process.cwd(), 'app', 'apple-icon.svg');
if (existsSync(svgPath)) rmSync(svgPath);
console.log(`✔ app/apple-icon.png (${png.length.toLocaleString('id-ID')} bytes, ${OUT}x${OUT} RGBA)`);
