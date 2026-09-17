/**
 * Audit Lighthouse pada halaman yang disajikan lewat HTTP lokal.
 *
 * Ambang batas hanya dipasang untuk kategori yang stabil antar mesin.
 * Skor performa ikut dilaporkan tetapi tidak menggagalkan CI, karena
 * angkanya bergantung pada kecepatan runner dan CDN pihak ketiga
 * (Google Fonts dan Font Awesome) yang di luar kendali repo ini.
 */
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { startServer } from './server.mjs';

const THRESHOLDS = {
  accessibility: 0.95,
  seo: 0.95,
  'best-practices': 0.9,
};

const server = await startServer();
const chrome = await launch({
  chromePath: process.env.CHROMIUM_PATH || undefined,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
});

let failed = false;

try {
  const { lhr } = await lighthouse(server.url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  for (const [id, category] of Object.entries(lhr.categories)) {
    const score = category.score ?? 0;
    const min = THRESHOLDS[id];
    const pct = Math.round(score * 100);

    if (min === undefined) {
      console.log(`  info   ${category.title}: ${pct}`);
      continue;
    }

    if (score >= min) {
      console.log(`  lolos  ${category.title}: ${pct} (min ${Math.round(min * 100)})`);
    } else {
      failed = true;
      console.error(`  gagal  ${category.title}: ${pct} (min ${Math.round(min * 100)})`);
      Object.values(lhr.audits)
        .filter((a) => a.score !== null && a.score < 1 && category.auditRefs
          .some((ref) => ref.id === a.id && ref.weight > 0))
        .slice(0, 8)
        .forEach((a) => console.error(`    ${a.id}: ${a.title}`));
    }
  }
} finally {
  await chrome.kill();
  await server.close();
}

if (failed) {
  console.error('\nAudit Lighthouse gagal.');
  process.exit(1);
}

console.log('\nAudit Lighthouse lolos.');
