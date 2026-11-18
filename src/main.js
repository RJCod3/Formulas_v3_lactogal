/* ============================================================================
 * main.js — Bootstrap comum a TODAS as páginas
 * Cada página importa este módulo antes do seu módulo específico:
 *   <script type="module" src="/src/main.js"></script>
 *   <script type="module" src="/src/pages/acertos.js"></script>
 * ========================================================================== */

import './styles/main.css';
import { initNav } from './modules/nav.js';
import { initTheme } from './modules/theme.js';

initNav();
initTheme();
