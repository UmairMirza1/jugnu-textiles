import type { CartLine, Category, Pattern, Product, SiteInfo } from './types.js';

/* ---------------- DOM helpers ---------------- */
export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T | null;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[];
export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const rs = (n: number) => 'Rs ' + Math.round(n).toLocaleString('en-PK');

/* ---------------- API ---------------- */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch('/api' + path, { ...init, headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message || `Request failed (${res.status})`;
    throw new Error(res.status === 429 ? 'Too many requests — please wait a minute and try again.' : msg);
  }
  return body as T;
}
let siteP: Promise<SiteInfo> | null = null;
export const getSite = () => (siteP ??= api<SiteInfo>('/site'));
let productsP: Promise<Product[]> | null = null;
export const getProducts = () => (productsP ??= api<Product[]>('/products'));
export const catName = (cats: Category[], id: string) => { const c = cats.find((x) => x.id === id); return c ? (lang() === 'ur' ? c.ur : c.en) : id; };
export const waLink = (num: string, text: string) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;

/* ---------------- i18n (English lives in the HTML; Urdu here) ---------------- */
const UR: Record<string, string> = {
  'nav.home': 'ہوم', 'nav.products': 'کلیکشن', 'nav.wholesale': 'ہول سیل', 'nav.about': 'ہنر', 'nav.contact': 'رابطہ',
  'top.made': 'اچھرہ، لاہور میں تیار کردہ — ملک بھر میں ڈیلیوری', 'cart.title': 'آرڈر لسٹ', 'cart.empty': 'آپ کی لسٹ خالی ہے۔ پروڈکٹس سے آئٹمز شامل کریں۔',
  'cart.total': 'اندازاً کل رقم', 'cart.send': 'آرڈر بھیجیں', 'cart.note': 'ہماری ٹیم قیمت اور ڈیلیوری کی تصدیق کے لیے فون/واٹس ایپ کرے گی۔ ابھی کوئی ادائیگی نہیں۔',
  'btn.add': 'لسٹ میں شامل کریں', 'btn.details': 'تفصیل', 'btn.shop': 'کلیکشن دیکھیں', 'btn.quote': 'ہول سیل ریٹ', 'btn.wa': 'واٹس ایپ پر آرڈر',
  'btn.send': 'بھیجیں', 'f.name': 'نام', 'f.phone': 'فون / واٹس ایپ', 'f.city': 'شہر', 'f.type': 'آپ کون ہیں؟', 'f.msg': 'پیغام', 'f.business': 'دکان / کمپنی کا نام', 'f.email': 'ای میل',
  'hero.eyebrow': '1995 سے بیڈ شیٹ مینوفیکچررز', 'hero.title': 'سکون کی نیند، خوبصورتی سے تیار۔', 'hero.lead': 'خالص کاٹن بیڈنگ، اچھرہ لاہور میں تیار۔<br>براہِ راست فیکٹری سے۔',
  'stat.years': 'سال کا تجربہ', 'stat.monthly': 'ماہانہ پیداوار (سیٹ)', 'stat.cities': 'شہروں میں ڈیلرز',
  'sec.cats': 'کیٹیگریز', 'sec.featured': 'نیا اور مقبول۔', 'sec.why': 'جگنو کیوں؟', 'sec.process': 'دھاگے سے بیڈ تک', 'sec.faq': 'سوالات۔',
  'cta.title': 'دکاندار ہیں؟<br>فیکٹری ریٹ پر خریدیں۔', 'cta.text': 'کم از کم آرڈر صرف 6 پیس سے۔ پورے پاکستان میں کارگو ڈیلیوری۔',
  'filter.category': 'کیٹیگری', 'filter.fabric': 'کپڑا', 'filter.search': 'تلاش کریں…', 'sort.default': 'ترتیب: نمایاں', 'sort.low': 'قیمت: کم سے زیادہ', 'sort.high': 'قیمت: زیادہ سے کم',
  'p.wholesale': 'ہول سیل', 'p.moq': 'کم از کم آرڈر', 'p.size': 'سائز منتخب کریں', 'p.qty': 'تعداد',
};
export const lang = (): 'en' | 'ur' => { try { return localStorage.getItem('jt-lang') === 'ur' ? 'ur' : 'en'; } catch { return 'en'; } };
export function applyLang() {
  const l = lang();
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
    // UR strings are trusted constants; English is the page's own original markup
    el.innerHTML = l === 'ur' && UR[key] ? UR[key] : el.dataset.en;
  });
  $$<HTMLInputElement>('[data-i18n-ph]').forEach((el) => {
    const key = el.dataset.i18nPh!;
    if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder;
    el.placeholder = l === 'ur' && UR[key] ? UR[key] : el.dataset.enPh;
  });
  const t = $('#lang-toggle'); if (t) t.textContent = l === 'ur' ? 'EN' : 'اردو';
}
export const t = (key: string, en: string) => (lang() === 'ur' && UR[key]) || en;

/* ---------------- product illustration (used until real photos are uploaded) ---------------- */
let artSeq = 0;
function patternDef(id: string, p: Pattern, scale = 1): string {
  const [c0, c1 = c0, c2 = c1] = p.colors;
  const s = 40 * scale;
  switch (p.type) {
    case 'stripe':
      return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c0}"/><rect width="${s * 0.22}" height="${s}" fill="${c1}"/><rect x="${s * 0.45}" width="${s * 0.06}" height="${s}" fill="${c2}"/><rect x="${s * 0.7}" width="${s * 0.06}" height="${s}" fill="${c2}"/></pattern>`;
    case 'check':
      return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c0}"/><rect width="${s * 0.45}" height="${s}" fill="${c1}" opacity=".45"/><rect width="${s}" height="${s * 0.45}" fill="${c1}" opacity=".45"/><rect x="${s * 0.7}" width="${s * 0.05}" height="${s}" fill="${c2}"/><rect y="${s * 0.7}" width="${s}" height="${s * 0.05}" fill="${c2}"/></pattern>`;
    case 'floral': {
      const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${s * 0.5}" cy="${s * 0.33}" rx="${s * 0.09}" ry="${s * 0.17}" fill="${c1}" transform="rotate(${a} ${s * 0.5} ${s * 0.5})"/>`).join('');
      return `<pattern id="${id}" width="${s * 1.4}" height="${s * 1.4}" patternUnits="userSpaceOnUse"><rect width="${s * 1.4}" height="${s * 1.4}" fill="${c0}"/>${petals}<circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.08}" fill="${c2}"/><ellipse cx="${s * 1.12}" cy="${s * 1.05}" rx="${s * 0.16}" ry="${s * 0.06}" fill="${c2}" transform="rotate(-35 ${s * 1.12} ${s * 1.05})"/><circle cx="${s * 1.15}" cy="${s * 0.2}" r="${s * 0.05}" fill="${c1}" opacity=".7"/></pattern>`;
    }
    case 'dots':
      return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c0}"/><circle cx="${s * 0.25}" cy="${s * 0.25}" r="${s * 0.1}" fill="${c1}"/><circle cx="${s * 0.75}" cy="${s * 0.75}" r="${s * 0.07}" fill="${c2}"/><circle cx="${s * 0.75}" cy="${s * 0.25}" r="${s * 0.03}" fill="${c1}" opacity=".6"/></pattern>`;
    case 'geometric':
      return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${c0}"/><path d="M${s / 2} ${s * 0.08}L${s * 0.92} ${s / 2}L${s / 2} ${s * 0.92}L${s * 0.08} ${s / 2}Z" fill="${c1}"/><path d="M${s / 2} ${s * 0.3}L${s * 0.7} ${s / 2}L${s / 2} ${s * 0.7}L${s * 0.3} ${s / 2}Z" fill="${c2}"/><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.06}" fill="${c0}"/></pattern>`;
    default:
      return `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${c0}"/><path d="M0 8L8 0" stroke="${c1}" stroke-width=".6" opacity=".5"/></pattern>`;
  }
}
export function productArt(p: Pick<Product, 'pattern' | 'imageUrl' | 'name'>): string {
  if (p.imageUrl) return `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy">`;
  const id = `pt${++artSeq}`;
  const layers = [0, 1, 2, 3, 4].map((i) => `<rect x="70" y="${146 + i * 18}" width="260" height="18" rx="9" fill="url(#${id})"/><rect x="70" y="${146 + i * 18}" width="260" height="18" rx="9" fill="url(#${id}f)"/>`).join('');
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(p.name)}">
  <defs>${patternDef(id, p.pattern, 0.55)}
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#ececf0"/></linearGradient>
    <radialGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8791f"/><stop offset=".5" stop-color="#e2bd66"/><stop offset="1" stop-color="#a8791f"/></linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#${id}b)"/>
  <ellipse cx="200" cy="244" rx="168" ry="16" fill="url(#${id}s)"/>
  <g transform="rotate(-5 210 110)"><rect x="104" y="72" width="226" height="84" rx="38" fill="url(#${id})"/><rect x="104" y="72" width="226" height="84" rx="38" fill="#fff" opacity=".22"/><rect x="104" y="72" width="226" height="84" rx="38" fill="none" stroke="#000" stroke-opacity=".06"/></g>
  <path d="M84 120 H316 Q326 120 329 130 L334 146 H66 L71 130 Q74 120 84 120 Z" fill="url(#${id})"/>
  <path d="M84 120 H316 Q326 120 329 130 L334 146 H66 L71 130 Q74 120 84 120 Z" fill="#fff" opacity=".2"/>
  ${layers}
  <rect x="70" y="146" width="260" height="90" rx="9" fill="url(#${id}h)"/>
  <rect x="246" y="120" width="13" height="116" fill="url(#${id}g)"/>
  <path d="M259 160 l14 4" stroke="#a8791f" stroke-width="1"/>
  <rect x="272" y="156" width="44" height="22" rx="4" fill="#fff" stroke="#000" stroke-opacity=".08"/>
  <text x="294" y="171" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-size="8" font-weight="600" letter-spacing="1.6" fill="#1d1d1f">JUGNU</text>
</svg>`;
}

/* ---------------- scroll reveal ---------------- */
let io: IntersectionObserver | null = null;
export function observeReveal(root: ParentNode = document) {
  if (!('IntersectionObserver' in window)) { $$('.reveal', root).forEach((e) => e.classList.add('in')); return; }
  io ??= new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io!.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal:not(.in)', root).forEach((e) => io!.observe(e));
}

/* ---------------- toast ---------------- */
export function toast(msg: string) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout((el as any)._t); (el as any)._t = setTimeout(() => el!.classList.remove('show'), 2600);
}

/* ---------------- cart (inquiry list) ---------------- */
const CART_KEY = 'jt-cart';
export const cart = {
  get(): CartLine[] { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } },
  set(lines: CartLine[]) { try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch { /* ignore */ } updateCount(); },
  add(productId: string, size: string, qty: number) {
    const lines = cart.get(); const ex = lines.find((l) => l.productId === productId && l.size === size);
    if (ex) ex.qty += qty; else lines.push({ productId, size, qty });
    cart.set(lines);
  },
  clear() { cart.set([]); },
};
function updateCount() { const n = cart.get().reduce((s, l) => s + l.qty, 0); $$('.count').forEach((c) => { c.textContent = n ? String(n) : ''; c.dataset.n = String(n); }); }
export const linePrice = (p: Product, size: string, qty: number) => {
  const s = p.sizes.find((x) => x.size === size); if (!s) return { unit: 0, wholesale: false };
  const wholesale = qty >= p.moq; return { unit: wholesale ? s.wholesale : s.retail, wholesale };
};

/* ---------------- layout: header, footer, drawer ---------------- */
const ICON = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  wa: '<svg viewBox="0 0 32 32"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>',
};

export async function layout(active: string) {
  const site = await getSite().catch(() => null);
  const name = site?.name ?? 'Jugnu';
  const nav = [['index', '/', 'nav.home', 'Home'], ['products', '/products', 'nav.products', 'Collection'], ['wholesale', '/wholesale', 'nav.wholesale', 'Wholesale'], ['about', '/about', 'nav.about', 'Craft'], ['contact', '/contact', 'nav.contact', 'Contact']];
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="site"><div class="wrap">
    <a class="logo" href="/" aria-label="${esc(name)} home"><span class="logo-mark" aria-hidden="true"></span>${esc(name)}</a>
    <nav class="main" id="nav">${nav.map(([k, h, key, label]) => `<a href="${h}" class="${k === active ? 'active' : ''}" data-i18n="${key}">${label}</a>`).join('')}</nav>
    <div class="hdr-actions">
      <button class="icon-btn" id="lang-toggle" aria-label="Switch language">اردو</button>
      <button class="icon-btn" id="cart-open" aria-label="Order list">${ICON.bag}<span class="count"></span></button>
      <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menu">${ICON.menu}</button>
    </div></div></header>`);

  const year = new Date().getFullYear();
  const tel = site ? site.phone.replace(/\s/g, '') : '';
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site"><div class="wrap">
    <p class="note">Prices are in Pakistani Rupees. Wholesale rates apply once an article reaches its minimum order quantity. Final price and delivery are confirmed on call or WhatsApp before dispatch. No payment is taken online.</p>
    <div class="cols">
      <div><h4>Shop</h4><a href="/products">The collection</a><a href="/products?cat=bedsheet-set">Bedsheet sets</a><a href="/products?cat=comforter">Comforters</a><a href="/products?cat=fitted">Fitted sheets</a></div>
      <div><h4>For business</h4><a href="/wholesale">Wholesale rates</a><a href="/wholesale#oem">Private label</a><a href="/products?cat=hotel">Hotel & hospital</a></div>
      <div><h4>About</h4><a href="/about">Our craft</a><a href="/about#process">From cotton to bed</a></div>
      <div><h4>Contact</h4>${site ? `<a href="tel:${esc(tel)}">${esc(site.phone)}</a><a href="${waLink(site.whatsapp, 'Assalam o Alaikum')}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}<a href="/contact">Visit us in Ichra</a></div>
    </div>
    <div class="base"><span>Copyright © ${year} ${esc(name)}. Made with care in Lahore, Pakistan.</span><span>${esc(site?.address ?? 'Ichra, Lahore')}</span></div>
  </div></footer>
  ${site ? `<a class="wa-float" href="${waLink(site.whatsapp, 'Assalam o Alaikum, I want to ask about your bedsheets.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON.wa}</a>` : ''}
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Order list">
    <header><h3 data-i18n="cart.title">Your order list</h3><button class="icon-btn" id="cart-close" aria-label="Close" style="background:var(--gray)">✕</button></header>
    <div class="content" id="cart-body"></div>
    <footer id="cart-foot"></footer>
  </aside>
  <div class="modal" id="modal" role="dialog" aria-modal="true"></div>`);

  $('#menu-toggle')!.onclick = () => $('#nav')!.classList.toggle('open');
  $('#lang-toggle')!.onclick = () => { try { localStorage.setItem('jt-lang', lang() === 'ur' ? 'en' : 'ur'); } catch { /* */ } applyLang(); document.dispatchEvent(new Event('langchange')); };
  $('#cart-open')!.onclick = openCart;
  $('#cart-close')!.onclick = closeOverlays;
  $('#scrim')!.onclick = closeOverlays;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlays(); });
  updateCount();
  applyLang();
  observeReveal();
}

export function closeOverlays() {
  ['#drawer', '#scrim', '#modal'].forEach((s) => $(s)?.classList.remove('open'));
  document.body.style.overflow = '';
}

export async function openCart() {
  $('#drawer')!.classList.add('open'); $('#scrim')!.classList.add('open'); document.body.style.overflow = 'hidden';
  await renderCart();
}

async function renderCart() {
  const [products, site] = await Promise.all([getProducts(), getSite()]);
  const lines = cart.get().filter((l) => products.some((p) => p.id === l.productId));
  const body = $('#cart-body')!, foot = $('#cart-foot')!;
  if (!lines.length) {
    body.innerHTML = `<p class="muted" style="padding:24px 0" data-i18n="cart.empty">Your list is empty. Add items from the products page.</p><a class="btn btn-blue" href="/products" data-i18n="btn.shop">Browse the collection</a>`;
    foot.innerHTML = ''; applyLang(); return;
  }
  let total = 0;
  body.innerHTML = lines.map((l, i) => {
    const p = products.find((x) => x.id === l.productId)!; const { unit, wholesale } = linePrice(p, l.size, l.qty); total += unit * l.qty;
    return `<div class="line"><div class="thumb">${productArt(p)}</div>
      <div><b>${esc(p.name)}</b><small>${esc(p.id)} · ${esc(l.size)}</small><small>${rs(unit)} × ${l.qty} ${wholesale ? '<span style="color:var(--ok)">· wholesale</span>' : `· wholesale from ${p.moq} pcs`}</small>
        <div class="qty" style="margin-top:6px"><button data-dec="${i}" aria-label="Decrease">−</button><input data-qty="${i}" type="number" min="1" value="${l.qty}" aria-label="Quantity"><button data-inc="${i}" aria-label="Increase">+</button></div></div>
      <div style="text-align:end"><b>${rs(unit * l.qty)}</b><br><button class="btn btn-sm" style="padding:.3em 0;color:var(--accent);background:none" data-rm="${i}">Remove</button></div></div>`;
  }).join('');
  foot.innerHTML = `<div class="total-row"><span data-i18n="cart.total">Estimated total</span><span>${rs(total)}</span></div>
    <form id="order-form" novalidate>
      <div id="order-msg"></div>
      <div class="row2"><div class="field"><label data-i18n="f.name">Name</label><input name="name" required autocomplete="name"></div>
      <div class="field"><label data-i18n="f.phone">Phone / WhatsApp</label><input name="phone" required inputmode="tel" placeholder="03xx xxxxxxx" autocomplete="tel"></div></div>
      <div class="row2"><div class="field"><label data-i18n="f.city">City</label><input name="city" autocomplete="address-level2"></div>
      <div class="field"><label data-i18n="f.type">You are a…</label><select name="customerType"><option>Individual</option><option>Retailer / Shop</option><option>Wholesaler</option><option>Hotel / Guest house</option><option>Hospital</option><option>Online seller</option></select></div></div>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-blue" style="width:100%" data-i18n="cart.send">Send order request</button>
      <p class="muted" style="font-size:.8rem;margin:.6em 0 0" data-i18n="cart.note">Our team will call / WhatsApp you to confirm price and delivery. No payment now.</p>
    </form>`;
  applyLang();

  const setQty = (i: number, q: number) => { const ls = cart.get(); if (!ls[i]) return; ls[i].qty = Math.max(1, Math.min(100000, q || 1)); cart.set(ls); renderCart(); };
  $$<HTMLButtonElement>('[data-inc]', body).forEach((b) => (b.onclick = () => setQty(+b.dataset.inc!, cart.get()[+b.dataset.inc!].qty + 1)));
  $$<HTMLButtonElement>('[data-dec]', body).forEach((b) => (b.onclick = () => setQty(+b.dataset.dec!, cart.get()[+b.dataset.dec!].qty - 1)));
  $$<HTMLInputElement>('[data-qty]', body).forEach((inp) => (inp.onchange = () => setQty(+inp.dataset.qty!, parseInt(inp.value, 10))));
  $$<HTMLButtonElement>('[data-rm]', body).forEach((b) => (b.onclick = () => { const ls = cart.get(); ls.splice(+b.dataset.rm!, 1); cart.set(ls); renderCart(); }));

  const form = $<HTMLFormElement>('#order-form')!;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const btn = form.querySelector('button')!; btn.disabled = true;
    try {
      const res = await api<{ reference: string; estimatedTotal: number }>('/inquiries', {
        method: 'POST', body: JSON.stringify({ type: 'order', ...clean(fd), items: lines }),
      });
      const summary = lines.map((l) => `• ${l.productId} ${l.size} × ${l.qty}`).join('\n');
      const msg = `Assalam o Alaikum! I placed order ${res.reference} on your website.\n${summary}\nEstimated: ${rs(res.estimatedTotal)}\nName: ${fd.name}`;
      cart.clear();
      body.innerHTML = `<div class="alert ok" style="margin-top:12px"><b>Shukriya! Order request received.</b><br>Your reference: <b>${esc(res.reference)}</b><br>We will contact you shortly on ${esc(fd.phone)}.</div>
        <a class="btn btn-wa" style="width:100%" target="_blank" rel="noopener" href="${waLink(site.whatsapp, msg)}">Also send on WhatsApp</a>`;
      foot.innerHTML = '';
    } catch (err) {
      $('#order-msg')!.innerHTML = `<div class="alert err">${esc((err as Error).message)}</div>`; btn.disabled = false;
    }
  };
}

/** Drop empty strings so optional validators on the server don't complain. */
export const clean = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v !== ''));

/* ---------------- product card + detail modal ---------------- */
export function productCard(p: Product, cats: Category[]) {
  const s = p.sizes[0];
  return `<article class="card product" data-id="${esc(p.id)}">
    <div class="art" data-open="${esc(p.id)}">${productArt(p)}${p.badge ? `<span class="badge ${esc(p.badge)}">${esc(p.badge)}</span>` : ''}</div>
    <div class="body"><span class="sku">${esc(p.id)} · ${esc(catName(cats, p.category))}</span>
      <h3>${esc(lang() === 'ur' && p.nameUr ? p.nameUr : p.name)}</h3>
      <span class="spec">${esc(p.fabric)}${p.threadCount ? ` · ${p.threadCount} TC` : ''}</span>
      <div class="price"><b>From ${rs(s.retail)}</b><small>${t('p.wholesale', 'Wholesale')} ${rs(s.wholesale)} · ${p.moq}+ pcs</small></div>
      <div class="actions"><button class="btn btn-blue btn-sm" data-quick="${esc(p.id)}" ${p.inStock ? 'data-i18n="btn.add">Add to list' : 'disabled>Out of stock'}</button><button class="btn btn-ghost btn-sm" data-open="${esc(p.id)}" data-i18n="btn.details">Learn more</button></div>
    </div></article>`;
}

export function bindProductGrid(root: HTMLElement, products: Product[], cats: Category[]) {
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const open = target.closest<HTMLElement>('[data-open]'); const quick = target.closest<HTMLElement>('[data-quick]');
    if (quick) { const p = products.find((x) => x.id === quick.dataset.quick)!; cart.add(p.id, p.sizes[0].size, 1); toast(`${p.name} added to your list`); }
    else if (open) openProduct(products.find((x) => x.id === open.dataset.open)!, cats);
  });
}

export async function openProduct(p: Product, cats: Category[]) {
  const site = await getSite();
  const m = $('#modal')!;
  m.innerHTML = `<div class="box"><div class="art">${productArt(p)}</div><div class="info">
    <button class="icon-btn close" aria-label="Close">✕</button>
    <span class="eyebrow">${esc(p.id)} · ${esc(catName(cats, p.category))}</span>
    <h2>${esc(lang() === 'ur' && p.nameUr ? p.nameUr : p.name)}</h2>
    <p class="muted">${esc(p.description)}</p>
    <dl class="specs"><dt>Fabric</dt><dd>${esc(p.fabric)}</dd>${p.threadCount ? `<dt>Thread count</dt><dd>${p.threadCount}</dd>` : ''}<dt>Finish</dt><dd>${esc(p.finish)}</dd><dt>${t('p.moq', 'Wholesale MOQ')}</dt><dd>${p.moq} pcs (mix sizes allowed)</dd></dl>
    <form id="pform"><b style="font-size:.9rem" data-i18n="p.size">Choose size</b><div class="size-opts">
      ${p.sizes.map((s, i) => `<label><input type="radio" name="size" value="${esc(s.size)}" ${i === 0 ? 'checked' : ''}><span>${esc(s.size)}</span><span style="text-align:end"><b style="font-weight:500">${rs(s.retail)}</b><br><small class="muted">${rs(s.wholesale)} wholesale</small></span></label>`).join('')}
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div class="qty"><button type="button" data-d="-1">−</button><input name="qty" type="number" min="1" value="1" aria-label="Quantity"><button type="button" data-d="1">+</button></div>
      <span id="pprice" class="muted" style="font-size:.9rem"></span></div>
    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="btn btn-blue" ${p.inStock ? '' : 'disabled'} data-i18n="btn.add">Add to list</button>
      <a class="btn btn-wa" id="pwa" target="_blank" rel="noopener" data-i18n="btn.wa">Order on WhatsApp</a></div></form></div></div>`;
  m.classList.add('open'); $('#scrim')!.classList.add('open'); document.body.style.overflow = 'hidden';
  const f = $<HTMLFormElement>('#pform', m)!; const qtyEl = f.elements.namedItem('qty') as HTMLInputElement;
  const refresh = () => {
    const size = (new FormData(f).get('size') as string); const qty = Math.max(1, parseInt(qtyEl.value, 10) || 1);
    const { unit, wholesale } = linePrice(p, size, qty);
    $('#pprice', m)!.innerHTML = `${rs(unit)} each · <b>${rs(unit * qty)}</b> ${wholesale ? '<span style="color:var(--ok)">(wholesale rate)</span>' : `(wholesale rate from ${p.moq} pcs)`}`;
    $<HTMLAnchorElement>('#pwa', m)!.href = waLink(site.whatsapp, `Assalam o Alaikum, I want to order:\n${p.id} – ${p.name}\nSize: ${size}\nQty: ${qty}`);
  };
  f.oninput = refresh;
  $$<HTMLButtonElement>('[data-d]', f).forEach((b) => (b.onclick = () => { qtyEl.value = String(Math.max(1, (parseInt(qtyEl.value, 10) || 1) + +b.dataset.d!)); refresh(); }));
  f.onsubmit = (e) => { e.preventDefault(); cart.add(p.id, new FormData(f).get('size') as string, Math.max(1, parseInt(qtyEl.value, 10) || 1)); closeOverlays(); toast(`${p.name} added to your list`); };
  $('.close', m)!.onclick = closeOverlays;
  m.onclick = (e) => { if (e.target === m) closeOverlays(); };
  refresh(); applyLang();
}
