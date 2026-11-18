/* ============================================================================
 * nav.js — Barra lateral única para todas as páginas
 * Na versão antiga a sidebar estava copiada à mão nas 15 páginas HTML; aqui é
 * definida UMA vez e cada página recebe `<aside class="sidebar" data-nav>`.
 * O item ativo e o submenu aberto são detetados automaticamente pelo URL.
 * ========================================================================== */

const NAV = [
  { icon: '🏠', label: 'Início', href: 'index.html' },
  { icon: '💰', label: 'Calculos SAP', href: 'calculos_sap.html' },
  { icon: '⚖️', label: 'Acertos', href: 'acertos.html' },
  { icon: '📋', label: 'Códigos SAP', href: 'codigos.html' },
  { icon: '🚚', label: 'Camiões', href: 'camioes.html' },
  { icon: '🧪', label: 'Densidades', href: 'densidades.html' },
  { icon: '🍼', label: 'Lote C1-3 Anos', href: 'c1-3.html' },
  {
    icon: '🍦',
    label: 'Formulas',
    children: [
      { label: 'Gestão de Fórmulas', href: 'formulacoes.html' },
      { label: 'Lote Morango', href: 'morango.html' },
    ],
  },
  {
    icon: '💪',
    label: 'Proteínas',
    children: [
      { label: 'Prot. Enzimas', href: 'prot_enzimas.html' },
      { label: 'Prot. Cacau', href: 'prot_cacau.html' },
      { label: 'Prot. Morango', href: 'prot_morango.html' },
      { label: 'Prot. Café', href: 'prot_cafe.html' },
      { label: 'Prot. Caramelo', href: 'prot_caramelo.html' },
      { label: 'Prot. Pistacio', href: 'prot_pistacio.html' },
      { label: 'Prot. Baunilha 250cc', href: 'prot_baunilha250.html' },
    ],
  },
];

const VERSAO = 'V3.0 · 181126';

function paginaAtual() {
  const ficheiro = window.location.pathname.split('/').pop();
  return ficheiro === '' ? 'index.html' : ficheiro;
}

/* Uma página está ativa se for o href do link ou de um dos filhos do submenu */
function submenuContemAtivo(item, pagina) {
  return item.children?.some((filho) => filho.href === pagina) ?? false;
}

function construirMenu() {
  const pagina = paginaAtual();
  const itens = NAV.map((item) => {
    if (item.children) {
      const abrir = submenuContemAtivo(item, pagina);
      const filhos = item.children
        .map(
          (f) => `<li><a href="${f.href}"${f.href === pagina ? ' class="active" aria-current="page"' : ''}>${f.label}</a></li>`
        )
        .join('');
      return `
        <li class="has-submenu${abrir ? ' open' : ''}">
          <a role="button" tabindex="0" aria-expanded="${abrir}">
            <span class="menu-label"><span class="icon">${item.icon}</span> ${item.label}</span>
            <span class="arrow">▶</span>
          </a>
          <ul class="submenu${abrir ? ' active' : ''}">${filhos}</ul>
        </li>`;
    }
    const ativo = item.href === pagina ? ' class="active" aria-current="page"' : '';
    return `<li><a href="${item.href}"${ativo}><span class="icon">${item.icon}</span> ${item.label}</a></li>`;
  }).join('');

  return `
    <div class="sidebar-header">
      <h2>LACTOGAL Tocha</h2>
      <p>Produção &amp; Ingredientação</p>
    </div>
    <ul class="nav-menu">${itens}</ul>
    <div class="sidebar-footer">
      <div class="metadata"><p>By RJ Cod3 2026</p><p>${VERSAO}</p></div>
      <button type="button" class="theme-btn" data-theme-toggle>🌓 Tema</button>
    </div>`;
}

/* Abrir/fechar submenus — apenas um aberto de cada vez (como na versão antiga) */
function ligarSubmenus() {
  document.querySelectorAll('.has-submenu > a').forEach((link) => {
    const alternar = () => {
      const item = link.parentElement;
      const submenu = item.querySelector('.submenu');
      document.querySelectorAll('.has-submenu').forEach((outra) => {
        if (outra !== item) {
          outra.classList.remove('open');
          outra.querySelector('.submenu').classList.remove('active');
          outra.querySelector('a').setAttribute('aria-expanded', 'false');
        }
      });
      const aberto = item.classList.toggle('open');
      submenu.classList.toggle('active', aberto);
      link.setAttribute('aria-expanded', String(aberto));
    };
    link.addEventListener('click', (e) => {
      e.preventDefault();
      alternar();
    });
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alternar();
      }
    });
  });
}

/* Navegação móvel: botão ☰ + backdrop para fechar */
function ligarNavegacaoMovel() {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Abrir menu');
  toggle.textContent = '☰';

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';

  const fechar = () => document.body.classList.remove('nav-open');

  toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));
  backdrop.addEventListener('click', fechar);
  document.querySelector('.sidebar')?.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) fechar();
  });

  document.body.append(toggle, backdrop);
}

export function initNav() {
  const sidebar = document.querySelector('[data-nav]');
  if (!sidebar) return;
  sidebar.innerHTML = construirMenu();
  ligarSubmenus();
  ligarNavegacaoMovel();
}
