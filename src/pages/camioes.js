/* camioes.js — Página Camiões Cisterna
 * Dados de viaturas.csv (se existir em public/csv/), memória do browser ou upload.
 * Formato: matricula;c1;c2;c3;c4;c5 — células com "*" ou vazias contam 0 (mostradas "-") */

import { carregarDadosCSV, linhaSemDados } from '../modules/csv.js';
import { esc, formatarCelulaVazia } from '../modules/format.js';

let camioesData = [];

const $ = (id) => document.getElementById(id);

function parseCSV(csvText) {
  camioesData = [];
  const lines = csvText.replace(/\|/g, '.').split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();
    if (line === '') continue;

    const cols = line.split(';').map((c) => c.trim());
    const mat = cols[0];

    // Ignorar cabeçalho (primeira linha com "matricula")
    if (mat.toLowerCase() === 'matricula') continue;

    const valor = (c) => {
      if (!c || c === '*') return 0;
      return parseFloat(c.replace(',', '.')) || 0;
    };

    camioesData.push({
      mat,
      c1: valor(cols[1]),
      c2: valor(cols[2]),
      c3: valor(cols[3]),
      c4: valor(cols[4]),
      c5: valor(cols[5]),
    });
  }

  renderTabela(document.getElementById('searchInput')?.value.toLowerCase() || '');
}

function renderTabela(filtro = '') {
  const tbody = $('camioesTable');
  const filtered = camioesData.filter((c) => c.mat.toLowerCase().includes(filtro));

  if (filtered.length === 0) {
    tbody.innerHTML = linhaSemDados(7, 'Nenhum camião encontrado.');
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const total = c.c1 + c.c2 + c.c3 + c.c4 + c.c5;
      return `
        <tr>
          <td><span class="matricula">${esc(c.mat)}</span></td>
          <td>${formatarCelulaVazia(c.c1)}</td>
          <td>${formatarCelulaVazia(c.c2)}</td>
          <td>${formatarCelulaVazia(c.c3)}</td>
          <td>${formatarCelulaVazia(c.c4)}</td>
          <td>${formatarCelulaVazia(c.c5)}</td>
          <td class="total-cap">${total.toLocaleString('pt-PT')}</td>
        </tr>`;
    })
    .join('');
}

$('searchInput').addEventListener('input', (e) => renderTabela(e.target.value.toLowerCase()));

carregarDadosCSV({
  ficheiro: 'viaturas.csv',
  chaveMemoria: 'lactogal_camioes_data',
  parse: parseCSV,
  posCarregado: () => {
    const statusEl = $('fileStatus');
    if (statusEl) {
      statusEl.textContent = `Dados carregados! ${camioesData.length} viaturas disponíveis.`;
      statusEl.classList.add('is-ok');
    }
  },
});
