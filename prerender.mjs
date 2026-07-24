import fs from 'node:fs';
import path from 'node:path';

// Script de build time (ejecutado con `node prerender.mjs` desde `pnpm
// build`, NUNCA servido en producción). Lee el template de cliente ya
// construido (`dist/index.html`), importa el bundle SSR ya construido
// (`dist-ssr/entry-server.js`), renderiza la landing a un string HTML, lo
// inyecta en el cascarón `<div id="root"></div>` y escribe el resultado a un
// archivo NUEVO y SEPARADO (`dist/landing.html`) — `dist/index.html` NUNCA
// se sobrescribe (ver design.md, "Por qué un archivo separado").
const root = path.resolve(import.meta.dirname);
const distIndexPath = path.join(root, 'dist/index.html');

if (!fs.existsSync(distIndexPath)) {
  console.error(
    '[prerender] No existe dist/index.html — el build de cliente (vite build) debe correr antes que prerender.mjs.',
  );
  process.exit(1);
}

const template = fs.readFileSync(distIndexPath, 'utf-8');

let appHtml;
try {
  const { render } = await import('./dist-ssr/entry-server.js');
  appHtml = render('/');
} catch (err) {
  console.error('[prerender] render(\'/\') lanzó una excepción:', err);
  process.exit(1);
}

// Fail fast: si el render no produjo contenido reconocible, no seguir —
// evita publicar un landing.html vacío/roto silenciosamente.
if (!appHtml || appHtml.trim().length === 0 || !appHtml.includes('MediHistory')) {
  console.error(
    '[prerender] render(\'/\') produjo contenido vacío o no reconocible (se esperaba encontrar "MediHistory"). Abortando.',
  );
  process.exit(1);
}

if (!template.includes('<div id="root"></div>')) {
  console.error(
    '[prerender] dist/index.html no contiene el cascarón esperado (<div id="root"></div>). Abortando.',
  );
  process.exit(1);
}

const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

fs.writeFileSync(path.join(root, 'dist/landing.html'), html);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });

console.log('[prerender] pre-rendered: dist/landing.html');
