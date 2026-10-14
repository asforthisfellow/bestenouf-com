import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const files = walk(root);
const textExtensions = new Set(['.html', '.js', '.mjs', '.json', '.md', '.txt', '.xml', '.css', '.yml', '.yaml']);
const textFiles = files.filter((file) => textExtensions.has(path.extname(file).toLowerCase()) || path.basename(file) === 'CNAME');

if (!fs.existsSync(path.join(root, 'index.html'))) fail('index.html is missing');
if (!fs.existsSync(path.join(root, '.nojekyll'))) fail('.nojekyll is missing');
if (fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() !== 'bestenouf.com') fail('CNAME must contain only bestenouf.com');

for (const jsonPath of ['checkout-catalog.json', 'firebase.json']) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, jsonPath), 'utf8'));
  } catch (error) {
    fail(`${jsonPath} is not valid JSON: ${error.message}`);
  }
}

const forbidden = [
  [/\bsk_(?:live|test)_[A-Za-z0-9]+/g, 'Stripe secret key'],
  [/\bwhsec_[A-Za-z0-9]+/g, 'Stripe webhook secret'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, 'private key'],
  [/PAYPAL_CLIENT_SECRET\s*[:=]\s*["'][^"']+["']/g, 'embedded PayPal client secret'],
  [/STRIPE_SECRET_KEY\s*[:=]\s*["'][^"']+["']/g, 'embedded Stripe secret key'],
];

for (const file of textFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) fail(`${relative} contains a possible ${label}`);
  }
}

const htmlFiles = files.filter((file) => path.extname(file).toLowerCase() === '.html');
for (const file of htmlFiles) {
  const relative = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  const attributes = source.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi);
  for (const match of attributes) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    const clean = decodeURIComponent(raw.split('#')[0].split('?')[0]);
    let target = path.resolve(path.dirname(file), clean);
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) fail(`${relative} references missing local file ${raw}`);
  }

  for (const image of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(image[0])) fail(`${relative} contains an image without alt text`);
  }

  for (const link of source.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi)) {
    if (!/\brel\s*=\s*["'][^"']*\bnoopener\b[^"']*["']/i.test(link[0])) fail(`${relative} contains target=_blank without rel=noopener`);
  }
}

const store = fs.readFileSync(path.join(root, 'assets/js/store.js'), 'utf8');
const config = fs.readFileSync(path.join(root, 'assets/js/store-config.js'), 'utf8');
if (store.includes('price_REPLACE_')) fail('store.js contains placeholder Stripe price IDs');
if (!store.includes("'&': '&amp;'") || !store.includes("'<': '&lt;'") || !store.includes("'>': '&gt;'")) fail('store.js output escaping is incomplete');
if (/checkoutEnabled:\s*true/.test(config) && store.includes('price_REPLACE_')) fail('Checkout cannot be enabled with placeholder prices');

if (failures.length) {
  console.error(`Site verification failed with ${failures.length} problem(s):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Site verification passed: ${htmlFiles.length} HTML pages and ${files.length} files checked.`);
