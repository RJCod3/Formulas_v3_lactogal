/* ============================================================================
 * theme.js — Tema claro/escuro (novo na V3.0)
 * Guardado em localStorage "lactogal_theme"; aplicado cedo pelo snippet inline
 * no <head> de cada página para não haver "flash" do tema errado.
 * ========================================================================== */

export const CHAVE_TEMA = 'lactogal_theme';

export function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
}

export function initTheme() {
  const botao = document.querySelector('[data-theme-toggle]');
  if (!botao) return;

  botao.addEventListener('click', () => {
    const novo = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    aplicarTema(novo);
    try {
      localStorage.setItem(CHAVE_TEMA, novo);
    } catch {
      /* sem localStorage — o tema aplica-se apenas nesta sessão */
    }
  });
}
