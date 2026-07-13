import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';
import { toast } from '../../store/toast.store';
import { QRModal } from '../modals/QRModal';
import { Icon, type IconName } from '../ui/Icon';

/*
  Barra lateral "Clínico Moderno" (1b) — con NOMBRES visibles y texto grande
  (pensada para adultos mayores). Sin modo colapsado: las etiquetas siempre se ven.
  En móvil (<=768px) se comporta como drawer deslizable.
*/

const NAV: { to: string; icon: IconName; label: string }[] = [
  { to: '/dashboard',    icon: 'home',      label: 'Inicio' },
  { to: '/historial',    icon: 'clipboard', label: 'Historial' },
  { to: '/medicamentos', icon: 'pill',      label: 'Medicamentos' },
  { to: '/examenes',     icon: 'flask',     label: 'Exámenes' },
  { to: '/alergias',     icon: 'alert',     label: 'Alergias' },
  { to: '/vacunas',      icon: 'syringe',   label: 'Vacunas' },
  { to: '/perfil',       icon: 'user',      label: 'Perfil' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  // Item "Familia" visible solo si el usuario participa en el plan familiar:
  // owner (plan === 'family') o miembro aceptado (family_group_id no nulo).
  const showFamily = user?.plan === 'family' || !!user?.family_group_id;
  const nav: { to: string; icon: IconName; label: string }[] = showFamily
    ? [...NAV.slice(0, -1), { to: '/familia', icon: 'heart', label: 'Familia' }, NAV[NAV.length - 1]]
    : NAV;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* noop */ }
    clearAuth();
    navigate('/login');
    toast.info('Sesión cerrada');
  };

  return (
    <>
      <aside className={`app-sidebar${mobileOpen ? ' is-open' : ''}`} style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0,
        zIndex: 100, padding: '22px 0',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 20px 20px' }}>
          <span style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>M</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>MediHistory</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px', overflowY: 'auto' }}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '12px 14px', borderRadius: 12,
                background: isActive ? 'var(--accent2)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 15.5, textDecoration: 'none',
                transition: 'all 0.12s',
              })}
            >
              <Icon name={item.icon} size={22} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Admin dashboard */}
        {user?.role === 'admin' && (
          <div style={{ padding: '12px 16px 0' }}>
            <button
              onClick={() => { onMobileClose?.(); navigate('/admin'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: 13, borderRadius: 'var(--radius-btn)',
                background: 'var(--accent)', color: '#fff', border: 'none',
                fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <Icon name="user" size={21} />
              Admin dashboard
            </button>
          </div>
        )}

        {/* QR button */}
        <div style={{ padding: '12px 16px 0' }}>
          <button
            onClick={() => setQrOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: 13, borderRadius: 'var(--radius-btn)',
              background: 'var(--accent)', color: '#fff', border: 'none',
              fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <Icon name="qr" size={21} />
            Compartir QR
          </button>
        </div>

        {/* User + logout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '16px 20px 0', marginTop: 14, borderTop: '1px solid var(--border)',
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--accent2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 16,
          }}>
            {user?.nombre?.[0]?.toUpperCase() ?? '?'}
          </span>
          <div style={{ flex: 1, minWidth: 0, marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre}
            </div>
            <button
              onClick={handleLogout}
              style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}
