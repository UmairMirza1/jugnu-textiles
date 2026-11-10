import { $, $$, api, applyLang, observeReveal, bindProductGrid, catName, clean, esc, getProducts, getSite, lang, layout, openProduct, productArt, productCard, rs } from './lib.js';
import type { Product, SiteInfo } from './types.js';

const page = document.body.dataset.page || 'index';

async function home() {
  const [products, site] = await Promise.all([getProducts(), getSite()]);
  const cats = site.categories.filter((c) => products.some((p) => p.category === c.id));
  const renderCats = () => ($('#cat-grid')!.innerHTML = cats.map((c) => {
    const p = products.find((x) => x.category === c.id)!;
    return `<a class="cat-chip" href="/products?cat=${c.id}"><div class="art">${productArt(p)}</div><span>${esc(catName(site.categories, c.id))}</span></a>`;
  }).join(''));
  const featured = [...products.filter((p) => p.badge && p.badge !== 'Bulk'), ...products.filter((p) => !p.badge)].slice(0, 8);
  const grid = $('#featured')!;
  const renderFeatured = () => { grid.innerHTML = featured.map((p) => productCard(p, site.categories)).join(''); applyLang(); };
  renderCats(); renderFeatured();
  bindProductGrid(grid, products, site.categories);
  document.addEventListener('langchange', () => { renderCats(); renderFeatured(); });
}

async function catalog() {
  const [products, site] = await Promise.all([getProducts(), getSite()]);
  const params = new URLSearchParams(location.search);
  const catBox = $('#f-cat')!, fabBox = $('#f-fab')!, grid = $('#grid')!, count = $('#result-count')!;
  const q = $<HTMLInputElement>('#q')!, sort = $<HTMLSelectElement>('#sort')!;
  const fabricGroup = (f: string) => (/velvet/i.test(f) ? 'Velvet' : /sateen|percale|jersey/i.test(f) ? 'Premium cotton' : /poly/i.test(f) ? 'Poly-cotton' : /cotton/i.test(f) ? '100% Cotton' : 'Other');
  const fabrics = [...new Set(products.map((p) => fabricGroup(p.fabric)))];
  const drawFilters = () => {
    const sel = new Set($$<HTMLInputElement>('input[name=cat]:checked').map((i) => i.value));
    if (!sel.size && params.get('cat')) sel.add(params.get('cat')!);
    catBox.innerHTML = site.categories.map((c) => `<label><input type="checkbox" name="cat" value="${c.id}" ${sel.has(c.id) ? 'checked' : ''}> ${esc(catName(site.categories, c.id))} <span class="muted">(${products.filter((p) => p.category === c.id).length})</span></label>`).join('');
  };
  drawFilters();
  fabBox.innerHTML = fabrics.map((f) => `<label><input type="checkbox" name="fab" value="${esc(f)}"> ${esc(f)}</label>`).join('');
  if (params.get('q')) q.value = params.get('q')!;

  const render = () => {
    const cats = $$<HTMLInputElement>('input[name=cat]:checked').map((i) => i.value);
    const fabs = $$<HTMLInputElement>('input[name=fab]:checked').map((i) => i.value);
    const term = q.value.trim().toLowerCase();
    let list = products.filter((p) => (!cats.length || cats.includes(p.category)) && (!fabs.length || fabs.includes(fabricGroup(p.fabric)))
      && (!term || `${p.id} ${p.name} ${p.nameUr} ${p.fabric} ${p.description}`.toLowerCase().includes(term)));
    if (sort.value === 'low') list = [...list].sort((a, b) => a.sizes[0].retail - b.sizes[0].retail);
    if (sort.value === 'high') list = [...list].sort((a, b) => b.sizes[0].retail - a.sizes[0].retail);
    count.textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.length ? list.map((p) => productCard(p, site.categories)).join('') : `<p class="muted">No products match these filters.</p>`;
    applyLang();
    const u = new URL(location.href); u.searchParams.delete('cat');
    if (cats.length === 1) u.searchParams.set('cat', cats[0]);
    term ? u.searchParams.set('q', term) : u.searchParams.delete('q');
    history.replaceState(null, '', u);
  };
  $('#filters')!.addEventListener('change', render);
  q.addEventListener('input', render); sort.addEventListener('change', render);
  $('#clear')!.onclick = () => { $$<HTMLInputElement>('#filters input').forEach((i) => (i.checked = false)); q.value = ''; render(); };
  bindProductGrid(grid, products, site.categories);
  document.addEventListener('langchange', () => { drawFilters(); render(); });
  render();
  const open = params.get('id'); const p = open && products.find((x) => x.id === open);
  if (p) openProduct(p, site.categories);
}

async function wholesale() {
  const [products, site] = await Promise.all([getProducts(), getSite()]);
  $('#rate-table')!.innerHTML = products.flatMap((p) => p.sizes.map((s, i) => `<tr>
    ${i === 0 ? `<td rowspan="${p.sizes.length}"><b>${esc(p.id)}</b></td><td rowspan="${p.sizes.length}">${esc(p.name)}<br><small class="muted">${esc(p.fabric)}</small></td>` : ''}
    <td>${esc(s.size)}</td><td>${rs(s.retail)}</td><td><b style="color:var(--ok)">${rs(s.wholesale)}</b></td>
    ${i === 0 ? `<td rowspan="${p.sizes.length}">${p.moq} pcs</td>` : ''}</tr>`)).join('');
  bindForm('#quote-form', 'quote', site);
}

async function contact() {
  const site = await getSite();
  $('#c-address')!.textContent = site.address;
  $('#c-phone')!.innerHTML = `<a href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a>`;
  $('#c-email')!.innerHTML = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  $<HTMLAnchorElement>('#c-wa')!.href = `https://wa.me/${site.whatsapp}`;
  bindForm('#contact-form', 'contact', site);
}

function bindForm(sel: string, type: 'quote' | 'contact', site: SiteInfo) {
  const form = $<HTMLFormElement>(sel); if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const msgBox = $('.form-msg', form)!; const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    const fd = clean(Object.fromEntries(new FormData(form)) as Record<string, string>);
    // fold extra quote fields into the message so the admin sees everything
    const extras = ['product', 'quantity', 'deadline'].filter((k) => fd[k]).map((k) => `${k[0].toUpperCase() + k.slice(1)}: ${fd[k]}`);
    ['product', 'quantity', 'deadline'].forEach((k) => delete fd[k]);
    if (extras.length) fd.message = [...extras, fd.message ?? ''].join('\n').trim();
    btn.disabled = true;
    try {
      const res = await api<{ reference: string }>('/inquiries', { method: 'POST', body: JSON.stringify({ type, ...fd }) });
      form.reset();
      msgBox.innerHTML = `<div class="alert ok">Shukriya! We received your ${type === 'quote' ? 'quote request' : 'message'} (ref <b>${esc(res.reference)}</b>). We usually reply within a few hours.
        <br><a target="_blank" rel="noopener" href="https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, my reference is ${res.reference}`)}">Follow up on WhatsApp →</a></div>`;
    } catch (err) {
      msgBox.innerHTML = `<div class="alert err">${esc((err as Error).message)}</div>`;
    } finally { btn.disabled = false; }
  };
}

(async () => {
  await layout(page);
  const run: Record<string, () => Promise<void>> = { index: home, products: catalog, wholesale, contact };
  try { await run[page]?.(); } catch (e) { console.error(e); }
  applyLang();
  observeReveal();
  void lang;
})();
export type { Product };
