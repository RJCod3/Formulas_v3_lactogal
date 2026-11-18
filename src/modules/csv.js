/* ============================================================================
 * csv.js — Pipeline único de carregamento de dados CSV
 * Substitui as ~10 cópias do mesmo código espalhadas pelas páginas antigas.
 *
 * Ordem de carregamento (igual à versão antiga):
 *   1. ficheiro escolhido no botão "📂 Selecionar Ficheiro CSV" (#csvFileInput);
 *   2. ficheiro CSV do servidor (fetch csv/<ficheiro>);
 *   3. última cópia guardada na memória do browser (localStorage).
 * Sem nenhuma das três, a página mostra o estado "Sem dados".
 *
 * O ficheiro escolhido manualmente fica guardado na memória: nas próximas
 * visitas funciona mesmo que o CSV não esteja no servidor.
 * ========================================================================== */

import { esc } from './format.js';

/* Conversão de números do CSV: aceita vírgula ou barra vertical como
 * separador decimal (exportações do Excel em pt-PT) */
export function numeroCSV(valor, padrao = 0) {
  const n = parseFloat(String(valor).trim().replace('|', '.').replace(',', '.'));
  return Number.isNaN(n) ? padrao : n;
}

/* Remove o BOM (efbbbf) que o Excel pt-PT adiciona aos CSV guardados —
 * sem isto, o cabeçalho do CSV era interpretado como uma linha de dados */
const semBOM = (texto) => String(texto).replace(/^\uFEFF/, '');

/**
 * Liga uma página ao seu CSV.
 *
 * @param {object} opcoes
 * @param {string}   opcoes.ficheiro       nome do CSV (ex.: 'prot_enzimas.csv')
 * @param {string}   opcoes.chaveMemoria   chave localStorage com o texto do CSV
 * @param {Function} opcoes.parse          função parseCSV(texto) da página
 * @param {Function} [opcoes.posCarregado] callback extra após cada carregamento
 *   (ex.: para escrever "N produtos disponíveis" no estado)
 */
export function carregarDadosCSV({ ficheiro, chaveMemoria, parse, posCarregado }) {
  const statusEl = document.getElementById('fileStatus');
  const inputEl = document.getElementById('csvFileInput');

  const definirEstado = (mensagem, tipo) => {
    if (!statusEl) return;
    statusEl.textContent = mensagem;
    statusEl.classList.remove('is-ok', 'is-warn');
    if (tipo) statusEl.classList.add(tipo);
  };

  const parseComBOM = (texto) => parse(semBOM(texto));

  const guardarMemoria = (texto) => {
    try {
      localStorage.setItem(chaveMemoria, texto);
    } catch {
      /* memória cheia — a página continua a funcionar nesta sessão */
    }
    if (posCarregado) posCarregado();
  };

  // 1. Ficheiro CSV selecionado manualmente pelo utilizador
  inputEl?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      parseComBOM(e.target.result);
      guardarMemoria(e.target.result);
      definirEstado('Dados carregados do ficheiro selecionado!', 'is-ok');
    };
    reader.readAsText(file);
  });

  // 2/3. Ao abrir a página: CSV do servidor; se falhar, memória do browser
  fetch(`csv/${ficheiro}`)
    .then((response) => {
      if (!response.ok) throw new Error('Ficheiro não encontrado no servidor');
      return response.text();
    })
    .then((texto) => {
      parseComBOM(texto);
      guardarMemoria(texto);
      definirEstado(`Ficheiro ${ficheiro} carregado automaticamente do servidor!`, 'is-ok');
    })
    .catch(() => {
      const guardado = localStorage.getItem(chaveMemoria);
      if (guardado) {
        parseComBOM(guardado);
        definirEstado('Dados carregados da memória do browser!', 'is-ok');
        if (posCarregado) posCarregado();
      } else {
        definirEstado(
          'Sem dados. Carregue o ficheiro CSV ("Selecionar Ficheiro CSV") ou coloque-o em public/csv/ no servidor para ver os valores.',
          'is-warn'
        );
      }
    });
}

/* Mensagem auxiliar "N itens disponíveis" usada pelas páginas de listagem */
export function mensagemContagem(statusEl, texto, quantidade) {
  if (!statusEl) return;
  statusEl.textContent = `${texto} ${quantidade} disponíveis.`;
  statusEl.classList.remove('is-warn');
  statusEl.classList.add('is-ok');
}

/* Linha padrão "Sem dados" para tbody de tabelas */
export function linhaSemDados(colspan, texto) {
  return `<tr><td colspan="${colspan}" style="text-align:center; color:var(--text-muted); padding:20px;">${esc(texto)}</td></tr>`;
}
