#!/usr/bin/env node
// scripts/generate-icons.mjs
// Downloads the 1Move/SYSTM8 logo from Supabase and resizes to PWA icon sizes.
// Run: node scripts/generate-icons.mjs
// This runs automatically during Vercel builds via the "prebuild" npm script.

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const LOGO_URL = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png';

const SIZES = [
  { name: 'icon-180x180.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192 },
  { name: 'icon-maskable-512x512.png', size: 512 },
];

function download(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('[generate-icons] sharp not available, skipping icon generation');
    return;
  }

  console.log('[generate-icons] Downloading logo from Supabase...');
  let buf;
  try {
    buf = await download(LOGO_URL);
    console.log(`[generate-icons] Downloaded ${buf.length} bytes`);
  } catch (err) {
    console.log(`[generate-icons] Download failed: ${err.message} — keeping existing icons`);
    return;
  }

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  for (const { name, size } of SIZES) {
    const outPath = path.join(ICONS_DIR, name);
    await sharp(buf).resize(size, size, { fit: 'cover' }).png().toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`[generate-icons] Created ${name} (${stat.size} bytes)`);
  }

  console.log('[generate-icons] All icons generated successfully');
}

main().catch(err => {
  console.error('[generate-icons] Error:', err.message);
  // Don't fail the build — existing placeholder icons will be used
  process.exit(0);
});
