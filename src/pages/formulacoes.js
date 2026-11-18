/* formulacoes.js — Página Gestão de Fórmulas
 * Os produtos vêm de formulas.csv (cópio de formulas1.csv; substitua pela sua
 * exportação atualizada). Estrutura do CSV (separador ;):
 *   linha 1: vazia/preenchimento
 *   linha 2: códigos dos produtos (colunas)
 *   linha 3: quantidade base de cada produto
 *   linha 4: nome de cada produto
 *   linhas 5+: nome do ingrediente + quantidades por produto */

import { esc } from '../modules/format.js';

let formulas = {}; // { codigo: { name, base, ing: [[nome, qtd], ...] } }

const $ = (id) => document.getElementById(id);

let produtoSelecionado = null; // Código do produto escolhido
let comboItemAtivo = -1;       // Índice do item realçado com as setas

/* --- Parsing do CSV -------------------------------------------------------- */
function parseCSV(csvText) {
  formulas = {};
  const cleanText = csvText.replace(/\|/g, '.');
  const lines = cleanText.split(/\r?\n/);

  const headerLine = lines[1].split(';');
  const baseLine = lines[2].split(';');
  const nameLine = lines[3].split(';');

  for (let i = 1; i < headerLine.length; i++) {
    const code = headerLine[i].trim();
    if (code !== '') {
      formulas[code] = {
        name: nameLine[i] ? nameLine[i].trim() : code,
        base: parseFloat(baseLine[i] ? baseLine[i].replace(',', '.') : 0) || 0,
        ing: [],
      };
    }
  }

  for (let i = 4; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const ingName = cols[0].trim();
    if (ingName === '') continue;

    for (let j = 1; j < cols.length; j++) {
      const val = cols[j].trim();
      if (val !== '') {
        const code = headerLine[j].trim();
        if (formulas[code]) {
          const qty = parseFloat(val.replace(',', '.')) || 0;
          formulas[code].ing.push([ingName, qty]);
        }
      }
    }
  }

  // Ativar os campos
  const comboInput = $('produtoComboInput');
  comboInput.disabled = false;
  comboInput.placeholder = '-- Selecione um produto --';
  $('quantidadeInput').disabled = false;
  document.querySelector('.btn-calcular').disabled = false;

  produtoSelecionado = null;
  renderComboLista('');
}

/* --- Combobox pesquisável do produto --------------------------------------- */
// Constrói a lista de produtos (filtrada por código OU nome)
function renderComboLista(filtro) {
  const lista = $('produtoComboList');
  const filtroLower = filtro.trim().toLowerCase();
  const sortedKeys = Object.keys(formulas).sort((a, b) =>
    formulas[a].name.localeCompare(formulas[b].name)
  );
  let html = '';
  let visiveis = 0;
  sortedKeys.forEach((key) => {
    const p = formulas[key];
    if (filtroLower && !key.toLowerCase().includes(filtroLower) && !p.name.toLowerCase().includes(filtroLower))
      return;
    html += `<div class="combo-item${key === produtoSelecionado ? ' selected' : ''}" data-cod="${esc(key)}">
              <span class="item-name">${esc(p.name)}</span><span class="item-code">Cód: ${esc(key)}</span>
            </div>`;
    visiveis++;
  });
  if (visiveis === 0) html = '<div class="combo-item empty">Nenhum produto encontrado.</div>';
  lista.innerHTML = html;
  comboItemAtivo = visiveis > 0 ? 0 : -1;
  realcarItemAtivo();
}

function realcarItemAtivo() {
  const items = document.querySelectorAll('#produtoComboList .combo-item:not(.empty)');
  items.forEach((el, i) => el.classList.toggle('active', i === comboItemAtivo));
  if (items[comboItemAtivo]) items[comboItemAtivo].scrollIntoView({ block: 'nearest' });
}

function abrirCombo() {
  $('produtoComboList').classList.add('open');
}

function fecharCombo() {
  $('produtoComboList').classList.remove('open');
}

function selecionarProduto(cod) {
  produtoSelecionado = cod;
  const p = formulas[cod];
  $('produtoComboInput').value = `${p.name} (Cód: ${cod})`;
  $('quantidadeInput').value = p.base; // Pré-preencher com a quantidade base
  fecharCombo();
}

/* --- Eventos do combobox ----------------------------------------------------- */
const comboInput = $('produtoComboInput');

// Ao clicar no campo: abre a lista completa (texto selecionado para escrever de imediato)
comboInput.addEventListener('focus', function () {
  this.select();
  renderComboLista('');
  abrirCombo();
});

// Se já tinha o foco, o clique volta a abrir a lista (como um select nativo)
comboInput.addEventListener('click', function () {
  if (!$('produtoComboList').classList.contains('open')) {
    this.select();
    renderComboLista('');
    abrirCombo();
  }
});

// Ao escrever: filtra a lista em tempo real e limpa a seleção anterior
comboInput.addEventListener('input', function () {
  produtoSelecionado = null;
  renderComboLista(this.value);
  abrirCombo();
});

// Navegação por teclado: setas para realçar, Enter para escolher, Esc/Tab para fechar
comboInput.addEventListener('keydown', function (e) {
  const items = document.querySelectorAll('#produtoComboList .combo-item:not(.empty)');
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (items.length === 0) return;
    comboItemAtivo =
      e.key === 'ArrowDown'
        ? Math.min(comboItemAtivo + 1, items.length - 1)
        : Math.max(comboItemAtivo - 1, 0);
    realcarItemAtivo();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (items[comboItemAtivo]) items[comboItemAtivo].click();
  } else if (e.key === 'Escape' || e.key === 'Tab') {
    fecharCombo();
  }
});

// Fecha a lista ao clicar fora do combobox
document.addEventListener('click', (e) => {
  if (!e.target.closest('#produtoCombo')) fecharCombo();
});

// Escolha de produto na lista (delegação)
$('produtoComboList').addEventListener('click', (e) => {
  const item = e.target.closest('.combo-item[data-cod]');
  if (item) selecionarProduto(item.dataset.cod);
});

/* --- Calcular a formulação --------------------------------------------------- */
document.querySelector('.btn-calcular').addEventListener('click', () => {
  const cod = produtoSelecionado;
  const qtdDesejada = parseFloat($('quantidadeInput').value);

  if (!cod || !qtdDesejada || qtdDesejada <= 0) {
    alert('Por favor, selecione um produto e introduza uma quantidade válida.');
    return;
  }

  const produto = formulas[cod];
  const fator = qtdDesejada / produto.base;

  $('resultadoHeader').style.display = 'block';
  $('produtoBadge').innerText = `${produto.name} | Cód: ${cod} | Lote: ${qtdDesejada} kg`;

  $('tabelaResultados').innerHTML = `
    <table class="result-table compact">
      <thead>
        <tr><th>Ingrediente</th><th style="width: 30%; text-align: right;">Quantidade</th></tr>
      </thead>
      <tbody>
        ${produto.ing
          .map(([nome, qtdBase]) => {
            const qtdCalculada = qtdBase * fator;
            const qtdFormatada =
              qtdCalculada % 1 === 0 ? qtdCalculada.toFixed(0) : qtdCalculada.toFixed(3);
            return `<tr><td>${esc(nome)}</td><td class="qty" style="text-align: right;">${qtdFormatada}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>`;
});

/* --- Carregamento do CSV ------------------------------------------------------ */
carregarDadosCSVFormulas();

function carregarDadosCSVFormulas() {
  const statusEl = $('fileStatus');
  const definirEstado = (texto, tipo) => {
    statusEl.textContent = texto;
    statusEl.classList.remove('is-ok', 'is-warn');
    if (tipo) statusEl.classList.add(tipo);
  };

  const CHAVE_MEMORIA = 'lactogal_formulas_data';
  const semBOM = (t) => String(t).replace(/^\uFEFF/, '');

  $('csvFileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSV(semBOM(e.target.result));
      try {
        localStorage.setItem(CHAVE_MEMORIA, e.target.result);
      } catch {
        /* memória cheia — segue sem guardar */
      }
      definirEstado('Dados carregados do ficheiro selecionado!', 'is-ok');
    };
    reader.readAsText(file);
  });

  fetch('csv/formulas.csv')
    .then((response) => {
      if (!response.ok) throw new Error('Ficheiro não encontrado no servidor');
      return response.text();
    })
    .then((texto) => {
      parseCSV(semBOM(texto));
      try {
        localStorage.setItem(CHAVE_MEMORIA, texto);
      } catch {
        /* memória cheia — segue sem guardar */
      }
      definirEstado('Ficheiro formulas.csv carregado automaticamente do servidor!', 'is-ok');
    })
    .catch(() => {
      const guardado = localStorage.getItem(CHAVE_MEMORIA);
      if (guardado) {
        parseCSV(semBOM(guardado));
        definirEstado(
          `Dados carregados da memória do browser! ${Object.keys(formulas).length} produtos disponíveis.`,
          'is-ok'
        );
      } else {
        definirEstado(
          'Bem-vindo! Por favor, clique em "Selecionar Ficheiro CSV" para carregar as fórmulas pela primeira vez.',
          'is-warn'
        );
      }
    });
}
