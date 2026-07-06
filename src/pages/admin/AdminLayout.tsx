import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { toast } from '../../store/toast.store';

/**
 * Layout del panel de administración. Deliberadamente distinto al del paciente:
 * sin sidebar médico y con un header de franja púrpura (--purple) para dejar
 * claro que es una sección diferente.
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.info('Sesión cerrada');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header con franja púrpura */}
      <header style={{
        background: 'var(--purple)',
        color: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, background: 'rgba(255,255,255,0.18)', borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Serif Display, serif', fontSize: 17, flexShrink: 0,
            }}>M</div>
            <div style={{ minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 19, lineHeight: 1.1 }}>Panel Admin</div>
              <div style={{ fontSize: 12, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                MediHistory · Administración
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <span style={{ fontSize: 13, opacity: 0.9, whiteSpace: 'nowrap' }}>
              {user?.nombre}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.16)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-btn)',
                padding: '7px 14px', fontSize: 13, fontFamily: 'inherit',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px, 4vw, 32px)' }}>
        {children}
      </main>
    </div>
  );
}
