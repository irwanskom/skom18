/**
 * Audit aksesibilitas dengan axe-core.
 * Halaman dipindai pada mode terang dan gelap, ukuran desktop dan mobile,
 * karena kontras dan tata letak berbeda di tiap kombinasi.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { startServer } from './server.mjs';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const VIEWS = [
  { name: 'desktop terang', width: 1440, height: 900, colorScheme: 'light' },
  { name: 'desktop gelap', width: 1440, height: 900, colorScheme: 'dark' },
  { name: 'mobile terang', width: 390, height: 844, colorScheme: 'light' },
  { name: 'mobile gelap', width: 390, height: 844, colorScheme: 'dark' },
];

const server = await startServer();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

let failed = 0;

try {
  for (const view of VIEWS) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      colorScheme: view.colorScheme,
    });
    const page = await context.newPage();
    await page.goto(server.url, { waitUntil: 'load' });

    // Animasi dimatikan dan semua elemen reveal dimunculkan. Tanpa ini axe
    // memindai elemen yang masih di tengah transisi, lalu melaporkan kontras
    // dari opasitas parsial, bukan dari keadaan akhir halaman.
    await page.addStyleTag({
      content: `*, *::before, *::after { transition: none !important; animation: none !important; }
                [data-reveal] { opacity: 1 !important; transform: none !important; }`,
    });
    await page.evaluate(() => {
      document
        .querySelectorAll('[data-reveal]')
        .forEach((el) => el.classList.add('is-in'));
    });
    await page.waitForTimeout(250);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    if (violations.length === 0) {
      console.log(`  lolos  ${view.name}`);
    } else {
      failed += violations.length;
      console.error(`  gagal  ${view.name}`);
      for (const v of violations) {
        console.error(`    [${v.impact}] ${v.id}: ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.error(`      ${node.target.join(' ')}`);
        }
        console.error(`      ${v.helpUrl}`);
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

if (failed) {
  console.error(`\nAudit aksesibilitas gagal: ${failed} pelanggaran.`);
  process.exit(1);
}

console.log('\nAudit aksesibilitas lolos di seluruh kombinasi.');
