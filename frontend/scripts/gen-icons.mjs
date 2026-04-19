#!/usr/bin/env node
// قناوي — Convert the master SVG icons to PNGs required by the
// Web App Manifest and Android APK (TWA / PWABuilder).
//
// Usage:
//   npm run gen-icons
//
// Requires `sharp` (installed as a devDependency).

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');
const OUT = resolve(PUBLIC, 'icons');

const TASKS = [
  { src: 'logo.svg',           size:  192, file: 'icon-192.png' },
  { src: 'logo.svg',           size:  512, file: 'icon-512.png' },
  { src: 'icon-maskable.svg',  size:  512, file: 'icon-maskable-512.png' },
  { src: 'icon-maskable.svg',  size:  192, file: 'icon-maskable-192.png' },
  { src: 'apple-touch-icon.svg', size: 180, file: 'apple-touch-icon-180.png' },
  { src: 'logo.svg',           size:   32, file: 'favicon-32.png' },
  { src: 'logo.svg',           size:   16, file: 'favicon-16.png' },
];

await mkdir(OUT, { recursive: true });
for (const t of TASKS) {
  const input = resolve(PUBLIC, t.src);
  const output = resolve(OUT, t.file);
  await sharp(input, { density: 384 }).resize(t.size, t.size).png().toFile(output);
  console.log(`✓ ${t.file}  (${t.size}x${t.size})  ← ${t.src}`);
}
console.log('\nAll icons written to', OUT);
