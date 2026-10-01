/**
 * Generates the favicon set and the social preview image from the brand mark.
 *
 * Run by hand after the logo changes — it is deliberately not part of
 * `npm run build`, since its output is committed:
 *
 *   node scripts/generate-icons.mjs
 *
 * Everything is composited onto the site's ink background rather than left
 * transparent, because Apple touch icons and most social previews render
 * transparency as white, which would put a pale slab around a dark brand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = path.join(root, 'src/assets/brand');
const publicDir = path.join(root, 'public');

/** --ink from src/styles/tokens.css. */
const INK = [0x0c, 0x0a, 0x07];

const read = (file) => PNG.sync.read(fs.readFileSync(file));

/**
 * Box-filter resample of an RGBA source into a width×height buffer.
 * Averaging in premultiplied space keeps the cut-out edges from fringing.
 */
function resample(src, width, height) {
  const out = Buffer.alloc(width * height * 4);
  const xRatio = src.width / width;
  const yRatio = src.height / height;

  for (let y = 0; y < height; y += 1) {
    const y0 = Math.floor(y * yRatio);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * yRatio));

    for (let x = 0; x < width; x += 1) {
      const x0 = Math.floor(x * xRatio);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * xRatio));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;

      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (sy * src.width + sx) * 4;
          const alpha = src.data[i + 3] / 255;
          r += src.data[i] * alpha;
          g += src.data[i + 1] * alpha;
          b += src.data[i + 2] * alpha;
          a += alpha;
          n += 1;
        }
      }

      const o = (y * width + x) * 4;
      const meanAlpha = a / n;
      // Un-premultiply so the stored colour survives a later composite.
      out[o] = meanAlpha ? Math.round(r / n / meanAlpha) : 0;
      out[o + 1] = meanAlpha ? Math.round(g / n / meanAlpha) : 0;
      out[o + 2] = meanAlpha ? Math.round(b / n / meanAlpha) : 0;
      out[o + 3] = Math.round(meanAlpha * 255);
    }
  }

  return { width, height, data: out };
}

/** Source over an opaque ink canvas, centred. */
function onInk(layer, canvasWidth, canvasHeight) {
  const png = new PNG({ width: canvasWidth, height: canvasHeight });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = INK[0];
    png.data[i + 1] = INK[1];
    png.data[i + 2] = INK[2];
    png.data[i + 3] = 255;
  }

  const left = Math.round((canvasWidth - layer.width) / 2);
  const top = Math.round((canvasHeight - layer.height) / 2);

  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const si = (y * layer.width + x) * 4;
      const alpha = layer.data[si + 3] / 255;
      if (!alpha) continue;
      const di = ((top + y) * canvasWidth + (left + x)) * 4;
      for (let c = 0; c < 3; c += 1) {
        png.data[di + c] = Math.round(layer.data[si + c] * alpha + png.data[di + c] * (1 - alpha));
      }
    }
  }

  return png;
}

/** Square icon: the mark scaled to `coverage` of the edge, centred on ink. */
function squareIcon(mark, size, coverage = 0.76) {
  const width = Math.round(size * coverage);
  const height = Math.max(1, Math.round((width * mark.height) / mark.width));
  return onInk(resample(mark, width, height), size, size);
}

/**
 * ICO wrapping a single 32×32 PNG. Every browser still in use reads PNG-in-ICO,
 * and it avoids hand-rolling a BMP with an inverted alpha mask.
 */
function ico(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2); // palette size: not paletted
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

const write = (file, buffer) => {
  fs.writeFileSync(path.join(publicDir, file), buffer);
  console.log(`  ${file.padEnd(26)} ${(buffer.length / 1024).toFixed(1)} kB`);
};

const mark = read(path.join(brand, 'mistroot-mark.png'));
const lockup = read(path.join(brand, 'mistroot-lockup.png'));

const favicon32 = PNG.sync.write(squareIcon(mark, 32, 0.84));
write('favicon-32x32.png', favicon32);
write('favicon.ico', ico(favicon32, 32));
write('apple-touch-icon.png', PNG.sync.write(squareIcon(mark, 180, 0.72)));

// Social preview. The lockup sits a little above centre so the wordmark lands
// on the optical middle once cards crop the top and bottom.
const ogWidth = 1200;
const ogHeight = 630;
const artWidth = Math.round(ogWidth * 0.46);
const art = resample(lockup, artWidth, Math.round((artWidth * lockup.height) / lockup.width));
fs.mkdirSync(path.join(publicDir, 'og'), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, 'og/mistroot-og.png'),
  PNG.sync.write(onInk(art, ogWidth, ogHeight)),
);
console.log(
  `  og/mistroot-og.png         ${(
    fs.statSync(path.join(publicDir, 'og/mistroot-og.png')).size / 1024
  ).toFixed(1)} kB`,
);
