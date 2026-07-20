import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ProfileContextBanner } from '../family/ProfileContextBanner';

/*
  Shell "Clínico Moderno" (1b): barra lateral fija + barra superior sticky.
  El contenido de cada página se renderiza en <Outlet />.
  En móvil la sidebar se vuelve un drawer con overlay.
*/

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Backdrop del drawer (solo móvil) */}
      <div
        className={`app-overlay${mobileOpen ? ' is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,45,0.4)', zIndex: 95 }}
      />

      <div className="app-shell-main" style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="app-shell-content" style={{ flex: 1, padding: '28px', overflowX: 'hidden' }}>
          <ProfileContextBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
