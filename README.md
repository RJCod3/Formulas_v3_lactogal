# Lactogal — Apoio à Produção (Vite)

Sistema de apoio à produção das linhas de Aromatizados e Proteínas — agora em
**Vite + JavaScript modular (ES Modules)**.

## O que mudou em relação à V2.1 (HTML/JS/CSS simples)

| Antes (V2.1) | Agora (V3.0) |
| --- | --- |
| 15 páginas HTML com a sidebar copiada à mão | Sidebar definida **uma única vez** (`src/modules/nav.js`), item ativo e submenu detetados automaticamente |
| Pipeline CSV duplicado em ~10 ficheiros | Um módulo único (`src/modules/csv.js`): fetch do servidor → memória do browser → upload manual |
| 7 ficheiros `prot_*.js` idênticos (127 linhas cada) | **Um motor comum** (`src/pages/proteina.js`); cada página indica o CSV com `<body data-receita="...">` |
| Funções globais com `onclick` no HTML | Módulos ES + `addEventListener` (sem poluir o escopo global) |
| 9 ficheiros CSS com cores repetidas | Design tokens em `src/styles/tokens.css` + **tema claro/escuro** (botão 🌓 na sidebar) |
| Sem suporte para telemóvel/tablet | **Responsivo**: menu ☰ com off-canvas, grelhas colapsam a 1 coluna |
| Imagem `pictures/main.jpg` em falta (hero quebrado) | Hero em CSS puro + **acessos rápidos** na página inicial |
| Texto do CSV inserido com `innerHTML` sem escape | Função `esc()` aplica escape a todos os valores do CSV |

**Compatibilidade garantida:** as chaves de `localStorage` e os nomes/formatos dos
CSVs são os mesmos — quem já usava a V2.1 não perde dados nem ficheiros carregados.

## Requisitos

- Node.js 20.19+ ou 22.12+ (recomendado 24.x)

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ em http://localhost:4173
```

O build é **multi-página (MPA)**: o `vite.config.js` deteta automaticamente todos
os `.html` na raiz e gera um bundle por página. O resultado em `dist/` é estático
(pode ser servido por IIS, nginx, Azure Static Web Apps, etc.).

## Estrutura

```
├── index.html … prot_baunilha250.html   # 15 páginas (URLs iguais aos antigos)
├── public/
│   ├── favicon.svg
│   └── csv/                             # dados (separador ";", UTF-8 com BOM)
│       ├── formulas.csv … prot_*.csv, acertos.csv, c1-3.csv, morango.csv
│       └── LEIA-ME_CSV.md               # formatos de cada CSV
├── src/
│   ├── main.js                          # bootstrap comum (nav + tema + CSS)
│   ├── styles/                          # tokens, base, components, pages
│   ├── modules/
│   │   ├── nav.js      # sidebar única + menu móvel
│   │   ├── theme.js    # tema claro/escuro (localStorage "lactogal_theme")
│   │   ├── storage.js  # localStorage (mesmas chaves da V2.1)
│   │   ├── csv.js      # pipeline CSV + numeroCSV + estado "Sem dados"
│   │   └── format.js   # helpers de DOM, formatação, impressão, esc()
│   └── pages/                           # lógica de cada página
│       ├── proteina.js                  # motor comum das 7 páginas Prot.*
│       └── (home, calculos_sap, acertos, codigos, camioes, densidades,
│              c1-3, formulacoes, morango)
└── .github/workflows/azure-static-web-apps.yml   # CI/CD atualizado (build npm → dist/)
```

## Atualizar os dados (CSVs)

Os CSVs vivem em `public/csv/` e são publicados para `dist/csv/` no build.
Para atualizar, substitua o ficheiro correspondente (separador `;`, decimais com
ponto, guardar em **UTF-8**) — ver [public/csv/LEIA-ME_CSV.md](public/csv/LEIA-ME_CSV.md).

Nota: `codigos.csv`, `viaturas.csv` e `densidades.csv` não vinham no repositório
original — se existirem, basta colocá-los em `public/csv/` que as páginas Códigos
SAP, Camiões e Densidades passam a carregá-los automaticamente; caso contrário
continuam a funcionar por upload manual (guardado na memória do browser).

## Deploy (Azure Static Web Apps)

O workflow incluído (`.github/workflows/azure-static-web-apps.yml`) faz
`npm install && npm run build` e publica a pasta `dist/`:

```yaml
app_location: "/"
output_location: "dist"
```

---

RJ Cod3 2026 · V3.0 181126
