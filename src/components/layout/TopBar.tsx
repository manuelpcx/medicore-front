import React from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileSelector } from '../family/ProfileSelector';

/*
  Barra superior "Clínico Moderno" (1b): título de la página, buscador,
  notificaciones y chip de perfil. El título se deriva de la ruta actual.
  En móvil muestra el botón de menú para abrir la sidebar-drawer.
*/

const TITLES: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/historial': 'Historial médico',
  '/medicamentos': 'Medicamentos',
  '/examenes': 'Exámenes',
  '/alergias': 'Alergias',
  '/vacunas': 'Vacunas',
  '/perfil': 'Perfil',
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'MediHistory';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 'var(--topbar-h)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 28px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Botón de menú (solo móvil) */}
      <button
        className="app-menu-btn"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'var(--surface2)', border: 'none',
          alignItems: 'center', justifyContent: 'center', color: 'var(--text2)',
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>☰</span>
      </button>

      <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{title}</div>

      {/* Selector de perfil (adulto + menores) */}
      <ProfileSelector />
    </header>
  );
}
