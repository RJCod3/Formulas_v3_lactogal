/* ============================================================================
 * storage.js — Persistência no localStorage (entre sessões)
 * Mesmas chaves da versão antiga: ao migrar para o Vite, os dados que os
 * utilizadores já tinham no browser (valores introduzidos e CSVs carregados)
 * continuam a funcionar sem perder nada.
 * ========================================================================== */

export function guardarDados(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

export function lerDados(chave, valorPadrao = {}) {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
  } catch {
    return valorPadrao;
  }
}

export function apagarDados(chave) {
  localStorage.removeItem(chave);
}
