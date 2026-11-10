import { $, $$, api, esc, productArt, rs, toast } from './lib.js';
import type { Inquiry, Product, SiteInfo } from './types.js';

const STATUSES = ['new', 'contacted', 'confirmed', 'in-production', 'dispatched', 'closed', 'cancelled'];
let token = '';
try { token = sessionStorage.getItem('jt-admin') || ''; } catch { /* */ }
const adm = <T>(path: string, init: RequestInit = {}) => api<T>(path, { ...init, headers: { 'x-admin-token': token } });

async function login(e?: Event) {
  e?.preventDefault();
  const inp = $<HTMLInputElement>('#token');
  if (inp?.value) token = inp.value.trim();
  try {
    await adm('/admin/inquiries/stats');
    try { sessionStorage.setItem('jt-admin', token); } catch { /* */ }
    $('#login')!.hidden = true; $('#dash')!.hidden = false;
    await Promise.all([loadInquiries(), loadProducts()]);
  } catch {
    if (inp?.value) $('#login-msg')!.innerHTML = '<div class="alert err">Wrong password</div>';
  }
}

async function loadInquiries() {
  const status = $<HTMLSelectElement>('#f-status')!.value;
  const [list, stats] = await Promise.all([adm<Inquiry[]>(`/admin/inquiries${status ? `?status=${status}` : ''}`), adm<{ status: string; count: number; total: number }[]>('/admin/inquiries/stats')]);
  const by = (s: string) => stats.find((x) => x.status === s)?.count ?? 0;
  const open = stats.filter((s) => !['closed', 'cancelled'].includes(s.status)).reduce((a, s) => a + s.total, 0);
  $('#stats')!.innerHTML = [['New', by('new')], ['In progress', by('contacted') + by('confirmed') + by('in-production')], ['Dispatched', by('dispatched')], ['Open order value', rs(open)]]
    .map(([k, v]) => `<div class="card feature"><span class="muted" style="font-size:.85rem">${k}</span><div style="font:600 1.8rem var(--serif)">${v}</div></div>`).join('');
  $('#inq-body')!.innerHTML = list.length ? list.map((i) => `<tr>
    <td><b>${esc(i.reference)}</b><br><small class="muted">${new Date(i.createdAt).toLocaleString('en-PK')}</small><br><span class="pill">${esc(i.type)}</span></td>
    <td><b>${esc(i.name)}</b><br><a href="https://wa.me/${esc(i.phone.replace(/\D/g, '').replace(/^0/, '92'))}" target="_blank" rel="noopener">${esc(i.phone)}</a>${i.email ? `<br><small>${esc(i.email)}</small>` : ''}<br><small class="muted">${esc([i.city, i.customerType, i.businessName].filter(Boolean).join(' · '))}</small></td>
    <td>${i.items.map((l) => `<div><small>${esc(l.productId)} ${esc(l.size)} × ${l.qty} = ${rs(l.lineTotal)} <span class="muted">(${l.priceType})</span></small></div>`).join('')}${i.estimatedTotal ? `<b>${rs(i.estimatedTotal)}</b>` : ''}${i.message ? `<div style="white-space:pre-wrap;font-size:.85rem;margin-top:4px">${esc(i.message)}</div>` : ''}</td>
    <td><select data-status="${i.id}">${STATUSES.map((s) => `<option ${s === i.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
      <textarea data-notes="${i.id}" rows="2" placeholder="Notes" style="margin-top:6px">${esc(i.adminNotes)}</textarea></td></tr>`).join('')
    : '<tr><td colspan="4" class="muted">No inquiries yet.</td></tr>';
  $$<HTMLSelectElement>('[data-status]').forEach((s) => (s.onchange = async () => { await adm(`/admin/inquiries/${s.dataset.status}`, { method: 'PATCH', body: JSON.stringify({ status: s.value }) }); toast('Status updated'); loadInquiries(); }));
  $$<HTMLTextAreaElement>('[data-notes]').forEach((t) => (t.onchange = async () => { await adm(`/admin/inquiries/${t.dataset.notes}`, { method: 'PATCH', body: JSON.stringify({ adminNotes: t.value }) }); toast('Notes saved'); }));
}

let products: Product[] = [];
async function loadProducts() {
  products = await adm<Product[]>('/admin/products');
  $('#prod-body')!.innerHTML = products.map((p) => `<tr>
    <td style="width:70px"><div style="width:60px;height:45px;border-radius:6px;overflow:hidden">${productArt(p)}</div></td>
    <td><b>${esc(p.id)}</b><br>${esc(p.name)}</td>
    <td>${p.sizes.map((s) => `<small>${esc(s.size)}: ${rs(s.retail)} / ${rs(s.wholesale)}</small>`).join('<br>')}</td>
    <td>${p.moq}</td>
    <td>${p.active ? (p.inStock ? '✅ Live' : '⚠️ Out of stock') : '⏸ Hidden'}</td>
    <td><button class="btn btn-ghost btn-sm" data-edit="${esc(p.id)}">Edit</button></td></tr>`).join('');
  $$<HTMLButtonElement>('[data-edit]').forEach((b) => (b.onclick = () => editProduct(products.find((p) => p.id === b.dataset.edit))));
}

async function editProduct(p?: Product) {
  const site = await api<SiteInfo>('/site');
  const f = $<HTMLFormElement>('#prod-form')!;
  $('#prod-editor')!.hidden = false; $('#prod-editor')!.scrollIntoView({ behavior: 'smooth' });
  $('#prod-title')!.textContent = p ? `Edit ${p.id}` : 'New product';
  (f.elements.namedItem('category') as HTMLSelectElement).innerHTML = site.categories.map((c) => `<option value="${c.id}">${esc(c.en)}</option>`).join('');
  const set = (n: string, v: string) => ((f.elements.namedItem(n) as HTMLInputElement).value = v);
  const chk = (n: string, v: boolean) => ((f.elements.namedItem(n) as HTMLInputElement).checked = v);
  set('id', p?.id ?? ''); (f.elements.namedItem('id') as HTMLInputElement).readOnly = !!p;
  set('name', p?.name ?? ''); set('nameUr', p?.nameUr ?? ''); set('category', p?.category ?? 'bedsheet-set');
  set('fabric', p?.fabric ?? '100% Cotton'); set('threadCount', String(p?.threadCount ?? 0)); set('finish', p?.finish ?? 'Printed');
  set('description', p?.description ?? ''); set('moq', String(p?.moq ?? 24)); set('badge', p?.badge ?? ''); set('imageUrl', p?.imageUrl ?? '');
  set('sizes', (p?.sizes ?? [{ size: 'King 108×108"', retail: 0, wholesale: 0 }]).map((s) => `${s.size} | ${s.retail} | ${s.wholesale}`).join('\n'));
  set('ptype', p?.pattern.type ?? 'floral'); set('colors', (p?.pattern.colors ?? ['#f6efe3', '#9b2c2c', '#2f6b4f']).join(', '));
  chk('inStock', p?.inStock ?? true); chk('active', p?.active ?? true);
  $('#prod-msg')!.innerHTML = '';
  ($('#prod-delete') as HTMLButtonElement).hidden = !p;
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value.trim();
    try {
      const sizes = v('sizes').split('\n').filter(Boolean).map((line) => {
        const [size, retail, wholesale] = line.split('|').map((x) => x.trim());
        if (!size || isNaN(+retail) || isNaN(+wholesale)) throw new Error(`Bad size line: "${line}" — use: Size | Retail | Wholesale`);
        return { size, retail: Math.round(+retail), wholesale: Math.round(+wholesale) };
      });
      const body = {
        name: v('name'), nameUr: v('nameUr'), category: v('category'), fabric: v('fabric'), threadCount: parseInt(v('threadCount'), 10) || 0,
        finish: v('finish'), description: v('description'), moq: parseInt(v('moq'), 10) || 1, badge: v('badge') || null, imageUrl: v('imageUrl') || null,
        sizes, pattern: { type: v('ptype'), colors: v('colors').split(',').map((c) => c.trim()).filter(Boolean) },
        inStock: (f.elements.namedItem('inStock') as HTMLInputElement).checked, active: (f.elements.namedItem('active') as HTMLInputElement).checked,
      };
      if (p) await adm(`/admin/products/${encodeURIComponent(p.id)}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await adm('/admin/products', { method: 'POST', body: JSON.stringify({ id: v('id').toUpperCase(), ...body }) });
      toast('Product saved'); $('#prod-editor')!.hidden = true; loadProducts();
    } catch (err) { $('#prod-msg')!.innerHTML = `<div class="alert err">${esc((err as Error).message)}</div>`; }
  };
  $('#prod-delete')!.onclick = async () => {
    if (!p || !confirm(`Delete ${p.id} permanently? (Tip: untick "Show on website" to hide it instead.)`)) return;
    await adm(`/admin/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' }); toast('Deleted'); $('#prod-editor')!.hidden = true; loadProducts();
  };
}

$('#login-form')!.addEventListener('submit', login);
$('#f-status')!.addEventListener('change', loadInquiries);
$('#refresh')!.onclick = loadInquiries;
$('#new-prod')!.onclick = () => editProduct();
$('#prod-cancel')!.onclick = () => ($('#prod-editor')!.hidden = true);
$('#logout')!.onclick = () => { try { sessionStorage.removeItem('jt-admin'); } catch { /* */ } location.reload(); };
if (token) login();
