/**
 * Builds the static GitHub Pages version of the site into ./_site
 *  - copies public/ (minus the admin panel, which needs the server)
 *  - writes the catalog + business info as JSON (from the same seed the server uses)
 *  - flags every page as "static" so orders/quotes go to WhatsApp instead of the API
 * Business details come from env vars (GitHub repo "Variables" in CI).
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { SEED_PRODUCTS } from '../src/products/seed';
import { CATEGORIES } from '../src/products/categories';

const root = join(__dirname, '..');
const out = join(root, '_site');
rmSync(out, { recursive: true, force: true });
cpSync(join(root, 'public'), out, { recursive: true });
rmSync(join(out, 'admin.html'), { force: true });

const e = process.env;
const site = {
  name: e.SITE_NAME || 'Jugnu',
  whatsapp: e.SITE_WHATSAPP || '923000000000',
  phone: e.SITE_PHONE || '+92 300 0000000',
  email: e.SITE_EMAIL || 'info@jugnutextiles.pk',
  address: e.SITE_ADDRESS || 'Main Ichra Bazaar, Ferozepur Road, Lahore, Pakistan',
  categories: CATEGORIES,
};
const products = SEED_PRODUCTS.map((p, i) => ({ ...p, imageUrl: null, inStock: true, active: true, sortOrder: i }));

mkdirSync(join(out, 'data'), { recursive: true });
writeFileSync(join(out, 'data', 'site.json'), JSON.stringify(site));
writeFileSync(join(out, 'data', 'products.json'), JSON.stringify(products));
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');

for (const f of readdirSync(out).filter((f) => f.endsWith('.html'))) {
  const p = join(out, f);
  writeFileSync(p, readFileSync(p, 'utf8').replace('<head>', '<head>\n<meta name="jugnu-mode" content="static">'));
}
writeFileSync(join(out, '404.html'), readFileSync(join(out, 'index.html'), 'utf8'));
console.log(`Static site built in _site/ (${products.length} products)`);
