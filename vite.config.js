import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { basename, resolve } from 'node:path';

// --- Build Multi-Página (MPA) -------------------------------------------------
// Todas as páginas .html vivem na raiz do projeto (mesmos URLs da versão antiga,
// para não partir bookmarks nem links internos). O Vite gera um bundle por página.
const raiz = fileURLToPath(new URL('.', import.meta.url));
const paginas = readdirSync(raiz)
  .filter((f) => f.endsWith('.html'))
  .map((f) => resolve(raiz, f));

export default defineConfig({
  appType: 'mpa',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: Object.fromEntries(
        paginas.map((p) => [basename(p, '.html'), p])
      ),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
