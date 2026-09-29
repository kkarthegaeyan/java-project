/* FarmStock UI — all business data is loaded from the Spring Boot API. */
const state = { crops: [], editingCropId: null, dashboard: null, csrf: null };
const $ = (id) => document.getElementById(id);
const today = (() => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); })();
const pageTitles = { dashboard: ['FARM OPERATIONS', 'Farm overview'], crops: ['PRODUCE', 'Crop catalogue'], harvests: ['FIELD RECORDS', 'Harvests'], sales: ['MARKET RECORDS', 'Sales'], stock: ['INVENTORY', 'Stock overview'], revenue: ['FINANCIAL RECORDS', 'Revenue report'] };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function number(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function qty(value) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(number(value)); }
function money(value) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(number(value)); }
function toast(message, type = 'success') {
  const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = message;
  $('toastRegion').appendChild(el); window.setTimeout(() => el.remove(), 4200);
}
function setMessageArea(element, message, type = 'error') {
  if (!element) return;
  element.innerHTML = `<div class="error-card">${escapeHtml(message)}</div>`;
}
async function refreshCsrfToken() {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Your secure session could not be refreshed. Please sign in again.');
  state.csrf = await response.json();
  const logoutToken = $('logoutCsrf');
  if (logoutToken) logoutToken.value = state.csrf.token;
  return state.csrf;
}
async function api(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    if (!state.csrf) await refreshCsrfToken();
    headers[state.csrf.headerName] = state.csrf.token;
  }
  const response = await fetch(url, { ...options, credentials: 'same-origin', headers });
  if (response.redirected && response.url.includes('/login.html')) {
    window.location.href = '/login.html?expired';
    throw new Error('Your sign-in has expired. Please sign in again.');
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    let message = data && typeof data === 'object' ? (data.message || data.error || data.detail) : data;
    if (data?.availableStock !== undefined) message = `Sale cannot be completed. Available stock: ${qty(data.availableStock)} kg; requested quantity: ${qty(data.requestedQuantity)} kg.`;
    if (data?.errors && Array.isArray(data.errors)) message = data.errors.map((item) => item.defaultMessage || item.message).filter(Boolean).join(' ');
    throw new Error(message || `Request failed (${response.status}). Please try again.`);
  }
  return data;
}
function setBusy(button, busy, busyLabel = 'Saving…') {
  if (!button) return;
  if (busy) { button.dataset.originalText = button.innerHTML; button.innerHTML = busyLabel; button.disabled = true; }
  else { button.innerHTML = button.dataset.originalText || button.innerHTML; button.disabled = false; }
}
function emptyRow(columns, title, note) { return `<tr><td colspan="${columns}" class="table-empty"><strong>${escapeHtml(title)}</strong>${escapeHtml(note)}</td></tr>`; }
function formatDate(value) {
  if (!value) return 'Date not recorded';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function renderRecentActivity(harvests, sales) {
  const target = $('recentActivity');
  const activity = [
    ...harvests.map((entry) => ({ kind: 'harvest', date: entry.harvestDate, crop: entry.crop?.name || 'Unknown crop', quantity: entry.quantity, id: entry.id })),
    ...sales.map((entry) => ({ kind: 'sale', date: entry.saleDate, crop: entry.crop?.name || 'Unknown crop', quantity: entry.quantity, amount: number(entry.quantity) * number(entry.pricePerUnit), id: entry.id }))
  ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || number(b.id) - number(a.id)).slice(0, 5);

  target.innerHTML = activity.length ? activity.map((entry) => {
    const isSale = entry.kind === 'sale';
    return `<div class="activity-item"><span class="activity-mark ${isSale ? 'sale-mark' : 'harvest-mark'}"><svg><use href="#${isSale ? 'icon-sales' : 'icon-harvest'}"/></svg></span><div class="activity-description"><strong>${isSale ? 'Sale recorded' : 'Harvest recorded'}</strong><span>${escapeHtml(entry.crop)} · ${formatDate(entry.date)}</span></div><div class="activity-quantity"><strong class="${isSale ? 'quantity-out' : 'quantity-in'}">${isSale ? '−' : '+'}${qty(entry.quantity)} kg</strong>${isSale ? `<span>${money(entry.amount)}</span>` : '<span>Harvest</span>'}</div></div>`;
  }).join('') : `<div class="activity-empty"><span class="empty-icon"><svg><use href="#icon-overview"/></svg></span><strong>No activity yet</strong><p>Harvests and sales will show here as you record them.</p></div>`;
}

async function loadCrops() {
  const crops = await api('/api/crops');
  state.crops = Array.isArray(crops) ? crops : [];
  renderCrops(); populateCropSelects();
  return state.crops;
}
function renderCrops() {
  const body = $('cropTableBody'); if (!body) return;
  const query = ($('cropSearch')?.value || '').trim().toLowerCase();
  const category = $('cropCategoryFilter')?.value || '';
  const filtered = state.crops.filter((crop) => (!category || crop.category === category) && `${crop.name} ${crop.category} ${crop.id}`.toLowerCase().includes(query));
  $('cropCount').textContent = String(filtered.length);
  body.innerHTML = filtered.length ? filtered.map((crop) => `<tr>
    <td class="crop-name-cell">${escapeHtml(crop.name)}</td><td><span class="crop-badge">${escapeHtml(crop.category)}</span></td><td>#${escapeHtml(crop.id)}</td>
    <td><div class="row-actions"><button class="text-action" data-edit-crop="${escapeHtml(crop.id)}">Edit</button><button class="text-action delete" data-delete-crop="${escapeHtml(crop.id)}">Delete</button></div></td></tr>`).join('') : emptyRow(4, query ? 'No matching crops' : 'No crops yet', query ? 'Try a different search.' : 'Add your first crop using the form above.');
}
function populateSelect(id, selectedValue = '') {
  const select = $(id); if (!select) return;
  const old = selectedValue || select.value;
  select.innerHTML = `<option value="">${state.crops.length ? 'Select a crop…' : 'Add a crop first'}</option>` + state.crops.map((crop) => `<option value="${escapeHtml(crop.id)}">${escapeHtml(crop.name)} · ${escapeHtml(crop.category)}</option>`).join('');
  if (state.crops.some((crop) => String(crop.id) === String(old))) select.value = old;
  select.disabled = state.crops.length === 0;
}
function populateCropSelects() {
  ['harvestCropId', 'saleCropId', 'stockCropId', 'revenueCropId'].forEach((id) => populateSelect(id));
  const categoryFilter = $('cropCategoryFilter');
  if (categoryFilter) {
    const selected = categoryFilter.value;
    const categories = [...new Set(state.crops.map((crop) => crop.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
    if (categories.includes(selected)) categoryFilter.value = selected;
  }
}
function resetCropForm() {
  state.editingCropId = null; $('cropForm').reset(); $('cropFormTitle').textContent = 'Add a crop'; $('cropSubmit').innerHTML = '＋ &nbsp;Add crop'; $('cropCancel').classList.add('hidden');
}
async function saveCrop(event) {
  event.preventDefault();
  const button = $('cropSubmit'); setBusy(button, true, state.editingCropId ? 'Updating…' : 'Adding…');
  try {
    const payload = { name: $('cropName').value.trim(), category: $('cropCategory').value.trim() };
    await api(state.editingCropId ? `/api/crops/${state.editingCropId}` : '/api/crops', { method: state.editingCropId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    const wasEditing = Boolean(state.editingCropId); resetCropForm(); button.dataset.originalText = button.innerHTML; await loadCrops(); await refreshDashboard();
    toast(wasEditing ? 'Crop details updated.' : 'Crop added to your catalogue.');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}
async function editCrop(id) {
  try {
    const crop = await api(`/api/crops/${id}`); state.editingCropId = id;
    $('cropName').value = crop.name || ''; $('cropCategory').value = crop.category || ''; $('cropFormTitle').textContent = `Edit ${crop.name}`;
    $('cropSubmit').innerHTML = '✓ &nbsp;Save changes'; $('cropCancel').classList.remove('hidden'); $('cropName').focus(); window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) { toast(error.message, 'error'); }
}
async function deleteCrop(id) {
  const crop = state.crops.find((item) => String(item.id) === String(id));
  if (!window.confirm(`Delete ${crop?.name || 'this crop'}? The server may reject deletion if harvest or sale records are linked to it.`)) return;
  try { await api(`/api/crops/${id}`, { method: 'DELETE' }); await loadCrops(); await refreshDashboard(); toast('Crop deleted.'); }
  catch (error) { toast(error.message, 'error'); }
}

async function loadHarvests() {
  const body = $('harvestTableBody'); body.innerHTML = `<tr><td colspan="4" class="loading-state">Loading harvest history…</td></tr>`;
  try {
    const harvests = await api('/api/harvests');
    body.innerHTML = harvests.length ? harvests.slice().reverse().map((item) => `<tr><td>#${escapeHtml(item.id)}</td><td class="crop-name-cell">${escapeHtml(item.crop?.name || 'Unknown crop')}</td><td>${qty(item.quantity)} kg</td><td>${escapeHtml(item.harvestDate)}</td></tr>`).join('') : emptyRow(4, 'No harvests recorded', 'Record your first harvest batch above.');
  } catch (error) { body.innerHTML = emptyRow(4, 'Could not load harvests', error.message); }
}
async function saveHarvest(event) {
  event.preventDefault(); const button = event.submitter; setBusy(button, true, 'Recording…');
  try {
    const id = $('harvestCropId').value;
    await api(`/api/harvests/crop/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ quantity: number($('harvestQuantity').value), harvestDate: $('harvestDate').value }) });
    $('harvestForm').reset(); $('harvestDate').value = today; await Promise.all([loadHarvests(), refreshDashboard()]); toast('Harvest batch recorded.');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}

async function updateSaleStockHint() {
  const cropId = $('saleCropId').value; const hint = $('saleStockHint');
  if (!cropId) { hint.textContent = 'Choose a crop to check available stock.'; return; }
  hint.textContent = 'Checking available stock…';
  try { const stock = await api(`/api/sales/crop/${encodeURIComponent(cropId)}/stock`); hint.textContent = `Available stock: ${qty(stock.currentStock)} kg`; }
  catch (error) { hint.textContent = error.message; }
}
async function loadSales() {
  const body = $('saleTableBody'); body.innerHTML = `<tr><td colspan="6" class="loading-state">Loading sales history…</td></tr>`;
  try {
    const sales = await api('/api/sales');
    body.innerHTML = sales.length ? sales.slice().reverse().map((item) => `<tr><td>#${escapeHtml(item.id)}</td><td class="crop-name-cell">${escapeHtml(item.crop?.name || 'Unknown crop')}</td><td>${qty(item.quantity)} kg</td><td>${money(item.pricePerUnit)}</td><td><strong>${money(number(item.quantity) * number(item.pricePerUnit))}</strong></td><td>${escapeHtml(item.saleDate)}</td></tr>`).join('') : emptyRow(6, 'No sales recorded', 'Your recorded sales will appear here.');
  } catch (error) { body.innerHTML = emptyRow(6, 'Could not load sales', error.message); }
}
async function saveSale(event) {
  event.preventDefault(); const button = event.submitter; setBusy(button, true, 'Saving sale…');
  try {
    const cropId = $('saleCropId').value;
    await api(`/api/sales/crop/${encodeURIComponent(cropId)}`, { method: 'POST', body: JSON.stringify({ quantity: number($('saleQuantity').value), pricePerUnit: number($('salePrice').value), saleDate: $('saleDate').value }) });
    $('saleForm').reset(); $('saleDate').value = today; await Promise.all([loadSales(), updateSaleStockHint(), refreshDashboard()]); toast('Sale recorded successfully.');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}

async function loadStock() {
  const cropId = $('stockCropId').value; const result = $('stockResult');
  if (!cropId) { result.innerHTML = `<div class="empty-card"><span>◈</span><h3>Select a crop</h3><p>Add a crop before checking inventory.</p></div>`; return; }
  result.innerHTML = '<div class="loading-state">Loading live stock totals…</div>';
  try {
    const stock = await api(`/api/sales/crop/${encodeURIComponent(cropId)}/stock`);
    const harvested = number(stock.totalHarvested); const sold = number(stock.totalSold); const current = number(stock.currentStock);
    const progress = harvested > 0 ? Math.max(0, Math.min(100, current / harvested * 100)) : 0;
    result.innerHTML = `<div class="stock-summary"><div class="stock-summary-head"><div><p class="eyebrow">INVENTORY SUMMARY</p><h3>${escapeHtml(stock.cropName)}</h3><p>Crop ID #${escapeHtml(stock.cropId)}</p></div><span class="stock-chip">● &nbsp;Live stock</span></div><div class="stock-stats"><div class="stock-stat"><span>Total harvested</span><strong>${qty(harvested)} <small>kg</small></strong></div><div class="stock-stat"><span>Total sold</span><strong>${qty(sold)} <small>kg</small></strong></div><div class="stock-stat"><span>Available now</span><strong>${qty(current)} <small>kg</small></strong></div></div><div class="stock-progress"><span style="width:${progress}%"></span></div><div class="stock-progress-label"><span>Remaining stock</span><span>${qty(progress)}% of harvested quantity</span></div></div>`;
  } catch (error) { setMessageArea(result, error.message); }
}
async function loadRevenue(event) {
  event?.preventDefault();
  const cropId = $('revenueCropId').value; const start = $('startDate').value; const end = $('endDate').value; const result = $('revenueResult');
  if (!start || !end) { setMessageArea(result, 'Choose both a start date and an end date.'); return; }
  if (start > end) { setMessageArea(result, 'Start date must be on or before the end date.'); return; }
  result.innerHTML = '<div class="loading-state">Calculating revenue from sales…</div>';
  try {
    const report = await api(`/api/sales/crop/${encodeURIComponent(cropId)}/revenue?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`);
    result.innerHTML = `<div class="revenue-card"><p class="eyebrow">REVENUE REPORT</p><h3>${escapeHtml(report.cropName)}</h3><div class="revenue-period">${escapeHtml(report.startDate)} &nbsp;—&nbsp; ${escapeHtml(report.endDate)}</div><div class="revenue-total">${money(report.totalRevenue)}</div><div class="revenue-caption">Total revenue for selected period</div></div>`;
  } catch (error) { setMessageArea(result, error.message); }
}

async function refreshDashboard() {
  const chart = $('stockChart');
  try {
    const [crops, harvests, sales] = await Promise.all([api('/api/crops'), api('/api/harvests'), api('/api/sales')]);
    state.crops = crops; populateCropSelects();
    const harvestedTotal = harvests.reduce((sum, item) => sum + number(item.quantity), 0);
    const soldTotal = sales.reduce((sum, item) => sum + number(item.quantity), 0);
    const revenueTotal = sales.reduce((sum, item) => sum + number(item.quantity) * number(item.pricePerUnit), 0);
    const stocks = await Promise.all(crops.map(async (crop) => {
      try { return await api(`/api/sales/crop/${encodeURIComponent(crop.id)}/stock`); }
      catch { return { cropId: crop.id, cropName: crop.name, currentStock: 0 }; }
    }));
    const stockTotal = stocks.reduce((sum, item) => sum + number(item.currentStock), 0);
    $('totalCrops').textContent = qty(crops.length); $('totalHarvest').textContent = `${qty(harvestedTotal)} kg`;
    $('totalSold').textContent = `${qty(soldTotal)} kg`; $('totalStock').textContent = `${qty(stockTotal)} kg`; $('totalRevenue').textContent = money(revenueTotal);
    const max = Math.max(1, ...stocks.map((item) => number(item.currentStock)));
    chart.innerHTML = stocks.length ? stocks.slice().sort((a, b) => number(b.currentStock) - number(a.currentStock)).slice(0, 7).map((item) => `<div class="bar-row"><span class="bar-name" title="${escapeHtml(item.cropName)}">${escapeHtml(item.cropName)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(number(item.currentStock) > 0 ? 4 : 0, number(item.currentStock) / max * 100)}%"></div></div><span class="bar-value">${qty(item.currentStock)} kg</span></div>`).join('') : `<div class="empty-card"><h3>No crops to chart yet</h3><p>Add a crop and record harvests to see stock here.</p></div>`;
    renderRecentActivity(harvests, sales);
    $('lastUpdated').textContent = `Updated ${new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date())}`;
    state.dashboard = { crops, harvests, sales, stocks };
  } catch (error) {
    $('totalCrops').textContent = '—'; $('totalHarvest').textContent = '—'; $('totalSold').textContent = '—'; $('totalStock').textContent = '—'; $('totalRevenue').textContent = '—';
    chart.innerHTML = `<div class="error-card">Dashboard data could not be loaded: ${escapeHtml(error.message)}</div>`;
    $('recentActivity').innerHTML = `<div class="error-card">Recent records could not be loaded: ${escapeHtml(error.message)}</div>`;
  }
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach((section) => section.classList.toggle('active', section.id === sectionId));
  document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.section === sectionId));
  const page = pageTitles[sectionId] || ['FARMSTOCK', 'Farm inventory'];
  $('pageEyebrow').textContent = page[0]; $('pageTitle').textContent = page[1]; $('sidebar').classList.remove('open');
  if (sectionId === 'dashboard') refreshDashboard();
  if (sectionId === 'crops') { loadCrops().catch((error) => toast(error.message, 'error')); }
  if (sectionId === 'harvests') { Promise.all([loadCrops(), loadHarvests()]).catch((error) => toast(error.message, 'error')); }
  if (sectionId === 'sales') { Promise.all([loadCrops(), loadSales()]).then(updateSaleStockHint).catch((error) => toast(error.message, 'error')); }
  if (sectionId === 'stock') loadCrops().then(() => { if (!$('stockCropId').value && state.crops.length) $('stockCropId').value = String(state.crops[0].id); return loadStock(); }).catch((error) => toast(error.message, 'error'));
  if (sectionId === 'revenue') loadCrops().catch((error) => toast(error.message, 'error'));
}
function init() {
  $('todayLabel').textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  $('footerYear').textContent = String(new Date().getFullYear());
  $('harvestDate').value = today; $('saleDate').value = today;
  document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => showSection(button.dataset.section)));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => showSection(button.dataset.go)));
  $('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  $('cropForm').addEventListener('submit', saveCrop); $('cropCancel').addEventListener('click', resetCropForm);
  $('cropSearch').addEventListener('input', renderCrops);
  $('cropCategoryFilter').addEventListener('change', renderCrops);
  $('cropTableBody').addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit-crop]'); const remove = event.target.closest('[data-delete-crop]');
    if (edit) editCrop(edit.dataset.editCrop); if (remove) deleteCrop(remove.dataset.deleteCrop);
  });
  $('harvestForm').addEventListener('submit', saveHarvest); $('saleForm').addEventListener('submit', saveSale);
  $('saleCropId').addEventListener('change', updateSaleStockHint); $('checkStock').addEventListener('click', loadStock);
  $('stockCropId').addEventListener('change', loadStock); $('revenueForm').addEventListener('submit', loadRevenue);
  $('refreshDashboard').addEventListener('click', () => refreshDashboard().then(() => toast('Dashboard refreshed.')));
  refreshCsrfToken().then(() => api('/api/auth/me')).then((user) => { $('farmUserName').textContent = user.username; $('topFarmUsername').textContent = user.username; }).catch((error) => {
    if (error.message.includes('expired') || error.message.includes('secure session')) window.location.href = '/login.html?expired';
  });
  refreshDashboard();
}
document.addEventListener('DOMContentLoaded', init);
