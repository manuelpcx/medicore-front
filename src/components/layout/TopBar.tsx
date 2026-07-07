import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useAuthStore } from '../../store/auth.store';

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
  const user = useAuthStore((s) => s.user);
  const title = TITLES[pathname] ?? 'MediHistory';
  const inicial = user?.nombre?.[0]?.toUpperCase() ?? '?';

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

      {/* Notificaciones */}
      {/* <button style={{
        position: 'relative', width: 44, height: 44, borderRadius: 12,
        background: 'var(--surface2)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text2)', cursor: 'pointer', flexShrink: 0,
      }}>
        <Icon name="bell" size={19} strokeWidth={1.8} />
        <span style={{ position: 'absolute', top: 10, right: 11, width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', border: '1.5px solid var(--surface)' }} />
      </button> */}

      {/* Perfil */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
        padding: '5px 14px 5px 6px', background: 'var(--surface2)', borderRadius: 30,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>{inicial}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.nombre ?? 'Usuario'}</span>
      </div>
    </header>
  );
}
