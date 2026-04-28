let currentQuery = '';
let watchlist = JSON.parse(localStorage.getItem('pkm_watchlist') || '[]');
let modalIndex = -1;

setInterval(() => { document.getElementById('clock').textContent = new Date().toLocaleTimeString('pt-BR'); }, 1000);

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Busca ─────────────────────────────────────────
function searchAll() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  currentQuery = q;
  document.querySelector('.tab[data-tab="carta"]').click();
  showCartaLinks(q, encodeURIComponent(q));
}

function showCartaLinks(q, enc) {
  document.getElementById('carta-empty').style.display = 'none';
  document.getElementById('carta-result').style.display = 'block';
  document.getElementById('carta-name-display').textContent = q.toUpperCase();

  document.getElementById('links-preco').innerHTML = `
    <a class="btn-ext" href="https://www.tcgplayer.com/search/pokemon/product?q=${enc}&view=grid" target="_blank">TCGPlayer →</a>
    <a class="btn-ext" href="https://www.ebay.com/sch/i.html?_nkw=${enc}+pokemon+card&LH_Sold=1&LH_Complete=1" target="_blank">eBay Vendidos →</a>
    <a class="btn-ext" href="https://www.ebay.com/sch/i.html?_nkw=${enc}+pokemon+psa+10&LH_Sold=1" target="_blank">eBay PSA 10 →</a>`;

  document.getElementById('links-liga').innerHTML = `
    <a class="btn-ext" href="https://www.ligapokemon.com.br/?view=cards%2Fcard&tipo=1&card=${enc}" target="_blank">Liga Pokémon BR →</a>
    <a class="btn-ext" href="https://www.mercadolivre.com.br/ofertas?category_id=MLB1253&q=${enc}" target="_blank">Mercado Livre →</a>`;

  document.getElementById('links-psa').innerHTML = `
    <a class="btn-ext" href="https://www.psacard.com/pop/trading-card-games/pokemon?q=${enc}" target="_blank">PSA Pop Report →</a>
    <a class="btn-ext" href="https://www.psacard.com/auctionprices/trading-card-games/pokemon?q=${enc}" target="_blank">PSA Auction Prices →</a>`;

  document.getElementById('links-col').innerHTML = `
    <a class="btn-ext" href="https://mycollectrics.com/search.html" target="_blank">Buscar no Collectrics →</a>`;

  const prompt = `Analise a carta Pokémon TCG: "${q}"

PASSO 1 — PESQUISA OBRIGATÓRIA (antes de qualquer score):
- Competitividade: busque no Limitless TCG (limitlesstcg.com) se a carta aparece em decklists. Não assuma que basicões/suportes são não-competitivos.
- Preço: busque no TCGPlayer ou Sports Card Investor os dados dos últimos 30 dias.
- Reprint: verifique PokeBeach e Pokemon.com por anúncios recentes.

PASSO 1.5 — COLLECTRICS (mycollectrics.com/search):
Busque a carta pelo nome. Se encontrar dados, inclua na análise:
- Demand Pressure: X% (>70% = demanda aquecida | <30% = fria)
- Supply Saturation: X.X (⚠️ flag se > 1.5 = sinal de flood/reprint)
- Supply Saturation Shift: X.X (⚠️ flag se > 1.5 = reprint sendo precificado)
- Price Trend 30d (raw NM): +/-X%
Se não encontrar dados, escreva: Collectrics: sem dados disponíveis

PASSO 2 — SCORES (use os critérios objetivos abaixo, sem subjetividade):

A) COMPETITIVIDADE (peso 15%)
10: Peça insubstituível em deck Tier 1 do meta atual
7-9: Usada em decks Tier 1/2, mas tem alternativas
4-6: Usada em decks Tier 3 ou formatos alternativos
1-3: Sem uso competitivo relevante

B) PROTEÇÃO REPRINT (peso 20%) — maior = menos chance de reimprimir
10: Promo exclusiva descontinuada / evento único irrepetível
8-9: Promo de produto premium fora de circulação, sem histórico de reprint
6-7: Set especial recente, IRs raramente reimpressas individualmente
4-5: Set regular ativo, reprint possível em 6-12 meses
1-3: Já foi reimpresso antes / carta popular em set com histórico de reprint

C) RARIDADE (peso 20%)
10: MHR / Mega Hyper Rare com pop PSA < 50
8-9: SIR / Special Illustration Rare ou IR de set especial tiragem limitada
6-7: IR (Illustration Rare) de set regular
4-5: Full Art / Ultra Rare
1-3: Holo Rare / Rare comum

D) DEMANDA (peso 25%)
10: Pokémon ícone global (Charizard, Pikachu, Mewtwo, Eevee) + arte excepcional
8-9: Starter popular (Piplup, Gengar, Umbreon) com forte base de fãs
6-7: Pokémon popular mas não ícone, boa demanda colecionável
4-5: Pokémon mediano, demanda moderada
1-3: Pokémon com pouco apelo colecionável

E) TENDÊNCIA DE PREÇO (peso 20%)
10: Alta > 20% em 30 dias com volume crescente
7-9: Alta 5-20% em 30 dias
5-6: Estável (-5% a +5%)
3-4: Queda 5-15% em 30 dias
1-2: Queda > 15% em 30 dias

PASSO 3 — CÁLCULO DO SCORE FINAL:
Score Final = (A×0.15) + (B×0.20) + (C×0.20) + (D×0.25) + (E×0.20)
Arredonde para 1 casa decimal.

PASSO 4 — RECOMENDAÇÃO:
Score ≥ 7.0 → COMPRAR
Score 5.0–6.9 → AGUARDAR
Score < 5.0 → EVITAR

Use tabela markdown para os scores com colunas: Fator | Score | Critério aplicado | Justificativa.

Inclua também:
- Risco de reprint detalhado
- Perspectiva de preço 3-6 meses

Ao final, adicione OBRIGATORIAMENTE este bloco exato (sem alterar o formato):

SCORE_FINAL: [resultado do cálculo com 1 casa decimal]
RECOMENDACAO: [COMPRAR ou AGUARDAR ou EVITAR]
PRECO_USD: [preço raw NM em USD ex: 15.16]`;

  document.getElementById('claude-prompt-box').textContent = prompt;
  window._currentPrompt = prompt;
}

function resetCarta() {
  document.getElementById('carta-empty').style.display = 'block';
  document.getElementById('carta-result').style.display = 'none';
  document.getElementById('searchInput').value = '';
  currentQuery = '';
}

function copyPrompt() {
  const text = window._currentPrompt || '';
  if (!text) return;
  const finish = () => {
    const el = document.getElementById('copy-confirm');
    el.style.display = 'inline';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
  } else {
    fallbackCopy(text, finish);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); if (callback) callback(); } catch(e) {}
  document.body.removeChild(ta);
}

// ── Collectrics ───────────────────────────────────
function formatCollectricsForPrompt(item) {
  const cd = item && item.colData ? item.colData : null;
  if (!cd) return 'Collectrics: sem dados salvos para esta carta.';
  const rows = [
    `Collectrics: ${cd.collectricsName || item.name}${cd.collectricsSet ? ` (${cd.collectricsSet})` : ''}`,
    cd.collectricsAsOf ? `Data dos dados: ${cd.collectricsAsOf}` : '',
    cd.dp ? `Demand pressure: ${cd.dp}%` : '',
    cd.ss ? `Supply saturation shift: ${cd.ss}` : '',
    cd.alCount ? `Active listings: ${cd.alCount}` : '',
    cd.al ? `Active listings vs 30d: ${cd.al}%` : '',
    cd.nl ? `New listings: ${cd.nl}` : '',
    cd.nlPct ? `New listings vs 30d: ${cd.nlPct}%` : '',
    cd.sold ? `Sold estimate: ${cd.sold}` : '',
    cd.soldPct ? `Sold estimate vs 30d: ${cd.soldPct}%` : '',
    cd.interpretation ? `Leitura operacional: ${cd.interpretation}` : ''
  ].filter(Boolean);
  return rows.join('\n');
}

function buildClaudePrompt(itemOrName) {
  const item = typeof itemOrName === 'string' ? { name: itemOrName } : itemOrName;
  const cardName = item && item.name ? item.name : '';
  const collectrics = formatCollectricsForPrompt(item);
  return `Analise a carta Pokemon TCG: "${cardName}"

Pesquise antes de pontuar:
- uso competitivo no Limitless TCG;
- preco raw NM nos ultimos 30 dias em TCGPlayer/eBay;
- risco de reprint em PokeBeach/Pokemon.com;
- use os dados Collectrics abaixo como base da parte economica.

DADOS COLLECTRICS JA COLETADOS:
${collectrics}

Pontue de 0 a 10:
A) Competitividade (10%)
B) Protecao contra reprint (15%)
C) Raridade (15%)
D) Demanda colecionavel (25%)
E) Tendencia de preco (20%)
F) Economia / Collectrics (15%)

No criterio F, traduza os dados como economia simples:
- se ha compradores suficientes;
- se ha cartas demais sendo anunciadas;
- se o estoque parece sobrar ou apertar;
- se isso tende a puxar preco para baixo, para cima ou deixar de lado.

Calcule:
Score Final = (A*0.10) + (B*0.15) + (C*0.15) + (D*0.25) + (E*0.20) + (F*0.15)

Ao final, inclua obrigatoriamente este bloco estruturado:
BREAKDOWN:
COMPETITIVIDADE: [0-10] - [justificativa curta]
REPRINT: [0-10] - [justificativa curta]
RARIDADE: [0-10] - [justificativa curta]
DEMANDA: [0-10] - [justificativa curta]
TENDENCIA_PRECO: [0-10] - [justificativa curta]
ECONOMIA_COLLECTRICS: [0-10] - [justificativa curta]

RISKS: [lista curta separada por ponto e virgula]
PRECO_ALVO_USD: [valor]
PRECO_ALVO_BRL: [valor]
MOTIVO_RECOMENDACAO: [frase curta]
SCORE_FINAL: [resultado com 1 casa decimal]
RECOMENDACAO: [COMPRAR ou AGUARDAR ou EVITAR]
PRECO_USD: [preco raw NM em USD]`;
}

function openPromptModal(i) {
  const item = watchlist[i];
  if (!item) return;
  document.getElementById('prompt-modal-name').textContent = item.name;
  document.getElementById('promptTextarea').value = buildClaudePrompt(item);
  document.getElementById('prompt-copy-status').style.display = 'none';
  document.getElementById('promptModal').classList.add('open');
}

function closePromptModal() {
  document.getElementById('promptModal').classList.remove('open');
}

function copyPromptModal() {
  const text = document.getElementById('promptTextarea').value;
  const done = () => {
    const el = document.getElementById('prompt-copy-status');
    el.style.display = 'inline';
    setTimeout(() => { el.style.display = 'none'; }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function openCol() {
  const input = document.getElementById('colInput').value.trim();
  if (!input) return;
  let id = input;
  const m = input.match(/id=(\d+)/);
  if (m) id = m[1];
  const isNum = /^\d+$/.test(id);
  const url = isNum ? `https://mycollectrics.com/card.html?id=${id}` : `https://mycollectrics.com/search.html`;
  document.getElementById('col-iframe').src = url;
  document.getElementById('col-label').textContent = isNum ? `// carta ID: ${id}` : '// abra em nova aba';
  document.getElementById('col-open-btn').onclick = () => window.open(url, '_blank');
  document.getElementById('col-frame-wrap').style.display = 'block';
  document.getElementById('col-placeholder').style.display = 'none';
}

// ── Score extraction ──────────────────────────────
function extractScore(text) {
  // PRIORITY 1: structured tags SCORE_FINAL / RECOMENDACAO / PRECO_USD
  const tagScore = text.match(/SCORE_FINAL\s*:\s*(\d+(?:[.,]\d+)?)/i);
  const tagRec   = text.match(/RECOMENDACAO\s*:\s*(COMPRAR|AGUARDAR|EVITAR)/i);
  const tagUsd   = text.match(/PRECO_USD\s*:\s*([\d.,]+)/i);

  if (tagScore || tagRec) {
    const score = tagScore ? parseFloat(tagScore[1].replace(',','.')) : null;
    const rec   = tagRec   ? tagRec[1].toUpperCase() : null;
    const usd   = tagUsd   ? tagUsd[1].replace(',','.') : null;
    return { score, rec, usd };
  }

  // PRIORITY 2: "Score Final Ponderado: X.X"
  const recFallback = text.match(/(COMPRAR|AGUARDAR|EVITAR)/i);
  const rec = recFallback ? recFallback[1].toUpperCase() : null;
  let score = null;

  const finalMatch = text.match(/(?:score\s+final|final\s+ponderado)[^\d]{0,20}(\d+[.,]\d+|\d+)\s*(?:\/\s*10)?/i);
  if (finalMatch) {
    const v = parseFloat(finalMatch[1].replace(',','.'));
    if (v >= 0 && v <= 10) score = v;
  }

  // PRIORITY 3: average of 1-2 digit X/10 values (excludes card numbers like 098/094)
  if (!score) {
    const allScores = [];
    const re = /(?<!\d)(\d{1,2}(?:[.,]\d+)?)\s*\/\s*10(?!\d)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const v = parseFloat(m[1].replace(',','.'));
      if (v >= 0 && v <= 10) allScores.push(v);
    }
    if (allScores.length > 0) {
      score = Math.round((allScores.reduce((a,b) => a+b, 0) / allScores.length) * 10) / 10;
    }
  }

  // Extract USD from text
  const usdMatch = text.match(/\$\s*([\d]+(?:[.,]\d{1,2})?)/);
  const usd = usdMatch ? usdMatch[1].replace(',','.') : null;

  return { score, rec, usd };
}
function recClass(rec) {
  if (!rec) return '';
  if (rec === 'COMPRAR') return 'rec-comprar';
  if (rec === 'AGUARDAR') return 'rec-aguardar';
  return 'rec-evitar';
}

function extractInsights(text) {
  const insights = { factors: [], reprint: null, perspectiva: null };

  // Extract factor rows from markdown table
  // Matches: | **A) Name** | 9 | Short criterion | Long justification |
  const re = /\|\s*\*{0,2}([A-F]\)[\s\wÀ-ɏ/(),.-]+?)\*{0,2}\s*\|\s*(\d+(?:[.,]\d+)?)\s*\|([^|]+)\|/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name  = m[1].trim();
    const score = parseFloat(m[2].replace(',','.'));
    const summary = m[3].trim().replace(/\*+/g,'').replace(/\s+/g,' ').substring(0, 90);
    if (!isNaN(score)) insights.factors.push({ name, score, summary });
  }

  // Extract reprint risk section
  const repM = text.match(/###?\s*Risco de Reprint[^\n]*\n+([\s\S]+?)(?=\n###|\nSCORE_FINAL|$)/i);
  if (repM) insights.reprint = repM[1].replace(/[*_#]+/g,'').replace(/\s+/g,' ').trim().substring(0,220);

  // Extract perspectiva section
  const pM = text.match(/###?\s*Perspectiva[^\n]*\n+([\s\S]+?)(?=\n###|\nSCORE_FINAL|$)/i);
  if (pM) insights.perspectiva = pM[1].replace(/[*_#]+/g,'').replace(/\s+/g,' ').trim().substring(0,220);

  return insights.factors.length ? insights : null;
}

function extractLineValue(text, label) {
  const re = new RegExp('^\\s*' + label + '\\s*:\\s*(.+)$', 'im');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function cleanAnalysisValue(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseStructuredAnalysis(text) {
  const labelMap = {
    COMPETITIVIDADE: 'competitividade',
    REPRINT: 'reprint',
    RARIDADE: 'raridade',
    DEMANDA: 'demanda',
    TENDENCIA_PRECO: 'tendenciaPreco',
    ECONOMIA_COLLECTRICS: 'economiaCollectrics'
  };
  const scoreBreakdown = {};
  const scoreJustifications = {};
  const re = /^\s*(COMPETITIVIDADE|REPRINT|RARIDADE|DEMANDA|TENDENCIA_PRECO|ECONOMIA_COLLECTRICS)\s*:\s*(\d+(?:[.,]\d+)?)\s*(?:[-:–—]\s*)?(.*)$/gmi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const key = labelMap[m[1].toUpperCase()];
    const score = parseFloat(m[2].replace(',', '.'));
    if (!key || Number.isNaN(score)) continue;
    scoreBreakdown[key] = score;
    scoreJustifications[key] = cleanAnalysisValue(m[3]);
  }

  const risksRaw = extractLineValue(text, 'RISKS');
  const risks = risksRaw
    ? risksRaw.split(';').map(v => cleanAnalysisValue(v)).filter(Boolean)
    : [];

  return {
    scoreBreakdown: Object.keys(scoreBreakdown).length ? scoreBreakdown : null,
    scoreJustifications: Object.keys(scoreJustifications).length ? scoreJustifications : null,
    risks,
    targetBuyPriceUsd: extractLineValue(text, 'PRECO_ALVO_USD'),
    targetBuyPriceBrl: extractLineValue(text, 'PRECO_ALVO_BRL'),
    recommendationReason: extractLineValue(text, 'MOTIVO_RECOMENDACAO')
  };
}

function renderInsights(h) {
  if (!h.insights || !h.insights.factors || !h.insights.factors.length) return '';
  const meta = {
    'A)': { short: 'COMP',      icon: 'C'  },
    'B)': { short: 'REPRINT',   icon: 'R'  },
    'C)': { short: 'RARIDADE',  icon: 'RA' },
    'D)': { short: 'DEMANDA',   icon: 'D'  },
    'E)': { short: 'TENDENCIA', icon: 'T'  },
    'F)': { short: 'ECONOMIA',  icon: '$'  }
  };
  const rows = h.insights.factors.map(f => {
    const key = Object.keys(meta).find(k => f.name.startsWith(k)) || '';
    const m   = meta[key] || { short: f.name.substring(0,8), icon: '-' };
    const sc  = f.score >= 7 ? 'var(--green)' : f.score >= 5 ? 'var(--accent)' : 'var(--red)';
    return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04);">
      <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);width:70px;flex-shrink:0;white-space:nowrap;">${m.icon} ${m.short}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:17px;color:${sc};min-width:20px;line-height:1;">${f.score}</span>
      <span style="font-size:10px;color:#7070a0;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${escapeHtml(f.summary)}</span>
    </div>`;
  }).join('');

  const reprint = h.insights.reprint
    ? `<div style="margin-top:7px;padding:6px 9px;background:rgba(224,92,75,.06);border-left:2px solid var(--red);border-radius:0 3px 3px 0;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--red);letter-spacing:1px;margin-bottom:3px;">RISCO REPRINT</div>
        <div style="font-size:10px;color:#9090a8;line-height:1.55;">${escapeHtml(h.insights.reprint).substring(0,200)}${h.insights.reprint.length>200?'...':''}</div>
      </div>` : '';

  const persp = h.insights.perspectiva
    ? `<div style="margin-top:6px;padding:6px 9px;background:rgba(75,205,122,.05);border-left:2px solid var(--green);border-radius:0 3px 3px 0;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--green);letter-spacing:1px;margin-bottom:3px;">PERSPECTIVA 3-6 MESES</div>
        <div style="font-size:10px;color:#9090a8;line-height:1.55;">${escapeHtml(h.insights.perspectiva).substring(0,200)}${h.insights.perspectiva.length>200?'...':''}</div>
      </div>` : '';

  return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">analise detalhada</div>
    ${rows}${reprint}${persp}
  </div>`;
}

function renderStructuredAnalysis(h) {
  const labels = [
    ['competitividade', 'COMPETITIVIDADE'],
    ['reprint', 'REPRINT'],
    ['raridade', 'RARIDADE'],
    ['demanda', 'DEMANDA'],
    ['tendenciaPreco', 'TENDENCIA'],
    ['economiaCollectrics', 'ECONOMIA']
  ];
  const breakdown = h.scoreBreakdown || {};
  const just = h.scoreJustifications || {};
  const hasBreakdown = labels.some(([key]) => breakdown[key] !== undefined || just[key]);
  const extras = [];
  if (h.recommendationReason) extras.push(['MOTIVO', h.recommendationReason]);
  if (h.targetBuyPriceUsd) extras.push(['ALVO USD', h.targetBuyPriceUsd]);
  if (h.targetBuyPriceBrl) extras.push(['ALVO BRL', h.targetBuyPriceBrl]);

  const breakdownHtml = hasBreakdown ? labels.map(([key, label]) => {
    const value = breakdown[key];
    const color = value >= 7 ? 'var(--green)' : value >= 5 ? 'var(--accent)' : 'var(--red)';
    return `<div style="display:grid;grid-template-columns:92px 34px 1fr;gap:8px;align-items:start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);">
      <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.7px;">${label}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:${value === undefined ? 'var(--muted)' : color};line-height:1;">${value === undefined ? '--' : value}</span>
      <span style="font-size:10px;color:#9090a8;line-height:1.45;">${escapeHtml(just[key] || '')}</span>
    </div>`;
  }).join('') : '';

  const extrasHtml = extras.length ? `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
    ${extras.map(([label, value]) => `<span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#b0b0c8;border:1px solid var(--border);border-radius:4px;padding:4px 6px;"><span style="color:var(--muted);">${label}:</span> ${escapeHtml(value)}</span>`).join('')}
  </div>` : '';

  const risksHtml = h.risks && h.risks.length ? `<div style="margin-top:8px;font-size:10px;color:#9090a8;line-height:1.5;">
    <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--red);letter-spacing:1px;">RISCOS:</span>
    ${h.risks.map(escapeHtml).join('; ')}
  </div>` : '';

  const details = [
    h.analysisText ? `<details style="margin-top:8px;"><summary style="cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--accent3);">Resposta completa salva</summary><pre style="white-space:pre-wrap;max-height:260px;overflow:auto;margin-top:8px;padding:10px;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,.03);font-size:10px;color:#b0b0c8;line-height:1.45;">${escapeHtml(h.analysisText)}</pre></details>` : '',
    h.promptText ? `<details style="margin-top:6px;"><summary style="cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--accent);">Prompt usado</summary><pre style="white-space:pre-wrap;max-height:260px;overflow:auto;margin-top:8px;padding:10px;border:1px solid var(--border);border-radius:4px;background:rgba(255,255,255,.03);font-size:10px;color:#b0b0c8;line-height:1.45;">${escapeHtml(h.promptText)}</pre></details>` : ''
  ].join('');

  if (!hasBreakdown && !extrasHtml && !risksHtml && !details) return '';
  return `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;">dados salvos da analise</div>
    ${breakdownHtml}${extrasHtml}${risksHtml}${details}
  </div>`;
}
function scoreColor(score) {
  if (score === null) return 'var(--muted)';
  if (score >= 7) return 'var(--green)';
  if (score >= 5) return 'var(--accent)';
  return 'var(--red)';
}

// ── Modal ─────────────────────────────────────────
function openModal(i) {
  modalIndex = i;
  document.getElementById('modal-carta-name').textContent = watchlist[i].name;
  document.getElementById('scoreTextarea').value = '';
  // colNotes legacy — no longer in score modal
  document.getElementById('priceUsdInput').value = '';
  document.getElementById('priceBrlInput').value = '';
  document.getElementById('priceUsdInput').className = '';
  document.getElementById('priceBrlInput').className = '';
  document.getElementById('err-usd').classList.remove('show');
  document.getElementById('err-brl').classList.remove('show');
  document.getElementById('modal-preview').style.display = 'none';
  document.getElementById('modal-err').style.display = 'none';
  document.getElementById('saveScoreBtn').disabled = true;
  // Reset checklist
  const mcScore = document.getElementById('mc-score');
  const mcUsd = document.getElementById('mc-usd');
  const mcBrl = document.getElementById('mc-brl');
  if (mcScore) { mcScore.textContent = '⬜ Cole a análise do Claude acima'; mcScore.classList.remove('done'); }
  if (mcUsd) { mcUsd.textContent = '⬜ Informe o preço em USD'; mcUsd.classList.remove('done'); }
  if (mcBrl) { mcBrl.textContent = '⬜ Informe o preço em BRL (Liga)'; mcBrl.classList.remove('done'); }
  // Liga link
  const enc = encodeURIComponent(watchlist[i].name);
  const ligaLink = document.getElementById('modal-liga-link');
  if (ligaLink) ligaLink.innerHTML = `<a href="https://www.tcgplayer.com/search/pokemon/product?q=${enc}" target="_blank" style="color:var(--accent3);">TCGPlayer →</a> &nbsp; <a href="https://www.ligapokemon.com.br/?view=cards%2Fcard&tipo=1&card=${enc}" target="_blank" style="color:var(--accent3);">Liga Pokémon →</a>`;
  document.getElementById('scoreModal').classList.add('open');
}

function closeModal() {
  document.getElementById('scoreModal').classList.remove('open');
  modalIndex = -1;
}

// Close on overlay click
document.getElementById('scoreModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('promptModal').addEventListener('click', function(e) {
  if (e.target === this) closePromptModal();
});

function previewScore() {
  const text = document.getElementById('scoreTextarea').value;
  const { score, rec, usd } = extractScore(text);

  // Auto-fill USD if found and field is empty
  if (usd) {
    const usdInput = document.getElementById('priceUsdInput');
    if (!usdInput.value.trim()) {
      usdInput.value = usd;
      usdInput.className = 'input-ok';
    }
  }

  const preview = document.getElementById('modal-preview');
  const err = document.getElementById('modal-err');
  const saveBtn = document.getElementById('saveScoreBtn');

  if (!score && !rec) {
    preview.style.display = 'none';
    err.style.display = text.length > 30 ? 'block' : 'none';
    saveBtn.disabled = true;
    return;
  }

  err.style.display = 'none';
  preview.style.display = 'block';
  saveBtn.disabled = false;

  document.getElementById('prev-score').textContent = score !== null ? score.toFixed(1) : '—';
  document.getElementById('prev-score').style.color = scoreColor(score);

  const recEl = document.getElementById('prev-rec');
  recEl.textContent = rec || '—';
  recEl.className = 'mp-rec ' + recClass(rec);

  document.getElementById('prev-extra').textContent = score !== null && rec
    ? `Score ${score.toFixed(1)}/10 · ${rec}`
    : score !== null ? `Score ${score.toFixed(1)}/10` : rec || '';

  // update checklist
  const mcScore = document.getElementById('mc-score');
  if (mcScore) { mcScore.textContent = '✅ Análise do Claude colada'; mcScore.classList.add('done'); }
  validatePrices();
}

function validatePrices() {
  const usd = document.getElementById('priceUsdInput').value.trim();
  const brl = document.getElementById('priceBrlInput').value.trim();
  const text = document.getElementById('scoreTextarea').value;
  const { score, rec } = extractScore(text);
  const hasAnalysis = !!(score || rec);

  // Field states
  const usdInput = document.getElementById('priceUsdInput');
  const brlInput = document.getElementById('priceBrlInput');
  const errUsd = document.getElementById('err-usd');
  const errBrl = document.getElementById('err-brl');
  const mcUsd = document.getElementById('mc-usd');
  const mcBrl = document.getElementById('mc-brl');

  if (usd) {
    usdInput.className = 'input-ok';
    errUsd.classList.remove('show');
    if (mcUsd) { mcUsd.textContent = `✅ USD registrado: $${usd}`; mcUsd.classList.add('done'); }
  } else {
    usdInput.className = '';
    if (mcUsd) { mcUsd.textContent = '⬜ Informe o preço em USD'; mcUsd.classList.remove('done'); }
  }

  if (brl) {
    brlInput.className = 'input-ok';
    errBrl.classList.remove('show');
    if (mcBrl) { mcBrl.textContent = `✅ BRL registrado: R$${brl}`; mcBrl.classList.add('done'); }
  } else {
    brlInput.className = '';
    if (mcBrl) { mcBrl.textContent = '⬜ Informe o preço em BRL (Liga)'; mcBrl.classList.remove('done'); }
  }

  // Enable save only when all 3 filled
  const canSave = hasAnalysis && usd && brl;
  document.getElementById('saveScoreBtn').disabled = !canSave;
}

function trySave() {
  // Show errors on empty required fields
  const usd = document.getElementById('priceUsdInput').value.trim();
  const brl = document.getElementById('priceBrlInput').value.trim();
  if (!usd) {
    document.getElementById('err-usd').classList.add('show');
    document.getElementById('priceUsdInput').className = 'input-err';
  }
  if (!brl) {
    document.getElementById('err-brl').classList.add('show');
    document.getElementById('priceBrlInput').className = 'input-err';
  }
}

function saveScore() {
  if (modalIndex < 0) return;
  const text = document.getElementById('scoreTextarea').value;
  const { score, rec } = extractScore(text);
  if (!score && !rec) return;

  const usd = document.getElementById('priceUsdInput').value.trim().replace(',','.');
  const brl = document.getElementById('priceBrlInput').value.trim().replace('.',',');
  if (!usd || !brl) { trySave(); return; }

  const structured = parseStructuredAnalysis(text);
  const snapshot = {
    date: new Date().toLocaleDateString('pt-BR'),
    score,
    rec,
    priceUsd: usd,
    priceBrl: brl,
    insights: extractInsights(text),
    promptText: buildClaudePrompt(watchlist[modalIndex]),
    analysisText: text,
    scoreBreakdown: structured.scoreBreakdown,
    scoreJustifications: structured.scoreJustifications,
    risks: structured.risks,
    targetBuyPriceUsd: structured.targetBuyPriceUsd,
    targetBuyPriceBrl: structured.targetBuyPriceBrl,
    recommendationReason: structured.recommendationReason
  };

  // Save current values for quick display
  watchlist[modalIndex].score = score;
  watchlist[modalIndex].rec = rec;
  watchlist[modalIndex].scoreDate = snapshot.date;
  watchlist[modalIndex].priceUsd = usd;
  watchlist[modalIndex].priceBrl = brl;
  watchlist[modalIndex].priceUsdDate = snapshot.date;
  watchlist[modalIndex].priceBrlDate = snapshot.date;

  // Append to history
  if (!watchlist[modalIndex].history) watchlist[modalIndex].history = [];
  watchlist[modalIndex].history.push(snapshot);

  persistWatchlist();
  closeModal();
  renderWatch();
}

// addChip removed — Collectrics now has dedicated modal

// ── Watchlist ordering ────────────────────────────
let draggedWatchIndex = null;
let watchSortMode = localStorage.getItem('pkm_watch_sort_mode') || 'manual';

function normalizeWatchOrder() {
  watchlist.forEach((item, idx) => {
    if (item.manualOrder === undefined || item.manualOrder === null) item.manualOrder = idx;
  });
}

function persistWatchlist(options = {}) {
  const pushDrive = options.pushDrive !== false;
  normalizeWatchOrder();
  localStorage.setItem('pkm_watchlist', JSON.stringify(watchlist));
  if (pushDrive) driveAutoPush();
}

function parseLocaleDateBR(d) {
  if (!d) return 0;
  const parts = String(d).split('/').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const [day, month, year] = parts;
  return new Date(year, month - 1, day).getTime();
}

function numericPrice(v) {
  if (v === undefined || v === null || v === '') return -Infinity;
  const normalized = String(v).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : -Infinity;
}

function sortWatch(mode) {
  normalizeWatchOrder();
  watchSortMode = mode;
  localStorage.setItem('pkm_watch_sort_mode', mode);

  const recRank = { COMPRAR: 3, AGUARDAR: 2, EVITAR: 1 };
  const scoreVal = item => (item.score !== undefined && item.score !== null) ? Number(item.score) : -Infinity;

  if (mode === 'manual') {
    watchlist.sort((a, b) => (a.manualOrder ?? 0) - (b.manualOrder ?? 0));
  } else if (mode === 'scoreDesc') {
    watchlist.sort((a, b) => scoreVal(b) - scoreVal(a) || String(a.name).localeCompare(String(b.name)));
  } else if (mode === 'scoreAsc') {
    watchlist.sort((a, b) => scoreVal(a) - scoreVal(b) || String(a.name).localeCompare(String(b.name)));
  } else if (mode === 'rec') {
    watchlist.sort((a, b) => (recRank[b.rec] || 0) - (recRank[a.rec] || 0) || scoreVal(b) - scoreVal(a));
  } else if (mode === 'priceUsdDesc') {
    watchlist.sort((a, b) => numericPrice(b.priceUsd) - numericPrice(a.priceUsd) || String(a.name).localeCompare(String(b.name)));
  } else if (mode === 'dateDesc') {
    watchlist.sort((a, b) => parseLocaleDateBR(b.date) - parseLocaleDateBR(a.date) || String(a.name).localeCompare(String(b.name)));
  } else if (mode === 'alpha') {
    watchlist.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  localStorage.setItem('pkm_watchlist', JSON.stringify(watchlist));
  renderWatch();
  if (mode !== 'manual') driveAutoPush();
}

function reorderWatch(fromIndex, toIndex) {
  if (fromIndex === null || toIndex === null || Number.isNaN(fromIndex) || Number.isNaN(toIndex) || fromIndex === toIndex) return;
  const moved = watchlist.splice(fromIndex, 1)[0];
  watchlist.splice(toIndex, 0, moved);
  watchlist.forEach((item, idx) => item.manualOrder = idx);
  watchSortMode = 'manual';
  localStorage.setItem('pkm_watch_sort_mode', 'manual');
  persistWatchlist();
  renderWatch();
}

function watchDragStart(e, i) {
  draggedWatchIndex = i;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(i));
  setTimeout(() => e.currentTarget.classList.add('dragging'), 0);
}

function watchDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function watchDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function watchDrop(e, i) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const from = draggedWatchIndex !== null ? draggedWatchIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
  reorderWatch(from, i);
}

function watchDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.watch-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedWatchIndex = null;
}

// ── Watchlist render ──────────────────────────────
function renderWatch() {
  const c = document.getElementById('watchlistContainer');
  if (!watchlist.length) {
    c.innerHTML = '<div style="text-align:center;padding:36px;color:var(--muted);font-size:13px;"><span style="font-size:24px;display:block;margin-bottom:8px;">📋</span>Watchlist vazia. Adicione cartas acima.</div>';
    return;
  }

  c.innerHTML = watchlist.map((item, i) => {
    const enc = encodeURIComponent(item.name);
    const hasScore = item.score !== undefined || item.rec;

    const scoreBar = hasScore ? `
      <div class="watch-score-bar">
        <div class="ws-score" style="color:${scoreColor(item.score)}">${item.score !== undefined ? item.score.toFixed(1) : '—'}</div>
        <div class="ws-info">
          <div class="ws-rec ${recClass(item.rec)}">${item.rec || '—'}</div>
          <div class="ws-date">Atualizado em ${item.scoreDate || '—'}</div>
        </div>
        <button class="btn-score" onclick="openModal(${i})">↺ Atualizar</button>
        ${(item.history && item.history.length > 1) ? `<button class="btn-score" style="color:var(--accent3);border-color:rgba(75,207,224,.3);background:rgba(75,207,224,.06);" onclick="openHistory(${i})">📈 ${item.history.length}x</button>` : ''}
      </div>` : '';

    const cd = item.colData;
    const fmtPct = v => { if (!v) return null; const s = String(v).trim(); return (s.startsWith('+')||s.startsWith('-')) ? s+'%' : '+'+s+'%'; };

    function colBar(value, max, stops) {
      const pct = Math.min(Math.max((parseFloat(value)/max)*100, 0), 100);
      const stopsCss = stops.map(s => `${s.color} ${s.at}%`).join(', ');
      return `<div style="position:relative;height:6px;border-radius:3px;background:linear-gradient(to right,${stopsCss});margin:5px 0 4px;">
        <div style="position:absolute;top:-5px;left:${pct}%;transform:translateX(-50%);width:3px;height:16px;background:#fff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,.6);"></div>
      </div>`;
    }

    const colMetricsBar = cd ? (() => {
      const dp = parseFloat(cd.dp), ss = parseFloat(cd.ss);
      const alRaw = cd.al ? String(cd.al).trim() : null;
      const alNeg = alRaw && alRaw.startsWith('-');
      const alCountRaw = cd.alCount ? String(cd.alCount).trim() : null;
      const nlRaw = cd.nl ? String(cd.nl).trim() : null;
      const nlPctRaw = cd.nlPct ? String(cd.nlPct).trim() : null;
      const soldRaw = cd.sold ? String(cd.sold).trim() : null;
      const soldPctRaw = cd.soldPct ? String(cd.soldPct).trim() : null;

      // Labels PT-BR
      const dpLabel = dp >= 12 ? 'escassa' : dp >= 7 ? 'moderada' : dp >= 3 ? 'fraca' : 'excesso';
      const ssLabel = ss > 1.5 ? 'expandindo ⚠️' : ss > 1.0 ? 'neutro' : 'contraindo ✓';
      const alLabel = alNeg ? 'oferta caindo' : 'oferta subindo';

      const dpBar = !isNaN(dp) ? colBar(dp, 15,
        [{color:'#e05c4b',at:0},{color:'#f7c948',at:33},{color:'#4bcd7a',at:66}]) : '';
      const ssBar = !isNaN(ss) ? colBar(ss, 2,
        [{color:'#4bcd7a',at:0},{color:'#f7c948',at:50},{color:'#e05c4b',at:85}]) : '';
      const alFmt = fmtPct(cd.al);
      const alColor = alNeg ? 'var(--green)' : 'var(--red)';

      // Chips para o header
      const dpChip = !isNaN(dp) ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">DP</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:${dp>=10?'var(--green)':dp<5?'var(--red)':'var(--accent)'};">${cd.dp}%</span>
        <span style="font-size:8px;color:var(--muted);">${dpLabel}</span>
      </span>` : '';
      const ssChip = !isNaN(ss) ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">SS</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:${ss>1.5?'var(--red)':ss>1.0?'var(--accent)':'var(--green)'};">${cd.ss}${ss>1.5?' ⚠️':''}</span>
        <span style="font-size:8px;color:var(--muted);">${ssLabel}</span>
      </span>` : '';
      const alChip = alRaw ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">AL</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:${alColor};">${alFmt}</span>
      </span>` : '';
      const alCountChip = alCountRaw ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">ATIVOS</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:var(--text);">${alCountRaw}</span>
      </span>` : '';
      const nlChip = nlRaw ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">NOVOS</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:var(--text);">${nlRaw}</span>
        ${nlPctRaw ? `<span style="font-size:8px;color:${nlPctRaw.startsWith('-')?'var(--green)':'var(--red)'};">${fmtPct(nlPctRaw)}</span>` : ''}
      </span>` : '';
      const soldChip = soldRaw ? `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(75,207,224,.07);border:1px solid rgba(75,207,224,.2);border-radius:4px;padding:2px 6px;">
        <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">VEND.</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:var(--text);">${soldRaw}</span>
        ${soldPctRaw ? `<span style="font-size:8px;color:${soldPctRaw.startsWith('-')?'var(--red)':'var(--green)'};">${fmtPct(soldPctRaw)}</span>` : ''}
      </span>` : '';

      // Conclusão automática — narrativa por indicador
      const dpScore = !isNaN(dp) ? (dp >= 10 ? 2 : dp >= 5 ? 1 : 0) : null;
      const ssScore = !isNaN(ss) ? (ss > 1.5 ? -2 : ss > 1.0 ? -1 : 1) : null;
      const alScore = alRaw ? (alNeg ? 1 : -1) : null;
      const scores = [dpScore, ssScore, alScore].filter(x => x !== null);
      const total = scores.length ? scores.reduce((a,b)=>a+b,0) : null;

      // Frases por indicador
      const dpFrase = !isNaN(dp) ? (
        dp >= 10 ? `a demanda está aquecida (${cd.dp}%)` :
        dp >= 5  ? `a demanda está moderada (${cd.dp}%)` :
                   `a demanda está fraca (${cd.dp}%)`
      ) : null;
      const ssFrase = !isNaN(ss) ? (
        ss > 1.5 ? `a saturação de oferta está alta (${cd.ss}) — possível sinal de flood ou reprint` :
        ss > 1.0 ? `a saturação de oferta está neutra (${cd.ss})` :
                   `a saturação de oferta está contraindo (${cd.ss}), indicando supply enxuto`
      ) : null;
      const alFrase = alRaw ? (
        alNeg ? `os anúncios ativos caíram ${alFmt} — oferta diminuindo` :
                `os anúncios ativos subiram ${alFmt} — oferta aumentando`
      ) : null;

      const nlFrase = nlRaw ? `novos anÃºncios: ${nlRaw}${nlPctRaw ? ` (${fmtPct(nlPctRaw)} vs 30d)` : ''}` : null;
      const soldFrase = soldRaw ? `vendas estimadas: ${soldRaw}${soldPctRaw ? ` (${fmtPct(soldPctRaw)} vs 30d)` : ''}` : null;
      const partes = [dpFrase, soldFrase, ssFrase, alFrase, nlFrase].filter(Boolean);
      let conclusaoCor = 'var(--muted)';
      if (partes.length) {
        if      (total >= 3)  conclusaoCor = 'var(--green)';
        else if (total >= 1)  conclusaoCor = 'var(--accent)';
        else if (total >= -2) conclusaoCor = '#f7a048';
        else                  conclusaoCor = 'var(--red)';
      }
      const leitura = (typeof interpretColData === 'function')
        ? interpretColData(cd)
        : (cd.interpretation || '');

      return `
      <div class="col-metrics-bar" style="flex-direction:column;gap:0;padding:0;">
        <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;cursor:pointer;flex-wrap:nowrap;" onclick="toggleSection(this)">
          <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--accent3);letter-spacing:1px;text-transform:uppercase;white-space:nowrap;">📊 ${cd.updatedAt||''}</span>
          <span style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">${dpChip}${ssChip}${alChip}${alCountChip}${nlChip}${soldChip}</span>
          <span style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-shrink:0;">
            <button class="btn-score" style="color:var(--accent3);border-color:rgba(75,207,224,.3);background:rgba(75,207,224,.06);font-size:9px;" onclick="event.stopPropagation();openColModal(${i})">✏️</button>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);" data-toggle-icon>▶</span>
          </span>
        </div>
        <div data-section-body style="display:none;padding:10px 18px 12px;border-top:1px solid var(--border);">
          <div style="display:flex;gap:24px;align-items:flex-start;">
            ${!isNaN(dp) ? `<div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;">Pressão de Demanda</span>
                <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${dp>=10?'var(--green)':dp<5?'var(--red)':'var(--accent)'};">${cd.dp}%</span>
              </div>
              ${dpBar}
              <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);">
                <span>excesso</span><span style="color:${dp>=10?'var(--green)':dp<5?'var(--red)':'var(--accent)'};">${dpLabel}</span><span>escassa</span>
              </div>
            </div>` : ''}
            ${!isNaN(ss) ? `<div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;">Saturação de Oferta</span>
                <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${ss>1.5?'var(--red)':ss>1.0?'var(--accent)':'var(--green)'};">${cd.ss}${ss>1.5?' ⚠️':''}</span>
              </div>
              ${ssBar}
              <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);">
                <span>contraindo</span><span style="color:${ss>1.5?'var(--red)':ss>1.0?'var(--accent)':'var(--green)'};">${ssLabel}</span><span>expandindo</span>
              </div>
            </div>` : ''}
            ${alRaw ? `<div style="flex:0 0 auto;align-self:center;text-align:center;">
              <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">Anúncios vs 30d</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${alColor};">${alFmt}</div>
              <div style="font-size:9px;color:var(--muted);">${alLabel}</div>
            </div>` : ''}
          </div>
          ${leitura ? `<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:10px;color:${conclusaoCor};line-height:1.45;">${escapeHtml(leitura)}</div>` : ''}
        </div>
      </div>`; })() : '';

    const notesBar = (item.colNotes && !item.colData) ? `
      <div class="watch-notes" style="padding:0;">
        <div style="display:flex;align-items:center;gap:8px;padding:7px 14px;cursor:pointer;" onclick="toggleSection(this)">
          <span class="wn-label" style="margin:0;">📊 Collectrics</span>
          <span style="margin-left:auto;display:flex;gap:6px;align-items:center;">
            <button class="btn-score" style="font-size:9px;" onclick="event.stopPropagation();openColNotesEdit(${i})">✏️ Editar</button>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);" data-toggle-icon>▶</span>
          </span>
        </div>
        <div data-section-body style="display:none;padding:4px 14px 10px;border-top:1px solid var(--border);font-size:11px;color:#9090a8;line-height:1.65;white-space:pre-wrap;">${item.colNotes.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      </div>` : '';

    const hasPrice = item.priceUsd || item.priceBrl;
    const pricesBar = hasPrice ? `
      <div class="watch-prices">
        ${item.priceUsd ? `<div class="wp-item"><div class="wp-label">💵 USD (TCG/eBay)</div><div class="wp-value">$${item.priceUsd}</div><div class="wp-date">${item.priceUsdDate||''}</div></div>` : ''}
        ${item.priceBrl ? `<div class="wp-item"><div class="wp-label">🇧🇷 BRL (Liga)</div><div class="wp-value">R$${item.priceBrl}</div><div class="wp-date">${item.priceBrlDate||''}</div></div>` : ''}
        <div class="wp-item" style="margin-left:auto;">
          <div class="wp-label">Cotação registrada em</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted);">${item.priceUsdDate || item.priceBrlDate || '—'}</div>
        </div>
      </div>` : '';

        const thumbHtml = item.imageUrl
      ? `<img class="watch-thumb" src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" onclick="openImageModal(${i})" style="cursor:pointer;align-self:flex-start;margin-top:2px;" /><div class="watch-thumb-placeholder" style="display:none;" onclick="openImageModal(${i})"><span>🖼️</span></div>`
      : `<div class="watch-thumb-placeholder" onclick="openImageModal(${i})" title="Adicionar imagem"><span>📷</span></div>`;

    return `
    <div class="watch-item" draggable="true" ondragstart="watchDragStart(event, ${i})" ondragover="watchDragOver(event)" ondragleave="watchDragLeave(event)" ondrop="watchDrop(event, ${i})" ondragend="watchDragEnd(event)">
      <div class="watch-main">
        <div class="watch-rank">#${i + 1}</div>
        <div class="drag-handle" title="Arrastar para reordenar">⋮⋮</div>
        ${thumbHtml}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
            <span class="wname">${item.name}</span>
            <span class="wmeta">${item.date}</span>
          </div>
          <div class="wlinks">
            <button class="btn-score" onclick="openPromptModal(${i})">Prompt</button>
            <button class="btn-score" onclick="openModal(${i})">+ Score</button>
            <button class="btn-score" style="color:var(--accent3);border-color:rgba(75,207,224,.3);background:rgba(75,207,224,.06);" onclick="openColModal(${i})">📊</button>
            <button class="btn-sm" style="font-size:10px;padding:4px 8px;color:var(--red);border-color:var(--red);" onclick="removeWatch(${i})">✕</button>
          </div>
        </div>
      </div>
      ${scoreBar}
      ${pricesBar}
      ${colMetricsBar}
      ${notesBar}
    </div>`;
}).join('');
}

function parseCardId(name) {
  // Try to extract set code and number from "CardName (NNN/TTT)" or "CardName NNN/TTT"
  const m = name.match(/\((\d+)\/(\d+)\)|(\d+)\/(\d+)/);
  if (!m) return null;
  const num = (m[1] || m[3]).padStart(3, '0');
  return num;
}

function guessSetCode(name) {
  // Try to match known set patterns from the name
  const lower = name.toLowerCase();
  if (lower.includes('ascended heroes') || lower.includes('me2')) return 'me2';
  if (lower.includes('phantasmal flames') || lower.includes('me02') || lower.includes('pfl')) return 'me02';
  if (lower.includes('perfect order') || lower.includes('me03')) return 'me03';
  if (lower.includes('chaos rising') || lower.includes('me04')) return 'me04';
  if (lower.includes('mega evolution') || lower.includes('me01') || lower.includes('me1')) return 'me1';
  if (lower.includes('prismatic') || lower.includes('pre')) return 'sv8a';
  if (lower.includes('151') || lower.includes('sv2a')) return 'sv2a';
  if (lower.includes('stellar crown') || lower.includes('scr')) return 'scr';
  if (lower.includes('obsidian') || lower.includes('sv3')) return 'sv3';
  if (lower.includes('paradox rift') || lower.includes('sv4')) return 'sv4';
  return null;
}

function buildTcgdexUrl(name) {
  const setCode = guessSetCode(name);
  const num = parseCardId(name);
  if (!setCode || !num) return null;
  return `https://assets.tcgdex.net/en/${setCode}/${num}/high.webp`;
}

function cleanCardNameForSearch(name) {
  return name
    .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/g, '')
    .replace(/\b\d+\s*\/\s*\d+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPrintedNumber(name) {
  const m = name.match(/\((\d+)\s*\/\s*\d+\)|\b(\d+)\s*\/\s*\d+\b/);
  return m ? (m[1] || m[2]).replace(/^0+/, '') : null;
}

function normalizeCardText(v) {
  return (v || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePokemonTcgApiCard(card, rawName) {
  const wantedName = normalizeCardText(cleanCardNameForSearch(rawName));
  const wantedNumber = extractPrintedNumber(rawName);
  const cardName = normalizeCardText(card && card.name);
  const cardNumber = String((card && card.number) || '').replace(/^0+/, '');
  let points = 0;

  if (wantedName && cardName === wantedName) points += 6;
  else if (wantedName && (cardName.includes(wantedName) || wantedName.includes(cardName))) points += 3;

  if (wantedNumber && cardNumber === wantedNumber) points += 8;
  if (card && card.images && (card.images.large || card.images.small)) points += 2;

  return points;
}

function isStrongPokemonTcgApiMatch(card, rawName) {
  const wantedName = normalizeCardText(cleanCardNameForSearch(rawName));
  const wantedNumber = extractPrintedNumber(rawName);
  const cardName = normalizeCardText(card && card.name);
  const cardNumber = String((card && card.number) || '').replace(/^0+/, '');
  const hasImage = !!(card && card.images && (card.images.large || card.images.small));

  if (!card || !hasImage || !wantedName) return false;

  // If user supplied a collector number, require the collector number to match.
  if (wantedNumber) return cardNumber === wantedNumber && (cardName === wantedName || cardName.includes(wantedName) || wantedName.includes(cardName));

  // Without collector number, only auto-add if the name is exact.
  return cardName === wantedName;
}

function dedupePokemonCards(cards) {
  const seen = new Set();
  const out = [];
  (cards || []).forEach(card => {
    const key = card.id || `${card.name}-${card.number}-${card.set && card.set.id}`;
    if (!seen.has(key)) { seen.add(key); out.push(card); }
  });
  return out;
}

async function fetchPokemonTcgApiCardsByQuery(query, pageSize = 12) {
  const url =
    'https://api.pokemontcg.io/v2/cards?q=' +
    encodeURIComponent(query) +
    `&pageSize=${pageSize}&select=id,name,number,set,images`;

  const r = await fetch(url);
  if (!r.ok) throw new Error('PokemonTCG API HTTP ' + r.status);
  const data = await r.json();
  return Array.isArray(data.data) ? data.data : [];
}

async function searchPokemonTcgApiCards(name) {
  const cleanName = cleanCardNameForSearch(name);
  const printedNumber = extractPrintedNumber(name);
  if (!cleanName) return [];

  const safeName = cleanName.replace(/"/g, '\\"');
  const queries = [];
  if (printedNumber) queries.push(`name:"${safeName}" number:${printedNumber}`);
  queries.push(`name:"${safeName}"`);
  // Last broad attempt: useful when accents, apostrophes or localized names break exact search.
  queries.push(cleanName.split(/\s+/).map(w => `name:${w.replace(/[^\w-]/g, '')}`).filter(Boolean).join(' '));

  const all = [];
  for (const q of queries.filter(Boolean)) {
    try {
      const cards = await fetchPokemonTcgApiCardsByQuery(q, 12);
      all.push(...cards);
    } catch (e) {
      console.warn('Falha ao buscar cartas na PokemonTCG API:', e);
    }
  }

  return dedupePokemonCards(all)
    .map(card => ({ card, points: scorePokemonTcgApiCard(card, name) }))
    .sort((a, b) => b.points - a.points)
    .map(x => x.card);
}

async function fetchPokemonTcgApiImage(name) {
  try {
    const cards = await searchPokemonTcgApiCards(name);
    const card = cards.find(c => isStrongPokemonTcgApiMatch(c, name));
    if (!card || !card.images) return null;

    return {
      imageUrl: card.images.large || card.images.small,
      source: 'PokemonTCG API',
      apiCardId: card.id || null,
      apiSetName: card.set && card.set.name ? card.set.name : null,
      apiCardNumber: card.number || null,
      apiSetPrintedTotal: card.set && (card.set.printedTotal || card.set.total) ? (card.set.printedTotal || card.set.total) : null,
      card
    };
  } catch (e) {
    console.warn('Falha ao buscar imagem na PokemonTCG API:', e);
    return null;
  }
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function formatApiCardName(card, fallbackName) {
  if (!card) return fallbackName;
  const total = card.set && (card.set.printedTotal || card.set.total) ? (card.set.printedTotal || card.set.total) : null;
  const number = card.number || null;
  return number && total ? `${card.name} (${number}/${total})` : (card.name || fallbackName);
}

function addWatchItem(item) {
  normalizeWatchOrder();
  item.manualOrder = watchlist.length;
  item.date = item.date || new Date().toLocaleDateString('pt-BR');
  watchlist.push(item);
  persistWatchlist();
  renderWatch();
}

function testImageUrl(url) {
  return new Promise(resolve => {
    if (!url) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function resolveAndSaveImageForWatchItem(index) {
  const item = watchlist[index];
  if (!item || item.imageUrl) return;

  item.imageStatus = 'buscando';
  persistWatchlist({ pushDrive: false });
  renderWatch();

  // 1) Primary: public Pokémon TCG API. Better because it searches by card name/number.
  const apiResult = await fetchPokemonTcgApiImage(item.name);
  if (apiResult && apiResult.imageUrl && await testImageUrl(apiResult.imageUrl)) {
    const current = watchlist[index];
    if (!current || current.imageUrl) return;

    current.imageUrl = apiResult.imageUrl;
    current.imageSource = apiResult.source;
    current.apiCardId = apiResult.apiCardId;
    current.apiSetName = apiResult.apiSetName;
    delete current.imageStatus;
    persistWatchlist();
    renderWatch();
    return;
  }

  // 2) Fallback: your existing TCGdex heuristic.
  const fallbackUrl = buildTcgdexUrl(item.name);
  if (fallbackUrl && await testImageUrl(fallbackUrl)) {
    const current = watchlist[index];
    if (!current || current.imageUrl) return;

    current.imageUrl = fallbackUrl;
    current.imageSource = 'TCGdex heuristic';
    delete current.imageStatus;
    persistWatchlist();
    renderWatch();
    return;
  }

  const current = watchlist[index];
  if (current && !current.imageUrl) {
    current.imageStatus = 'manual';
    persistWatchlist({ pushDrive: false });
    renderWatch();
  }
}

let pendingWatchException = null;
let selectedWatchExceptionCardIndex = null;

function setWatchAddStatus(msg, show = true) {
  const el = document.getElementById('watchAddStatus');
  if (!el) return;
  el.textContent = msg || '';
  el.style.display = show && msg ? 'inline' : 'none';
}

function setWatchAddBusy(busy) {
  const btn = document.getElementById('watchAddBtn');
  if (btn) {
    btn.disabled = !!busy;
    btn.textContent = busy ? 'BUSCANDO...' : '+ ADD';
  }
  setWatchAddStatus(busy ? 'validando carta e imagem...' : '', !!busy);
}

async function addWatch() {
  const inp = document.getElementById('watchInput');
  const name = inp.value.trim();
  if (!name) return;
  if (watchlist.find(w => w.name.toLowerCase() === name.toLowerCase())) { inp.value=''; return; }

  setWatchAddBusy(true);
  try {
    const apiResult = await fetchPokemonTcgApiImage(name);
    if (apiResult && apiResult.imageUrl && await testImageUrl(apiResult.imageUrl)) {
      addWatchItem({
        name,
        imageUrl: apiResult.imageUrl,
        imageSource: apiResult.source,
        apiCardId: apiResult.apiCardId,
        apiSetName: apiResult.apiSetName,
        apiCardNumber: apiResult.apiCardNumber,
        apiSetPrintedTotal: apiResult.apiSetPrintedTotal
      });
      inp.value = '';
      return;
    }

    // Fallback TCGdex still counts as valid only if the generated image URL loads.
    const fallbackUrl = buildTcgdexUrl(name);
    if (fallbackUrl && await testImageUrl(fallbackUrl)) {
      addWatchItem({ name, imageUrl: fallbackUrl, imageSource: 'TCGdex heuristic' });
      inp.value = '';
      return;
    }

    const candidates = await searchPokemonTcgApiCards(name);
    openWatchException(name, candidates);
  } finally {
    setWatchAddBusy(false);
  }
}

function openWatchException(rawName, candidates) {
  pendingWatchException = { rawName, candidates: candidates || [] };
  selectedWatchExceptionCardIndex = null;

  document.getElementById('watchExceptionInput').value = rawName;
  document.getElementById('watchExceptionImageUrl').value = '';
  document.getElementById('watch-exception-subtitle').textContent = `Entrada: ${rawName}`;
  renderWatchExceptionCandidates();
  document.getElementById('watchExceptionModal').classList.add('open');
}

function closeWatchException() {
  document.getElementById('watchExceptionModal').classList.remove('open');
  pendingWatchException = null;
  selectedWatchExceptionCardIndex = null;
}

function renderWatchExceptionCandidates() {
  const result = document.getElementById('watch-exception-result');
  const box = document.getElementById('watch-exception-candidates');
  const candidates = pendingWatchException && pendingWatchException.candidates ? pendingWatchException.candidates : [];

  if (!candidates.length) {
    result.innerHTML = '<div class="exception-warning">Nenhuma sugestão confiável encontrada. Verifique se o nome/número está correto ou cole uma URL de imagem manual.</div>';
    box.innerHTML = '';
    return;
  }

  result.innerHTML = '<div class="exception-ok">Encontrei possíveis cartas, mas não confirmei automaticamente. Escolha uma delas para salvar com imagem.</div>';
  box.innerHTML = candidates.slice(0, 8).map((card, idx) => {
    const img = card.images && (card.images.small || card.images.large) ? (card.images.small || card.images.large) : '';
    const total = card.set && (card.set.printedTotal || card.set.total) ? (card.set.printedTotal || card.set.total) : '?';
    const setName = card.set && card.set.name ? card.set.name : 'set não identificado';
    const selected = idx === selectedWatchExceptionCardIndex ? ' selected' : '';
    return `
      <div class="exception-card${selected}" onclick="selectWatchExceptionCandidate(${idx})">
        ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(card.name)}" />` : ''}
        <div class="ec-title">${escapeHtml(card.name)} ${card.number ? `(${escapeHtml(card.number)}/${escapeHtml(total)})` : ''}</div>
        <div class="ec-meta">${escapeHtml(setName)}<br>ID: ${escapeHtml(card.id || '—')}</div>
      </div>`;
  }).join('');
}

function selectWatchExceptionCandidate(idx) {
  if (!pendingWatchException || !pendingWatchException.candidates[idx]) return;
  selectedWatchExceptionCardIndex = idx;
  renderWatchExceptionCandidates();

  const card = pendingWatchException.candidates[idx];
  const imageUrl = card.images && (card.images.large || card.images.small) ? (card.images.large || card.images.small) : '';
  if (imageUrl) document.getElementById('watchExceptionImageUrl').value = imageUrl;

  const nameInput = document.getElementById('watchExceptionInput');
  nameInput.value = formatApiCardName(card, nameInput.value.trim() || pendingWatchException.rawName);
}

async function retryWatchExceptionSearch() {
  const input = document.getElementById('watchExceptionInput').value.trim();
  if (!input) return;
  const btn = document.getElementById('watchExceptionRetryBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'BUSCANDO...'; }
  try {
    const apiResult = await fetchPokemonTcgApiImage(input);
    if (apiResult && apiResult.imageUrl && await testImageUrl(apiResult.imageUrl)) {
      addWatchItem({
        name: input,
        imageUrl: apiResult.imageUrl,
        imageSource: apiResult.source,
        apiCardId: apiResult.apiCardId,
        apiSetName: apiResult.apiSetName,
        apiCardNumber: apiResult.apiCardNumber,
        apiSetPrintedTotal: apiResult.apiSetPrintedTotal
      });
      const mainInput = document.getElementById('watchInput');
      if (mainInput && mainInput.value.trim().toLowerCase() === (pendingWatchException && pendingWatchException.rawName || '').toLowerCase()) mainInput.value = '';
      closeWatchException();
      return;
    }

    const candidates = await searchPokemonTcgApiCards(input);
    pendingWatchException = { rawName: input, candidates };
    selectedWatchExceptionCardIndex = null;
    document.getElementById('watch-exception-subtitle').textContent = `Entrada corrigida: ${input}`;
    renderWatchExceptionCandidates();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'BUSCAR'; }
  }
}

async function addWatchFromExceptionManual(requireImage) {
  const name = document.getElementById('watchExceptionInput').value.trim() || (pendingWatchException && pendingWatchException.rawName) || '';
  const imageUrl = document.getElementById('watchExceptionImageUrl').value.trim();
  if (!name) return;

  if (watchlist.find(w => w.name.toLowerCase() === name.toLowerCase())) {
    closeWatchException();
    return;
  }

  if (requireImage && !imageUrl) {
    document.getElementById('watch-exception-result').innerHTML = '<div class="exception-warning">Cole uma URL de imagem antes de salvar com imagem manual.</div>';
    return;
  }

  if (imageUrl && !(await testImageUrl(imageUrl))) {
    document.getElementById('watch-exception-result').innerHTML = '<div class="exception-warning">A URL informada não carregou como imagem. Confira o link ou escolha “Adicionar sem imagem”.</div>';
    return;
  }

  const item = { name, imageStatus: imageUrl ? undefined : 'manual-confirmed' };
  if (imageUrl) {
    item.imageUrl = imageUrl;
    item.imageSource = selectedWatchExceptionCardIndex !== null ? 'PokemonTCG API candidate' : 'manual';
  }

  if (selectedWatchExceptionCardIndex !== null && pendingWatchException && pendingWatchException.candidates[selectedWatchExceptionCardIndex]) {
    const card = pendingWatchException.candidates[selectedWatchExceptionCardIndex];
    item.apiCardId = card.id || null;
    item.apiSetName = card.set && card.set.name ? card.set.name : null;
    item.apiCardNumber = card.number || null;
    item.apiSetPrintedTotal = card.set && (card.set.printedTotal || card.set.total) ? (card.set.printedTotal || card.set.total) : null;
  }

  addWatchItem(item);
  const mainInput = document.getElementById('watchInput');
  if (mainInput && pendingWatchException && mainInput.value.trim().toLowerCase() === pendingWatchException.rawName.toLowerCase()) mainInput.value = '';
  closeWatchException();
}

function removeWatch(i) {
  watchlist.splice(i, 1);
  watchlist.forEach((item, idx) => item.manualOrder = idx);
  persistWatchlist();
  renderWatch();
}

function analyzeInCarta(name) {
  document.getElementById('searchInput').value = name;
  currentQuery = name;
  document.querySelector('.tab[data-tab="carta"]').click();
  showCartaLinks(name, encodeURIComponent(name));
}

// ── Google Drive Sync ────────────────────────────
const DRIVE_CLIENT_ID = localStorage.getItem('pkm_drive_client_id') || '';
const DRIVE_FILE_NAME  = 'pkm-intel-watchlist.json';
const DRIVE_FOLDER_NAME = 'PKM Intel';
const DRIVE_SCOPE      = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

let driveToken   = null;
let driveFileId  = null;
let driveFolderId = null;
let driveSyncing = false;

function setDriveMsg(msg, color) {
  const el = document.getElementById('drive-sync-msg');
  el.textContent = msg;
  el.style.color = color || 'var(--muted)';
  el.style.display = msg ? 'inline' : 'none';
}

function setDriveBtn(label, color) {
  const btn = document.getElementById('drive-btn');
  btn.textContent = label;
  btn.style.color = color || 'var(--muted)';
  btn.style.borderColor = color ? color : 'var(--border)';
}

function driveAction() {
  if (!driveToken) {
    // Check if client ID is set
    const cid = localStorage.getItem('pkm_drive_client_id');
    if (!cid) { openDriveSetup(); return; }
    driveSignIn();
  } else {
    drivePush();
  }
}

function openDriveSetup() {
  document.getElementById('driveSetupModal').classList.add('open');
  const saved = localStorage.getItem('pkm_drive_client_id') || '';
  document.getElementById('drive-client-id-input').value = saved;
}

function closeDriveSetup() {
  document.getElementById('driveSetupModal').classList.remove('open');
}

function saveDriveClientId() {
  const cid = document.getElementById('drive-client-id-input').value.trim();
  if (!cid) return;
  localStorage.setItem('pkm_drive_client_id', cid);
  closeDriveSetup();
  driveSignIn();
}

function driveSignIn() {
  const cid = localStorage.getItem('pkm_drive_client_id');
  if (!cid) { openDriveSetup(); return; }

  setDriveBtn('☁ Conectando...', 'var(--accent)');
  setDriveMsg('autenticando...', 'var(--accent)');

  const client = google.accounts.oauth2.initTokenClient({
    client_id: cid,
    scope: DRIVE_SCOPE,
    callback: (resp) => {
      if (resp.error) {
        setDriveBtn('☁ Erro — tentar novamente', 'var(--red)');
        setDriveMsg('falha na autenticação', 'var(--red)');
        return;
      }
      driveToken = resp.access_token;
      setDriveBtn('☁ Drive conectado ✓', 'var(--green)');
      setDriveMsg('', '');
      drivePull(); // load from Drive on connect
    }
  });
  client.requestAccessToken();
}

async function driveFindFile() {
  const visible = await driveFindVisibleFile();
  if (visible) return { id: visible, legacy: false };

  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILE_NAME}'&fields=files(id)`,
    { headers: { Authorization: `Bearer ${driveToken}` } }
  );
  const data = await r.json();
  return data.files && data.files.length ? { id: data.files[0].id, legacy: true } : null;
}

async function driveFindOrCreateFolder() {
  if (driveFolderId) return driveFolderId;
  const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${driveToken}` } }
  );
  const data = await r.json();
  if (data.files && data.files.length) {
    driveFolderId = data.files[0].id;
    return driveFolderId;
  }

  const cr = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${driveToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  });
  const created = await cr.json();
  driveFolderId = created.id;
  return driveFolderId;
}

async function driveFindVisibleFile() {
  const folderId = await driveFindOrCreateFolder();
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${driveToken}` } }
  );
  const data = await r.json();
  return data.files && data.files.length ? data.files[0].id : null;
}

async function drivePull() {
  if (!driveToken) return;
  setDriveMsg('⬇ carregando do Drive...', 'var(--accent3)');
  try {
    const found = await driveFindFile();
    if (!found) {
      setDriveMsg('sem dados no Drive — faça o primeiro sync', 'var(--muted)');
      driveFileId = null;
      return;
    }
    driveFileId = found.legacy ? null : found.id;
    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files/${found.id}?alt=media`,
      { headers: { Authorization: `Bearer ${driveToken}` } }
    );
    const data = await r.json();
    if (Array.isArray(data)) {
      watchlist = data;
      normalizeWatchOrder();
      if (watchSortMode === 'manual') watchlist.sort((a, b) => (a.manualOrder ?? 0) - (b.manualOrder ?? 0));
      localStorage.setItem('pkm_watchlist', JSON.stringify(watchlist));
      renderWatch();
      if (found.legacy) drivePush();
      setDriveMsg(`✓ ${watchlist.length} cartas carregadas · ${new Date().toLocaleTimeString('pt-BR')}`, 'var(--green)');
      setTimeout(() => setDriveMsg('', ''), 5000);
    }
  } catch(e) {
    setDriveMsg('erro ao carregar do Drive', 'var(--red)');
  }
}

async function drivePush() {
  if (!driveToken || driveSyncing) return;
  driveSyncing = true;
  setDriveMsg('⬆ salvando no Drive...', 'var(--accent)');
  try {
    const body = JSON.stringify(watchlist);
    const visibleId = driveFileId || await driveFindVisibleFile();

    if (visibleId) {
      // Update existing file
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${visibleId}?uploadType=media`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${driveToken}`, 'Content-Type': 'application/json' },
        body
      });
      driveFileId = visibleId;
    } else {
      // Create new visible file in the PKM Intel folder
      const folderId = await driveFindOrCreateFolder();
      const meta = JSON.stringify({ name: DRIVE_FILE_NAME, parents: [folderId] });
      const form = new FormData();
      form.append('metadata', new Blob([meta], { type: 'application/json' }));
      form.append('file', new Blob([body], { type: 'application/json' }));
      const r = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        { method: 'POST', headers: { Authorization: `Bearer ${driveToken}` }, body: form }
      );
      const d = await r.json();
      driveFileId = d.id;
    }
    setDriveMsg(`✓ salvo · ${new Date().toLocaleTimeString('pt-BR')}`, 'var(--green)');
    setTimeout(() => setDriveMsg('', ''), 4000);
  } catch(e) {
    setDriveMsg('erro ao salvar no Drive', 'var(--red)');
  } finally {
    driveSyncing = false;
  }
}

// Auto-push after any watchlist change
function driveAutoPush() {
  if (driveToken) drivePush();
}

// ── Init
normalizeWatchOrder();
if (watchSortMode === 'manual') watchlist.sort((a, b) => (a.manualOrder ?? 0) - (b.manualOrder ?? 0));
renderWatch();
document.getElementById('clock').textContent = new Date().toLocaleTimeString('pt-BR');

// ── Image modal ───────────────────────────────────
let imgModalIndex = -1;

function openImageModal(i) {
  imgModalIndex = i;
  const item = watchlist[i];
  document.getElementById('img-modal-title').textContent = item.name;
  document.getElementById('img-url-input').value = item.imageUrl || '';
  document.getElementById('img-preview').src = item.imageUrl || '';
  document.getElementById('img-preview').style.display = item.imageUrl ? 'block' : 'none';
  document.getElementById('img-preview-placeholder').style.display = item.imageUrl ? 'none' : 'flex';
  document.getElementById('img-auto-msg').style.display = 'none';
  document.getElementById('imageModal').classList.add('open');
}

function closeImageModal() {
  document.getElementById('imageModal').classList.remove('open');
  imgModalIndex = -1;
}

function previewImage() {
  const url = document.getElementById('img-url-input').value.trim();
  const prev = document.getElementById('img-preview');
  const ph = document.getElementById('img-preview-placeholder');
  if (url) {
    prev.src = url;
    prev.style.display = 'block';
    ph.style.display = 'none';
  } else {
    prev.style.display = 'none';
    ph.style.display = 'flex';
  }
}

function tryAutoImage() {
  if (imgModalIndex < 0) return;
  const name = watchlist[imgModalIndex].name;
  const url = buildTcgdexUrl(name);
  const msg = document.getElementById('img-auto-msg');
  if (!url) { msg.textContent = '⚠ Não consegui detectar set/número automaticamente. Cole a URL manualmente.'; msg.style.display = 'block'; msg.style.color = 'var(--red)'; return; }
  document.getElementById('img-url-input').value = url;
  previewImage();
  msg.textContent = '✓ URL gerada automaticamente — verifique se a imagem carregou corretamente.';
  msg.style.display = 'block';
  msg.style.color = 'var(--green)';
}

function saveImage() {
  if (imgModalIndex < 0) return;
  const url = document.getElementById('img-url-input').value.trim();
  if (url) watchlist[imgModalIndex].imageUrl = url;
  else delete watchlist[imgModalIndex].imageUrl;
  persistWatchlist();
  closeImageModal();
  renderWatch();
}

// imageModal listener moved to end

// ── Collapsible sections ─────────────────────────
function toggleSection(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector('[data-toggle-icon]');
  const open = body.style.display === 'none';
  body.style.display = open ? 'block' : 'none';
  if (icon) icon.textContent = open ? '▼' : '▶';
}

// ── Edit colNotes (legacy) ────────────────────────
let colNotesEditIndex = -1;

function openColNotesEdit(i) {
  colNotesEditIndex = i;
  document.getElementById('col-notes-edit-ta').value = watchlist[i].colNotes || '';
  document.getElementById('colNotesEditModal').classList.add('open');
}

function closeColNotesEdit() {
  document.getElementById('colNotesEditModal').classList.remove('open');
  colNotesEditIndex = -1;
}

function saveColNotesEdit() {
  if (colNotesEditIndex < 0) return;
  const val = document.getElementById('col-notes-edit-ta').value.trim();
  if (val) watchlist[colNotesEditIndex].colNotes = val;
  else delete watchlist[colNotesEditIndex].colNotes;
  persistWatchlist();
  closeColNotesEdit();
  renderWatch();
}

document.getElementById('colNotesEditModal').addEventListener('click', function(e) {
  if (e.target === this) closeColNotesEdit();
});

let historyIndex = -1;

function openHistory(i) {
  historyIndex = i;
  const item = watchlist[i];
  document.getElementById('history-carta-name').textContent = item.name;
  const hist = item.history || [];

  if (!hist.length) {
    document.getElementById('history-content').innerHTML =
      '<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;">Nenhum histórico ainda.<br>Salve uma análise completa para começar.</div>';
  } else {
    // Show newest first
    const rows = [...hist].reverse().map((h, idx) => {
      const isLatest = idx === 0;
      const recCls = h.rec === 'COMPRAR' ? 'rec-comprar' : h.rec === 'AGUARDAR' ? 'rec-aguardar' : 'rec-evitar';
      const sc = h.score !== null && h.score !== undefined ? h.score.toFixed(1) : '—';
      return `
        <div style="border:1px solid ${isLatest ? 'rgba(247,201,72,.3)' : 'var(--border)'};border-radius:5px;padding:14px;margin-bottom:8px;background:${isLatest ? 'rgba(247,201,72,.04)' : 'var(--bg)'};">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted);">${h.date}${isLatest ? ' <span style="color:var(--accent);font-size:9px;margin-left:6px;">● MAIS RECENTE</span>' : ''}</span>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;" class="${recCls}">${h.rec || '—'}</span>
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end;">
            <div>
              <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">Score</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:${scoreColor(h.score)};line-height:1;">${sc}</div>
            </div>
            <div>
              <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">💵 USD</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);line-height:1;">$${h.priceUsd || '—'}</div>
            </div>
            <div>
              <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">🇧🇷 BRL</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--text);line-height:1;">R$${h.priceBrl || '—'}</div>
            </div>
            ${hist.length > 1 && !isLatest ? (() => {
              const latest = hist[hist.length - 1];
              const diffUsd = latest.priceUsd && h.priceUsd
                ? ((parseFloat(latest.priceUsd) - parseFloat(h.priceUsd)) / parseFloat(h.priceUsd) * 100).toFixed(1)
                : null;
              return diffUsd !== null
                ? `<div style="margin-left:auto;text-align:right;">
                    <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">Variação USD</div>
                    <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${parseFloat(diffUsd) >= 0 ? 'var(--green)' : 'var(--red)'};line-height:1;">${parseFloat(diffUsd) >= 0 ? '+' : ''}${diffUsd}%</div>
                  </div>`
                : '';
            })() : ''}
          </div>
          ${h.colNotes ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:11px;color:#9090a8;"><span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--accent3);letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:3px;">📊 Collectrics</span>${h.colNotes.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>` : ''}
          ${renderStructuredAnalysis(h)}
          ${renderInsights(h)}
        </div>`;
    }).join('');
    document.getElementById('history-content').innerHTML = rows;
  }
  document.getElementById('historyModal').classList.add('open');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('open');
  historyIndex = -1;
}
// historyModal listener moved to end

// Overlay click-to-close (registered after modal elements exist)
document.getElementById('imageModal').addEventListener('click', function(e) {
  if (e.target === this) closeImageModal();
});
document.getElementById('historyModal').addEventListener('click', function(e) {
  if (e.target === this) closeHistory();
});
document.getElementById('driveSetupModal').addEventListener('click', function(e) {
  if (e.target === this) closeDriveSetup();
});
document.getElementById('watchExceptionModal').addEventListener('click', function(e) {
  if (e.target === this) closeWatchException();
});
