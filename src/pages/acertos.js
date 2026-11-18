/* acertos.js — Página Acertos de Produção
 * 1. Standardização (Leite); 2. Acerto (Natas); 3. Lista de Ingredientes SAP
 * (tabela 3 carregada de acertos.csv: codigo;produto;fator;quantidade_base) */

import { carregarDadosCSV, linhaSemDados, numeroCSV } from '../modules/csv.js';
import { guardarDados, lerDados } from '../modules/storage.js';
import { esc, imprimirFrame, preencherCampo, valorNumerico } from '../modules/format.js';

const $ = (id) => document.getElementById(id);

/* Botões 🖨️ Imprimir dos cartões */
document.querySelectorAll('[data-imprimir]').forEach((btn) =>
  btn.addEventListener('click', () => imprimirFrame(btn.dataset.imprimir))
);

function calcularAcertos() {
  const campoVazio = (id) => $(id).value.trim() === '';

  // 1. STANDARDIZAÇÃO (LEITE) — só calcula quando o utilizador introduz valores
  const stdVazio = ['std-lote', 'std-e1-qtd', 'std-e1-fat', 'std-e-qtd', 'std-e-fat', 'std-mng-fat'].every(campoVazio);
  if (stdVazio) {
    $('std-mng-qtd').innerText = '';
    $('std-final-qtd').innerText = '';
    $('std-final-fat').innerText = '';
  } else {
    const stdLote = valorNumerico('std-lote');
    const stdE1Qtd = valorNumerico('std-e1-qtd');
    const stdE1Fat = valorNumerico('std-e1-fat');
    const stdEQtd = valorNumerico('std-e-qtd');
    const stdEFat = valorNumerico('std-e-fat');
    const stdMngFat = valorNumerico('std-mng-fat');

    const stdMngQtd = stdLote - (stdE1Qtd + stdEQtd);
    $('std-mng-qtd').innerText = stdMngQtd.toFixed(0);
    $('std-final-qtd').innerText = stdLote.toFixed(0);

    const stdMassaTotal = stdE1Qtd * stdE1Fat + stdEQtd * stdEFat + stdMngQtd * stdMngFat;
    $('std-final-fat').innerText = stdLote !== 0 ? (stdMassaTotal / stdLote).toFixed(2) : '#DIV/0!';
  }

  // 2. ACERTO (NATAS) — só calcula quando o utilizador introduz valores
  const acrVazio = ['acr-lote', 'acr-q2-qtd', 'acr-q2-fat', 'acr-q1-qtd', 'acr-q1-fat', 'acr-e-qtd', 'acr-e-fat', 'acr-mng-fat'].every(campoVazio);
  if (acrVazio) {
    $('acr-mng-qtd').innerText = '';
    $('acr-final-qtd').innerText = '';
    $('acr-final-fat').innerText = '';
  } else {
    const acrLote = valorNumerico('acr-lote');
    const acrQ2Qtd = valorNumerico('acr-q2-qtd');
    const acrQ2Fat = valorNumerico('acr-q2-fat');
    const acrQ1Qtd = valorNumerico('acr-q1-qtd');
    const acrQ1Fat = valorNumerico('acr-q1-fat');
    const acrEQtd = valorNumerico('acr-e-qtd');
    const acrEFat = valorNumerico('acr-e-fat');
    const acrMngFat = valorNumerico('acr-mng-fat');

    const acrMngQtd = acrLote - (acrQ2Qtd + acrQ1Qtd + acrEQtd);
    $('acr-mng-qtd').innerText = acrMngQtd.toFixed(0);
    $('acr-final-qtd').innerText = acrLote.toFixed(0);

    const acrMassaTotal =
      acrQ2Qtd * acrQ2Fat + acrQ1Qtd * acrQ1Fat + acrEQtd * acrEFat + acrMngQtd * acrMngFat;
    $('acr-final-fat').innerText = acrLote !== 0 ? (acrMassaTotal / acrLote).toFixed(2) : '#DIV/0!';
  }

  // 3. LISTA DE INGREDIENTES SAP
  const sapLoteInput = valorNumerico('sap-lote');

  document.querySelectorAll('.sap-qty').forEach((cell) => {
    const baseQty = parseFloat(cell.getAttribute('data-base-qty')) || 0;
    if (sapLoteInput > 0) {
      // Quantidades escaladas à quantidade de lote introduzida (referência: 60000)
      const newQty = baseQty * (sapLoteInput / 60000);
      cell.innerText = newQty % 1 === 0 ? newQty.toFixed(0) : newQty.toFixed(2);
    } else {
      // Sem quantidade introduzida → mostra as quantidades base do CSV
      cell.innerText = cell.getAttribute('data-base-qty') || '';
    }
  });

  if (sapLoteInput > 0 && sapLoteInput < 60001) {
    const taxaConversao = (sapLoteInput * 10) / 10000 + 40;
    $('sap-taxa').innerText = taxaConversao.toFixed(2);
  } else {
    $('sap-taxa').innerText = '';
  }
}

/* --- Tabela "LISTA DE INGREDIENTES (SAP)" --------------------------------
 * Começa vazia (sem valores por defeito); é preenchida pelo acertos.csv */
let ingredientesSAP = [];

function renderTabelaSAP() {
  const tbody = $('table-sap');
  if (ingredientesSAP.length === 0) {
    tbody.innerHTML = linhaSemDados(
      4,
      'Sem dados. Carregue o ficheiro acertos.csv para ver a lista de ingredientes.'
    );
    return;
  }
  tbody.innerHTML = ingredientesSAP
    .map(
      (item) => `
      <tr>
        <td>${esc(item.codigo)}</td>
        <td>${esc(item.produto)}</td>
        <td>${esc(item.fator)}</td>
        <td><span class="locked-cell sap-qty" data-base-qty="${item.base}">${item.base}</span></td>
      </tr>`
    )
    .join('');
}

function parseCSV(csvText) {
  const linhas = [];
  for (let linha of csvText.split(/\r?\n/)) {
    linha = linha.trim();
    if (linha === '') continue;
    const cols = linha.split(';').map((c) => c.trim());
    if (cols[0].toLowerCase() === 'codigo') continue; // cabeçalho
    if (cols[0] === '') continue;
    linhas.push({
      codigo: cols[0],
      produto: cols[1] || '',
      fator: cols[2] || '-',
      base: numeroCSV(cols[3]),
    });
  }
  if (linhas.length > 0) {
    ingredientesSAP = linhas;
    renderTabelaSAP();
    calcularAcertos();
  }
}

function salvarDados() {
  guardarDados('lactogal_acertos', {
    stdLote: $('std-lote').value,
    stdE1Qtd: $('std-e1-qtd').value,
    stdE1Fat: $('std-e1-fat').value,
    stdEQtd: $('std-e-qtd').value,
    stdEFat: $('std-e-fat').value,
    stdMngFat: $('std-mng-fat').value,

    acrLote: $('acr-lote').value,
    acrQ2Qtd: $('acr-q2-qtd').value,
    acrQ2Fat: $('acr-q2-fat').value,
    acrQ1Qtd: $('acr-q1-qtd').value,
    acrQ1Fat: $('acr-q1-fat').value,
    acrEQtd: $('acr-e-qtd').value,
    acrEFat: $('acr-e-fat').value,
    acrMngFat: $('acr-mng-fat').value,

    sapLote: $('sap-lote').value,
  });
}

function carregarDados() {
  const dados = lerDados('lactogal_acertos');
  const mapeamento = {
    'std-lote': dados.stdLote,
    'std-e1-qtd': dados.stdE1Qtd,
    'std-e1-fat': dados.stdE1Fat,
    'std-e-qtd': dados.stdEQtd,
    'std-e-fat': dados.stdEFat,
    'std-mng-fat': dados.stdMngFat,
    'acr-lote': dados.acrLote,
    'acr-q2-qtd': dados.acrQ2Qtd,
    'acr-q2-fat': dados.acrQ2Fat,
    'acr-q1-qtd': dados.acrQ1Qtd,
    'acr-q1-fat': dados.acrQ1Fat,
    'acr-e-qtd': dados.acrEQtd,
    'acr-e-fat': dados.acrEFat,
    'acr-mng-fat': dados.acrMngFat,
    'sap-lote': dados.sapLote,
  };
  for (const [id, valor] of Object.entries(mapeamento)) preencherCampo(id, valor, '');

  renderTabelaSAP(); // mostra os dados do CSV ou o estado "Sem dados"
  calcularAcertos();
}

/* Todos os campos de entrada recalculam e guardam */
document
  .querySelectorAll('#main-content input[type="number"], main input[type="number"]')
  .forEach((input) =>
    input.addEventListener('input', () => {
      calcularAcertos();
      salvarDados();
    })
  );

carregarDados();

carregarDadosCSV({
  ficheiro: 'acertos.csv',
  chaveMemoria: 'lactogal_acertos_data',
  parse: parseCSV,
});
