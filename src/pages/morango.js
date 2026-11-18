/* morango.js — Página Lote Morango
 * Tabela "Quantidades do Lote" carregada de morango.csv
 * (formato: tipo;nome;quantidade_base — base/ing/total) */

import { carregarDadosCSV, numeroCSV } from '../modules/csv.js';
import { guardarDados, lerDados } from '../modules/storage.js';
import { esc, preencherCampo, valorNumerico } from '../modules/format.js';

const $ = (id) => document.getElementById(id);

// Sem valores por defeito: a tabela só mostra valores depois de carregar o CSV
let baseContentor = 0;
let linhasTabela = [];

function calcularLote() {
  const tbody = $('morangoTable');
  if (linhasTabela.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="2" style="text-align:center; color:var(--text-muted); padding:20px;">Sem dados. Carregue o ficheiro morango.csv para ver as quantidades.</td></tr>';
    return;
  }
  const contentor = valorNumerico('contentorInput');
  // Sem quantidade introduzida → mostra as quantidades base do CSV
  const fator = contentor > 0 ? contentor / baseContentor : 1;

  tbody.innerHTML = linhasTabela
    .map((linha) => {
      const calcQty = linha.base * fator;
      // Quantidades inferiores a 1 → 4 casas decimais; restantes → 3 (como no Excel original)
      const casas = Math.abs(linha.base) < 1 ? 4 : 3;
      const classe = linha.tipo === 'total' ? ' class="total-row"' : '';
      return `<tr${classe}>
        <td>${esc(linha.nome)}</td>
        <td>${calcQty.toFixed(casas)}</td>
      </tr>`;
    })
    .join('');
}

/* --- Parsing do CSV -------------------------------------------------------- */
function parseCSV(csvText) {
  const novasLinhas = [];
  for (let linha of csvText.split(/\r?\n/)) {
    linha = linha.trim();
    if (linha === '') continue;
    const cols = linha.split(';').map((c) => c.trim());
    if (cols[0].toLowerCase() === 'tipo') continue; // cabeçalho
    const tipo = (cols[0] || '').toLowerCase();
    if (tipo === 'base') {
      baseContentor = numeroCSV(cols[2], baseContentor);
    } else if (tipo === 'ing' || tipo === 'total') {
      novasLinhas.push({ nome: cols[1] || '', base: numeroCSV(cols[2]), tipo });
    }
  }
  if (novasLinhas.length > 0) linhasTabela = novasLinhas;
  carregarDados();
}

function salvarDados() {
  guardarDados('lactogal_morango', {
    contentor: $('contentorInput').value,
  });
}

function carregarDados() {
  const dados = lerDados('lactogal_morango');
  preencherCampo('contentorInput', dados.contentor, baseContentor > 0 ? baseContentor : '');
  calcularLote();
}

$('contentorInput').addEventListener('input', () => {
  calcularLote();
  salvarDados();
});

carregarDados();

carregarDadosCSV({
  ficheiro: 'morango.csv',
  chaveMemoria: 'lactogal_morango_data',
  parse: parseCSV,
});
