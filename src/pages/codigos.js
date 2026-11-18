/* codigos.js — Página Códigos SAP (Bases)
 * Dados de codigos.csv (se existir em public/csv/), memória do browser ou upload.
 * Formato: codigo;nome;cod_base1;nome_base1;cod_base2;nome_base2;... */

import { carregarDadosCSV, linhaSemDados } from '../modules/csv.js';
import { esc } from '../modules/format.js';

let codigosData = []; // { code, name, bases: [{c, n}] }

const $ = (id) => document.getElementById(id);

/* --- Parsing do CSV ------------------------------------------------------- */
function parseCSV(csvText) {
  codigosData = [];
  const lines = csvText.replace(/\|/g, '.').split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();
    if (line === '') continue;

    const cols = line.split(';').map((c) => c.trim());

    // Ignorar cabeçalho (primeira linha com "codigo")
    if (cols[0].toLowerCase() === 'codigo') continue;

    const product = { code: cols[0], name: cols[1] || '', bases: [] };

    // As restantes colunas vêm em pares: código da base, nome da base
    for (let i = 2; i + 1 < cols.length; i += 2) {
      if (cols[i] !== '') {
        product.bases.push({ c: cols[i], n: cols[i + 1] || '' });
      }
    }

    codigosData.push(product);
  }

  renderList(document.getElementById('searchInput')?.value.toLowerCase() || '');
}

/* --- Renderização ---------------------------------------------------------- */
function renderList(filtro = '') {
  const list = $('productList');
  const filtered = codigosData.filter(
    (p) => p.code.toLowerCase().includes(filtro) || p.name.toLowerCase().includes(filtro)
  );

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum produto encontrado.</div>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (product) => `
      <div class="list-item" data-cod="${esc(product.code)}">
        <div class="item-code">${esc(product.code)}</div>
        <div class="item-name">${esc(product.name)}</div>
      </div>`
    )
    .join('');
}

function selectProduct(itemEl, code) {
  document.querySelectorAll('.list-item').forEach((el) => el.classList.remove('active'));
  itemEl.classList.add('active');

  const product = codigosData.find((p) => p.code === code);
  if (!product) return;

  const detailCard = $('detailCard');

  let tableHTML;
  if (product.bases.length > 0) {
    tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">Código Base</th>
            <th>Designação da Base</th>
          </tr>
        </thead>
        <tbody>
          ${product.bases
            .map(
              (base) => `
              <tr>
                <td><span class="code-badge">${esc(base.c)}</span></td>
                <td>${esc(base.n)}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>`;
  } else {
    tableHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Este produto não consome bases de leite/nata.</div>`;
  }

  detailCard.innerHTML = `
    <div class="detail-header">
      <span class="badge">Cód: ${esc(product.code)}</span>
      <h2>${esc(product.name)}</h2>
    </div>
    <div class="detail-title">Bases Leite / Nata Consumidas</div>
    ${tableHTML}
  `;
}

/* --- Eventos --------------------------------------------------------------- */
$('searchInput').addEventListener('input', (e) => renderList(e.target.value.toLowerCase()));

$('productList').addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (item) selectProduct(item, item.dataset.cod);
});

/* --- Carregamento do CSV --------------------------------------------------- */
carregarDadosCSV({
  ficheiro: 'codigos.csv',
  chaveMemoria: 'lactogal_codigos_data',
  parse: parseCSV,
  posCarregado: () => {
    const statusEl = $('fileStatus');
    if (statusEl) {
      statusEl.textContent = `Dados carregados! ${codigosData.length} produtos disponíveis.`;
      statusEl.classList.add('is-ok');
    }
  },
});
