/* c1-3.js — Página Lote C1-3 Anos (Tabela de Padronização)
 * A grelha é construída a partir de c1-3.csv (fetch → memória → upload).
 * Formato: linha;b;c;d;e;f;g;h;i;j;k;l
 *   1.ª linha  = Gord. Pret.  (B = input, C..L = gorduras)
 *   2.ª linha  = Quantidade   (B = lote de referência, C..L = proteína alvo)
 *   linhas com 10 valores (C..L) = Leite e Agua, pela ordem
 *   linhas com um único valor na coluna G = pós (Maltodextrina, Oleo, ...) */

import { carregarDadosCSV, linhaSemDados, numeroCSV } from '../modules/csv.js';
import { guardarDados, lerDados } from '../modules/storage.js';
import { esc, preencherCampo, valorNumerico } from '../modules/format.js';

const $ = (id) => document.getElementById(id);

// Sem valores por defeito: a grelha só é construída depois de carregar o CSV
let linhaGordura = null;
let linhaQuantidade = null;
let linhaLeite = null;
let linhaAgua = null;
let linhasPos = [];

const cols = ['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
let offsets = [];

/* Atualiza C2 a L2 (Gordura) quando B2 muda */
function updateB2() {
  if (!linhaGordura) return;
  const b2 = valorNumerico('b2');
  for (let i = 0; i < 10; i++) {
    $(cols[i] + '2').innerText = (b2 + offsets[i]).toFixed(2);
  }
}

/* Atualiza C4 a L5 (Leite e Agua) e a coluna G dos pós quando B3 muda */
function updateB3() {
  if (!linhaQuantidade) return;
  const b3 = valorNumerico('b3');
  const scale = b3 / linhaQuantidade.b;
  for (let i = 0; i < 10; i++) {
    const leite = linhaLeite.valores[i];
    const agua = linhaAgua.valores[i];
    $(cols[i] + '4').innerText = leite !== null ? (leite * scale).toFixed(3) : '';
    $(cols[i] + '5').innerText = agua !== null ? (agua * scale).toFixed(3) : '';
  }
  linhasPos.forEach((pos, p) => {
    const celula = $('g' + (6 + p));
    if (celula) celula.innerText = (pos.base * scale).toFixed(3);
  });
}

/* --- Renderização da tabela ------------------------------------------------ */
function renderTabela() {
  const tbody = $('padronizacaoBody');
  if (!linhaGordura || !linhaQuantidade || !linhaLeite || !linhaAgua) {
    tbody.innerHTML = linhaSemDados(
      13,
      'Sem dados. Carregue o ficheiro c1-3.csv para ver a grelha.'
    );
    return;
  }

  const celulasCalc = (linha, numeroLinha, casas) =>
    linha.valores
      .map(
        (v, i) =>
          `<td class="calc-cell" id="${cols[i]}${numeroLinha}">${v !== null ? v.toFixed(casas) : ''}</td>`
      )
      .join('');

  let html = `
    <tr>
      <td class="row-label">${esc(linhaGordura.nome)}</td>
      <td class="input-cell"><input type="number" id="b2" value="${linhaGordura.b}" step="0.01"></td>
      ${celulasCalc(linhaGordura, 2, 2)}
      <td class="col-label">Gordura</td>
    </tr>
    <tr>
      <td class="row-label">${esc(linhaQuantidade.nome)}</td>
      <td class="input-cell"><input type="number" id="b3" value="${linhaQuantidade.b}" step="0.001"></td>
      ${celulasCalc(linhaQuantidade, 3, 2)}
      <td class="col-label">Proteina</td>
    </tr>
    <tr>
      <td class="row-label">${esc(linhaLeite.nome)}</td>
      <td></td>
      ${celulasCalc(linhaLeite, 4, 3)}
      <td></td>
    </tr>
    <tr>
      <td class="row-label">${esc(linhaAgua.nome)}</td>
      <td></td>
      ${celulasCalc(linhaAgua, 5, 3)}
      <td></td>
    </tr>`;

  linhasPos.forEach((pos, p) => {
    html += `
      <tr>
        <td class="row-label">${esc(pos.nome)}</td>
        <td></td>
        <td colspan="4"></td>
        <td class="calc-cell highlight-g" id="g${6 + p}">${pos.base}</td>
        <td colspan="5"></td>
        <td></td>
      </tr>`;
  });

  tbody.innerHTML = html;
}

/* --- Parsing do CSV -------------------------------------------------------- */
function parseCSV(csvText) {
  const linhas = [];
  for (let linha of csvText.split(/\r?\n/)) {
    linha = linha.trim();
    if (linha === '') continue;
    const colunas = linha.split(';').map((c) => c.trim());
    if (colunas[0].toLowerCase() === 'linha') continue; // cabeçalho
    linhas.push(colunas);
  }
  if (linhas.length < 4) return; // formato inesperado — mantém o estado atual

  const lerValores = (colunas) => colunas.slice(2, 12).map((v) => (v === '' ? null : numeroCSV(v, null)));

  const leiteAgua = [];
  const novosPos = [];
  for (let i = 2; i < linhas.length; i++) {
    const nome = linhas[i][0] || '';
    if (!nome) continue;
    const valores = lerValores(linhas[i]);
    const preenchidos = valores.filter((v) => v !== null);
    if (preenchidos.length === 10) {
      leiteAgua.push({ nome, valores });
    } else if (preenchidos.length === 1) {
      // Pós (Maltodextrina, Oleo, ...): um único valor na coluna G do CSV.
      // (A V2.1 procurava o valor na coluna H — valores[5] — e perdia estas
      //  linhas quando o CSV estava carregado; bug corrigido aqui.)
      novosPos.push({ nome, base: preenchidos[0] });
    }
  }

  linhaGordura = { nome: linhas[0][0], b: numeroCSV(linhas[0][1], 0), valores: lerValores(linhas[0]) };
  linhaQuantidade = { nome: linhas[1][0], b: numeroCSV(linhas[1][1], 0), valores: lerValores(linhas[1]) };
  if (leiteAgua.length > 0) linhaLeite = leiteAgua[0];
  if (leiteAgua.length > 1) linhaAgua = leiteAgua[1];
  if (novosPos.length > 0) linhasPos = novosPos;
  offsets = linhaGordura.valores.map((v, i) =>
    v !== null ? v - linhaGordura.b : offsets[i] !== undefined ? offsets[i] : 0
  );

  renderTabela();
  carregarDados();
}

function salvarDados() {
  guardarDados('lactogal_c13_table', {
    b2: $('b2')?.value ?? '',
    b3: $('b3')?.value ?? '',
  });
}

function carregarDados() {
  if (!linhaGordura || !linhaQuantidade) return; // Sem CSV → sem valores
  const dados = lerDados('lactogal_c13_table');
  preencherCampo('b2', dados.b2, linhaGordura.b);
  preencherCampo('b3', dados.b3, linhaQuantidade.b);
  updateB2();
  updateB3();
}

/* Os inputs b2/b3 são criados dinamicamente — usa delegação de eventos */
$('padronizacaoBody').addEventListener('input', (e) => {
  if (e.target.id === 'b2') {
    updateB2();
    salvarDados();
  } else if (e.target.id === 'b3') {
    updateB3();
    salvarDados();
  }
});

renderTabela();
carregarDados();

carregarDadosCSV({
  ficheiro: 'c1-3.csv',
  chaveMemoria: 'lactogal_c13_data',
  parse: parseCSV,
});
