import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import LandingPage from './pages/LandingPage';

// Renderiza LandingPage de forma aislada (NO el árbol completo <App/>):
// evita invocar QueryClientProvider/Zustand/axios — LandingPage no depende
// de ninguno de ellos (ver requirements.md, LandingPage.tsx es puro).
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <LandingPage />
    </StaticRouter>,
  );
}
