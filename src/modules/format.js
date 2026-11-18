/* ============================================================================
 * format.js — Helpers de DOM, formatação de números e impressão
 * ========================================================================== */

/* Lê o valor numérico de um campo por id (0 se vazio/inválido) */
export function valorNumerico(id, padrao = 0) {
  return parseFloat(document.getElementById(id)?.value) || padrao;
}

/* Preenche um campo por id; usa valorPadrao quando o valor é vazio */
export function preencherCampo(id, valor, padrao) {
  const el = document.getElementById(id);
  if (el) el.value = (valor !== undefined && valor !== null) ? valor : padrao;
}

/* Formatação de quantidades: <100 → 3 casas; ≥100 → 2 casas (regra histórica) */
export function formatarQuantidade(valor) {
  return valor < 100 ? valor.toFixed(3) : valor.toFixed(2);
}

/* Célula vazia (0) mostrada como "-" */
export function formatarCelulaVazia(valor) {
  return valor === 0 ? '<span class="empty-cell">-</span>' : valor;
}

/* Escapa texto vindo de CSV antes de o inserir com innerHTML */
export function esc(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* Impressão de um cartão: só o elemento com .print-active sai no papel
 * (o CSS em base.css esconde o resto) */
export function imprimirFrame(id) {
  const alvo = document.getElementById(id);
  if (!alvo) return;
  alvo.classList.add('print-active');
  window.print();
  alvo.classList.remove('print-active');
}
