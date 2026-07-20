import React from 'react';
import { useActiveProfile } from '../../store/active-profile.store';
import { Icon } from '../ui/Icon';

/**
 * Banner de contexto del espacio del menor (R27, R28, R43). Se renderiza en el
 * layout sobre el <Outlet />, así aparece en todas las páginas de dominio
 * mientras el menor esté activo. Devuelve null cuando el perfil activo es el
 * adulto (R28). Usa los tokens ámbar/pediátricos sin alterar el dashboard del
 * adulto.
 */
export function ProfileContextBanner() {
  const isMinor = useActiveProfile((s) => s.isMinor);
  const nombre = useActiveProfile((s) => s.nombre);
  const resetToAdult = useActiveProfile((s) => s.resetToAdult);

  if (!isMinor) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        background: 'var(--amber2)', border: '1px solid var(--amber)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 18,
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="user" size={18} color="#fff" />
      </span>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>
          Estás viendo el perfil de {nombre ?? 'un menor'}, menor de edad
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 1 }}>
          Los datos que registres se guardarán en el historial de este menor.
        </div>
      </div>
      <button
        type="button"
        onClick={resetToAdult}
        style={{
          background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)',
          borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
        }}
      >
        Volver a mi perfil
      </button>
    </div>
  );
}
