/* ============================================================================
 * proteina.js — Motor comum das 7 páginas Proteína (Enzimas, Cacau, Morango,
 * Café, Caramelo, Pistacio, Baunilha 250cc)
 *
 * Na versão antiga existiam 7 ficheiros JS idênticos (prot_*.js) que só
 * diferiam no nome do CSV. Agora existe UMA cópia desta lógica; cada página
 * HTML indica o seu CSV com <body data-receita="prot_enzimas"> (etc.).
 *
 * Dados: csv/<receita>.csv — formato modo;tipo;nome;quantidade_base
 *   modo  = leite (Cálculo por Leite Recebido) | lote (Cálculo por Lote Final)
 *   tipo  = base (linha destacada, referência de escala) | ing | total | meta
 * Sem CSV não há valores por defeito — a página mostra o estado "Sem dados".
 * ========================================================================== */

import { carregarDadosCSV, linhaSemDados, numeroCSV } from '../modules/csv.js';
import { guardarDados, lerDados } from '../modules/storage.js';
import { esc, formatarQuantidade } from '../modules/format.js';

const TITULOS_MODO = {
  leite: 'Cálculo por Leite Recebido',
  lote: 'Cálculo por Lote Final',
};

const receita = document.body.dataset.receita; // ex.: "prot_enzimas"
const CHAVE_ESTADO = `lactogal_${receita}`;
const CHAVE_CSV = `${CHAVE_ESTADO}_data`;

let receitas = {};
let currentMode = lerDados(CHAVE_ESTADO).currentMode || 'leite';

const $ = (id) => document.getElementById(id);

function salvarDados() {
  const dados = lerDados(CHAVE_ESTADO);
  dados.currentMode = currentMode;
  dados[currentMode] = $('mainInput').value;
  guardarDados(CHAVE_ESTADO, dados);
}

function mostrarSemDados(mode) {
  $('form-title').innerText = TITULOS_MODO[mode] || mode;
  $('input-label').innerText = 'Sem dados — carregue o ficheiro CSV para ver os valores';
  $('mainInput').value = '';
  $('resultTable').innerHTML = linhaSemDados(
    2,
    'Sem dados. Carregue o ficheiro CSV para ver os valores.'
  );
  $('metaInfo').innerText = '';
}

function switchMode(mode) {
  currentMode = mode;

  $('btn-leite').classList.toggle('active', mode === 'leite');
  $('btn-lote').classList.toggle('active', mode === 'lote');
  if (!receitas[mode]) {
    mostrarSemDados(mode);
    return;
  }

  $('form-title').innerText = receitas[mode].title;
  $('input-label').innerText = receitas[mode].label;

  // Se houver valor guardado para este modo, usa-o. Senão, usa o valor base do CSV.
  const guardado = lerDados(CHAVE_ESTADO);
  $('mainInput').value = guardado[mode] !== undefined ? guardado[mode] : receitas[mode].base;

  calcular();
}

function calcular() {
  if (!receitas[currentMode]) return;

  const inputValue = parseFloat($('mainInput').value) || 0;
  const receitaModo = receitas[currentMode];
  const fator = inputValue / receitaModo.base;

  const tbody = $('resultTable');
  tbody.innerHTML = receitaModo.items
    .map((item) => {
      const calcQty = item.qty * fator;
      const classe = item.isTotal ? 'total-row' : item.highlight ? 'highlight-row' : '';
      return `<tr class="${classe}">
        <td>${esc(item.name)}</td>
        <td>${formatarQuantidade(calcQty)}</td>
      </tr>`;
    })
    .join('');

  $('metaInfo').innerText = receitaModo.meta;

  salvarDados();
}

/* --- Parsing do CSV ------------------------------------------------------ */
function parseCSV(csvText) {
  const novasReceitas = {};
  for (let linha of csvText.split(/\r?\n/)) {
    linha = linha.trim();
    if (linha === '') continue;
    const cols = linha.split(';').map((c) => c.trim());
    if (cols[0].toLowerCase() === 'modo') continue; // cabeçalho
    const modo = (cols[0] || '').toLowerCase();
    if (!modo) continue;
    const tipo = (cols[1] || '').toLowerCase();
    const nome = cols[2] || '';
    if (!novasReceitas[modo]) {
      novasReceitas[modo] = {
        title: TITULOS_MODO[modo] || modo,
        label: '',
        meta: '',
        base: 0,
        items: [],
      };
    }
    if (tipo === 'meta') {
      novasReceitas[modo].meta = nome;
    } else if (tipo === 'base') {
      novasReceitas[modo].base = numeroCSV(cols[3]);
      novasReceitas[modo].label = nome;
      novasReceitas[modo].items.push({
        name: nome,
        qty: novasReceitas[modo].base,
        highlight: true,
      });
    } else if (tipo === 'total') {
      novasReceitas[modo].items.push({ name: nome, qty: numeroCSV(cols[3]), isTotal: true });
    } else if (tipo === 'ing') {
      novasReceitas[modo].items.push({ name: nome, qty: numeroCSV(cols[3]) });
    }
  }
  // Só substitui os modos que vieram no CSV; os restantes ficam sem dados
  for (const modo in novasReceitas) {
    if (novasReceitas[modo].items.length > 0) receitas[modo] = novasReceitas[modo];
  }
  switchMode(currentMode);
}

/* --- Ligação aos elementos da página ------------------------------------- */
$('btn-leite').addEventListener('click', () => switchMode('leite'));
$('btn-lote').addEventListener('click', () => switchMode('lote'));
$('mainInput').addEventListener('input', calcular);

switchMode(currentMode);

carregarDadosCSV({
  ficheiro: `${receita}.csv`,
  chaveMemoria: CHAVE_CSV,
  parse: parseCSV,
});
