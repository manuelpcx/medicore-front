import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile top bar (hidden on desktop via CSS) */}
      <header className="app-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 90,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        alignItems: 'center', gap: 12, padding: '0 16px',
      }}>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text)', lineHeight: 1, padding: 4 }}
        >☰</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'DM Serif Display, serif', fontSize: 15,
          }}>M</div>
          <span className="serif" style={{ fontSize: 18, color: 'var(--accent)' }}>Medicore</span>
        </div>
      </header>

      {/* Drawer backdrop (mobile only) */}
      <div
        className={`app-overlay${mobileOpen ? ' is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,22,0.4)', zIndex: 95 }}
      />

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="app-main" style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        padding: '32px 36px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - var(--sidebar-w))',
        transition: 'margin-left 0.2s ease',
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
