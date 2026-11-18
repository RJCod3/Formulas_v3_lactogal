/* densidades.js — Página Tabela de Densidades
 * Dados de densidades.csv (se existir em public/csv/), memória do browser ou upload.
 * Formato: codigo;descricao;densidade — G% m/m = Gerber / densidade */

import { carregarDadosCSV, linhaSemDados } from '../modules/csv.js';
import { esc } from '../modules/format.js';

let dadosDensidades = []; // [codigo, descricao, densidade]

const $ = (id) => document.getElementById(id);

function parseCSV(csvText) {
  dadosDensidades = [];
  const lines = csvText.replace(/\|/g, '.').split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();
    if (line === '') continue;

    const cols = line.split(';').map((c) => c.trim());

    // Ignorar cabeçalho (primeira linha com "codigo")
    if (cols[0].toLowerCase() === 'codigo') continue;

    dadosDensidades.push([cols[0], cols[1], cols[2]]);
  }

  renderTabela(document.getElementById('searchInput')?.value.toLowerCase() || '');
}

function renderTabela(filtro = '') {
  const tbody = $('densidadesTable');
  const filtered = dadosDensidades.filter(
    (row) => row[0].toLowerCase().includes(filtro) || row[1].toLowerCase().includes(filtro)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = linhaSemDados(4, 'Nenhum resultado encontrado.');
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (row) => `
      <tr>
        <td><span class="code-badge">${esc(row[0])}</span></td>
        <td>${esc(row[1])}</td>
        <td>${esc(row[2])}</td>
        <td class="g-mass-cell calc-cell" data-densidade="${esc(row[2])}"></td>
      </tr>`
    )
    .join('');

  atualizarGordura();
}

function atualizarGordura() {
  const gerber = parseFloat($('gerberInput').value) || 0;
  document.querySelectorAll('.g-mass-cell').forEach((cell) => {
    const densidade = parseFloat(cell.dataset.densidade);
    cell.textContent = densidade > 0 ? (gerber / densidade).toFixed(2) : '-';
  });
}

$('searchInput').addEventListener('input', (e) => renderTabela(e.target.value.toLowerCase()));
$('gerberInput').addEventListener('input', atualizarGordura);

carregarDadosCSV({
  ficheiro: 'densidades.csv',
  chaveMemoria: 'lactogal_densidades_data',
  parse: parseCSV,
  posCarregado: () => {
    const statusEl = $('fileStatus');
    if (statusEl) {
      statusEl.textContent = `Dados carregados! ${dadosDensidades.length} produtos disponíveis.`;
      statusEl.classList.add('is-ok');
    }
  },
});
