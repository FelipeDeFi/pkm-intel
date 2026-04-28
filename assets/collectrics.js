// ── Collectrics Modal ────────────────────────────
let colModalIndex = -1;
let colAutoMeta = null;
const COL_FIELD_IDS = ['col-dp','col-ss','col-al','col-al-count','col-nl','col-nl-pct','col-sold','col-sold-pct'];

function normalizeMetricInput(value, type) {
  let v = String(value || '').replace(',', '.').replace(/[^\d.+-]/g, '');
  if (type !== 'signed') v = v.replace(/[+-]/g, '');
  if (type === 'int') v = v.replace(/[^\d]/g, '');
  if (type === 'signed') {
    v = v.replace(/(?!^)[+-]/g, '');
    if (v.startsWith('+-') || v.startsWith('-+')) v = v.slice(1);
  }
  const sign = v.match(/^[+-]/)?.[0] || '';
  const body = sign ? v.slice(1) : v;
  const parts = body.split('.');
  if (parts.length > 1) v = sign + parts[0] + '.' + parts.slice(1).join('');
  return v;
}

function colInputChanged(id, type) {
  const el = document.getElementById(id);
  if (!el) return true;
  const clean = normalizeMetricInput(el.value, type);
  if (el.value !== clean) el.value = clean;
  const ok = colValidate(id, type);
  updateColInterpretation();
  return ok;
}

function colValidate(id, type) {
  const el = document.getElementById(id);
  const v  = el.value.trim();
  if (!v) { el.style.borderColor = 'var(--border)'; return true; }
  let ok = false;
  if (type === 'pct')     ok = /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 100;
  if (type === 'decimal') ok = /^\d+(\.\d+)?$/.test(v) && parseFloat(v) >= 0;
  if (type === 'signed')  ok = /^[+-]?\d+(\.\d+)?$/.test(v);
  if (type === 'int')     ok = /^\d+$/.test(v);
  el.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
  return ok;
}

function metricNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function signedMetric(v) {
  const n = metricNumber(v);
  if (n === null) return null;
  return (n > 0 ? '+' : '') + n.toFixed(1).replace(/\.0$/, '') + '%';
}

function interpretColData(cd) {
  const dp = metricNumber(cd.dp);
  const ss = metricNumber(cd.ss);
  const al = metricNumber(cd.al);
  const nlPct = metricNumber(cd.nlPct);
  const soldPct = metricNumber(cd.soldPct);

  if ([dp, ss, al, nlPct, soldPct].every(v => v === null)) {
    return 'Preencha os campos para ver a leitura: tem comprador suficiente, tem carta demais a venda, e isso deve puxar o preco para cima ou para baixo.';
  }

  const demandWeak = dp !== null && dp < 5;
  const demandOk = dp !== null && dp >= 5 && dp < 10;
  const demandStrong = dp !== null && dp >= 10;
  const supplyRising = (al !== null && al > 5) || (nlPct !== null && nlPct > 8) || (ss !== null && ss > 1.2);
  const supplyFalling = (al !== null && al < -5) || (nlPct !== null && nlPct < -8) || (ss !== null && ss < 0.9);
  const salesFalling = soldPct !== null && soldPct < -5;
  const salesRising = soldPct !== null && soldPct > 5;

  const buyers =
    demandWeak ? 'Tem pouca gente comprando agora' :
    demandOk ? 'Tem compradores, mas sem euforia' :
    demandStrong ? 'Tem bastante gente disputando a carta' :
    'Nao da para medir bem a forca dos compradores';

  const sales =
    soldPct === null ? '' :
    salesFalling ? `; as vendas cairam ${signedMetric(soldPct)}, entao o interesse esta esfriando` :
    salesRising ? `; as vendas subiram ${signedMetric(soldPct)}, entao ainda existe algum interesse` :
    `; as vendas quase nao mudaram (${signedMetric(soldPct)})`;

  const sellers =
    supplyRising ? 'Do outro lado, tem mais cartas aparecendo para vender' :
    supplyFalling ? 'Do outro lado, tem menos cartas aparecendo para vender' :
    'Do outro lado, a quantidade de cartas a venda nao mudou o bastante';

  const active =
    al === null ? '' :
    al > 5 ? `: anuncios ativos subiram ${signedMetric(al)}` :
    al < -5 ? `: anuncios ativos cairam ${signedMetric(al)}` :
    `: anuncios ativos ficaram perto do normal (${signedMetric(al)})`;

  const fresh =
    nlPct === null ? '' :
    nlPct > 8 ? ` e novos anuncios subiram ${signedMetric(nlPct)}` :
    nlPct < -8 ? ` e novos anuncios cairam ${signedMetric(nlPct)}` :
    ` e novos anuncios ficaram perto do normal (${signedMetric(nlPct)})`;

  const stock =
    ss === null ? '' :
    ss > 1.5 ? `. O estoque esta claramente sobrando: tem carta demais para a demanda atual` :
    ss > 1.2 ? `. O estoque esta comecando a sobrar: isso limita alta de preco` :
    ss < 0.9 ? `. O estoque esta apertando: se aparecer comprador, o preco pode reagir` :
    `. O estoque esta normal: sozinho, isso nao empurra o preco para cima`;

  let action;
  if ((demandWeak || salesFalling) && supplyRising) {
    action = 'Traduzindo: mais vendedor que comprador. A tendencia e o preco cair ou pelo menos aparecer compra melhor com desconto.';
  } else if (demandStrong && supplyFalling) {
    action = 'Traduzindo: muita gente quer e tem pouca carta sobrando. Aqui existe risco real de alta.';
  } else if (demandStrong && supplyRising) {
    action = 'Traduzindo: tem comprador, mas tambem esta entrando oferta. Pode subir, mas nao vale pagar qualquer preco.';
  } else if ((demandWeak || salesFalling) && supplyFalling) {
    action = 'Traduzindo: pouca demanda, mas tambem nao esta sobrando tanta carta. Nao parece compra urgente.';
  } else if (salesRising && !supplyRising) {
    action = 'Traduzindo: as vendas ajudam e a oferta nao esta pressionando. Pode estabilizar ou subir um pouco.';
  } else if (supplyRising) {
    action = 'Traduzindo: tem carta entrando no mercado. Isso pesa contra alta; melhor esperar ou pedir preco menor.';
  } else {
    action = 'Traduzindo: o mercado nao esta dando sinal forte. A compra so faz sentido se o preco ja estiver bom.';
  }

  return `${buyers}${sales}. ${sellers}${active}${fresh}${stock}. ${action}`;
}

function readColFormData() {
  return {
    dp: document.getElementById('col-dp').value.trim(),
    ss: document.getElementById('col-ss').value.trim(),
    al: document.getElementById('col-al').value.trim(),
    alCount: document.getElementById('col-al-count').value.trim(),
    nl: document.getElementById('col-nl').value.trim(),
    nlPct: document.getElementById('col-nl-pct').value.trim(),
    sold: document.getElementById('col-sold').value.trim(),
    soldPct: document.getElementById('col-sold-pct').value.trim()
  };
}

function updateColInterpretation() {
  const el = document.getElementById('col-live-interpretation');
  if (el) el.textContent = interpretColData(readColFormData());
}

function setColAutoStatus(msg, color) {
  const el = document.getElementById('col-auto-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = color || 'var(--muted)';
  el.style.display = msg ? 'block' : 'none';
}

function metricOut(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(decimals).replace(/\.0$/, '');
}

function metricPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const pct = n * 100;
  return (pct > 0 ? '+' : '') + metricOut(pct, 1);
}

async function fetchCollectricsSearchCards(name) {
  const q = encodeURIComponent(cleanCardNameForSearch(name) || name);
  const data = await fetchCollectricsJson(`https://mycollectrics.com/api/search/cards?q=${q}&limit=12&offset=0`);
  return Array.isArray(data.results) ? data.results : [];
}

async function fetchCollectricsJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  } catch (directErr) {
    const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url);
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Proxy HTTP ' + res.status);
    return res.json();
  }
}

function scoreCollectricsCard(card, rawName) {
  const wantedName = normalizeCardText(cleanCardNameForSearch(rawName));
  const wantedNumber = extractPrintedNumber(rawName);
  const product = normalizeCardText(card && card['product-name']);
  const searchText = normalizeCardText(card && card.searchText);
  const cardNumber = String((card && card['card-number']) || '').replace(/^0+/, '');
  let score = 0;
  if (wantedName && product.includes(wantedName)) score += 5;
  if (wantedName && searchText.includes(wantedName)) score += 2;
  if (wantedNumber && cardNumber === wantedNumber) score += 8;
  if (card && card.id) score += 1;
  return score;
}

async function fetchCollectricsDetail(id) {
  return fetchCollectricsJson(`https://mycollectrics.com/api/card/${encodeURIComponent(id)}?include=ebay`);
}

function applyCollectricsMetrics(card, match) {
  const mp = card && card.collectrics && card.collectrics['market-pressure'];
  const bucket = (mp && (mp.estimated || mp.observed)) || null;
  const seven = bucket && bucket['7d'];
  const base = bucket && bucket['baseline-comparison'];
  if (!seven || !base) throw new Error('Sem market-pressure no retorno do Collectrics');

  const raw = seven.raw || {};
  const metrics = seven.metrics || {};
  document.getElementById('col-al-count').value = metricOut(raw['avg-active'], 0);
  document.getElementById('col-nl').value = metricOut(raw['avg-new'], 1);
  document.getElementById('col-sold').value = metricOut(raw['avg-sold-est'], 1);
  document.getElementById('col-dp').value = metricOut((metrics['demand-pressure-est'] ?? metrics['demand-pressure']) * 100, 1);
  document.getElementById('col-al').value = metricPct(base['active-listings-delta-pct']);
  document.getElementById('col-nl-pct').value = metricPct(base['supply-delta-pct']);
  document.getElementById('col-sold-pct').value = metricPct(base['demand-delta-pct']);
  document.getElementById('col-ss').value = metricOut(base['supply-saturation-index'], 2);
  COL_FIELD_IDS.forEach(id => colInputChanged(id, id === 'col-al-count' ? 'int' : (id === 'col-dp' ? 'pct' : (id === 'col-ss' || id === 'col-nl' || id === 'col-sold' ? 'decimal' : 'signed'))));
  colSsCheck();
  updateColInterpretation();
  colAutoMeta = {
    collectricsId: match.id,
    collectricsName: match['product-name'] || card['product-name'] || '',
    collectricsSet: match['set-name'] || card['set-name'] || '',
    collectricsAsOf: seven['as-of'] || '',
    source: 'Collectrics API'
  };

  const img = document.getElementById('col-card-image');
  if (img && match['image-url']) img.src = match['image-url'];
}

async function autoFillCollectrics(options = {}) {
  if (colModalIndex < 0) return;
  const item = watchlist[colModalIndex];
  const btn = document.getElementById('col-auto-btn');
  const silent = !!options.silent;
  if (btn && !silent) { btn.disabled = true; btn.textContent = 'BUSCANDO...'; }
  if (!silent) setColAutoStatus('Buscando no Collectrics...', 'var(--accent)');
  try {
    const cards = await fetchCollectricsSearchCards(item.name);
    if (!cards.length) throw new Error('Nenhuma carta encontrada no Collectrics');
    const ranked = cards
      .map(card => ({ card, score: scoreCollectricsCard(card, item.name) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];
    const wantedNumber = extractPrintedNumber(item.name);
    if (!best || best.score < (wantedNumber ? 10 : 6) || (second && second.score === best.score && wantedNumber)) {
      const names = ranked.slice(0, 3).map(x => x.card['product-name']).filter(Boolean).join(' | ');
      throw new Error('Match ambiguo. Abra a nova aba e confira: ' + names);
    }
    const detail = await fetchCollectricsDetail(best.card.id);
    applyCollectricsMetrics(detail, best.card);
    if (!silent) setColAutoStatus(`Preenchido de ${best.card['product-name']} (${best.card['set-name'] || 'set sem nome'}). Confira e clique SALVAR.`, 'var(--green)');
  } catch (e) {
    if (!silent) setColAutoStatus(e.message || 'Falha ao coletar dados automaticamente', 'var(--red)');
  } finally {
    if (btn && !silent) { btn.disabled = false; btn.textContent = 'RECOLETAR'; }
  }
}

function buildCollectricsSearchUrl(name) {
  const clean = cleanCardNameForSearch(name);
  const q = encodeURIComponent(clean || name);
  return `https://mycollectrics.com/search.html?q=${q}`;
}

function openColModal(i) {
  colModalIndex = i;
  colAutoMeta = null;
  const item = watchlist[i];
  document.getElementById('col-modal-name').textContent = item.name;
  const extUrl = item.colData && item.colData.collectricsId
    ? `https://mycollectrics.com/card.html?id=${encodeURIComponent(item.colData.collectricsId)}`
    : buildCollectricsSearchUrl(item.name);
  document.getElementById('col-modal-ext').href = extUrl;
  const img = document.getElementById('col-card-image');
  if (img) img.src = item.imageUrl || '';
  setColAutoStatus('', '');
  const cd = item.colData || {};
  document.getElementById('col-dp').value = cd.dp || '';
  document.getElementById('col-ss').value = cd.ss || '';
  document.getElementById('col-al').value = cd.al || '';
  document.getElementById('col-al-count').value = cd.alCount || '';
  document.getElementById('col-nl').value = cd.nl || '';
  document.getElementById('col-nl-pct').value = cd.nlPct || '';
  document.getElementById('col-sold').value = cd.sold || '';
  document.getElementById('col-sold-pct').value = cd.soldPct || '';
  COL_FIELD_IDS.forEach(id => { document.getElementById(id).style.borderColor = 'var(--border)'; });
  colSsCheck();
  updateColInterpretation();
  document.getElementById('colModal').classList.add('open');
  setTimeout(() => autoFillCollectrics(), 80);
}

function closeColModal() {
  document.getElementById('colModal').classList.remove('open');
  colModalIndex = -1;
}

function colSsCheck() {
  const v = parseFloat(document.getElementById('col-ss').value);
  document.getElementById('col-ss-flag').style.display = v > 1.5 ? 'block' : 'none';
  document.getElementById('col-ss-ok').style.display   = (!isNaN(v) && v <= 1.5) ? 'block' : 'none';
}

function saveColData() {
  if (colModalIndex < 0) return;
  const dpOk = colValidate('col-dp','pct');
  const ssOk = colValidate('col-ss','decimal');
  const alOk = colValidate('col-al','signed');
  const alCountOk = colValidate('col-al-count','int');
  const nlOk = colValidate('col-nl','decimal');
  const nlPctOk = colValidate('col-nl-pct','signed');
  const soldOk = colValidate('col-sold','decimal');
  const soldPctOk = colValidate('col-sold-pct','signed');
  if (!dpOk || !ssOk || !alOk || !alCountOk || !nlOk || !nlPctOk || !soldOk || !soldPctOk) return;
  const data = readColFormData();
  if (!Object.values(data).some(Boolean)) { closeColModal(); return; }
  watchlist[colModalIndex].colData = {
    ...data,
    ...(colAutoMeta || {}),
    interpretation: interpretColData(data),
    updatedAt: new Date().toLocaleDateString('pt-BR')
  };
  persistWatchlist();
  closeColModal();
  renderWatch();
}

document.getElementById('colModal').addEventListener('click', function(e) {
  if (e.target === this) closeColModal();
});
