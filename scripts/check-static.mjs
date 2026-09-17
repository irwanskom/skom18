/**
 * Pemeriksaan statis tanpa browser:
 * 1. Setiap aset lokal yang dirujuk HTML benar benar ada di repo.
 * 2. Setiap tautan anchor menunjuk ke id yang ada di halaman.
 * 3. Pagar desain: tanpa em dash, tanpa listener scroll.
 *
 * Pagar nomor 3 menjaga dua keputusan desain situs ini. Em dash adalah
 * penanda teks hasil generator, dan listener scroll memicu kerja di
 * setiap frame. Keduanya diganti IntersectionObserver.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const html = read('index.html');
const problems = [];
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// 1. Aset lokal
const assetAttrs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
const localAssets = assetAttrs.filter(
  (u) => !/^(https?:|mailto:|tel:|#|data:)/.test(u)
);
for (const asset of new Set(localAssets)) {
  const clean = asset.split(/[?#]/)[0];
  if (!existsSync(join(root, clean))) {
    problems.push(`Aset tidak ditemukan: ${clean}`);
  }
}

// 2. Anchor internal
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = assetAttrs.filter((u) => u.startsWith('#') && u.length > 1);
for (const anchor of new Set(anchors)) {
  if (!ids.has(anchor.slice(1))) {
    problems.push(`Anchor menunjuk id yang tidak ada: ${anchor}`);
  }
}

// 3. Pagar desain
for (const file of ['index.html', 'css/style.css', 'js/main.js']) {
  const source = read(file);

  for (const match of source.matchAll(/[—–]/g)) {
    problems.push(
      `${file}:${lineOf(source, match.index)} memakai em dash atau en dash, ` +
        'gunakan tanda hubung biasa'
    );
  }

  for (const match of source.matchAll(/addEventListener\(\s*['"]scroll['"]/g)) {
    problems.push(
      `${file}:${lineOf(source, match.index)} memasang listener scroll, ` +
        'gunakan IntersectionObserver'
    );
  }
}

if (problems.length) {
  console.error('Pemeriksaan statis gagal:\n');
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}

console.log(
  `Pemeriksaan statis lolos: ${new Set(localAssets).size} aset, ` +
    `${new Set(anchors).size} anchor, pagar desain bersih.`
);
