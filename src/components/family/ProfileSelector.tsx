import React, { useState } from 'react';
import { useMinors } from '../../hooks/useMinors';
import { useActiveProfile } from '../../store/active-profile.store';
import { useAuthStore } from '../../store/auth.store';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Icon } from '../ui/Icon';
import { extractError } from '../../utils/format';
import { AddMinorModal } from './AddMinorModal';
import type { Minor } from '../../types';

const MAX_MINORS = 5;

/**
 * Selector de perfil en el header (R12–R20). Lista al adulto y a sus menores
 * (de `useMinors`), muestra badge "Menor" ámbar, contador X/5 y la opción
 * "Agregar menor". Al seleccionar un perfil actualiza el store (R10).
 * Implementa los 4 estados de `useMinors` dentro del menú.
 */
export function ProfileSelector() {
  const user = useAuthStore((s) => s.user);
  const active = useActiveProfile();
  const setProfile = useActiveProfile((s) => s.setProfile);
  const { data: minors = [], isLoading, isError, error, refetch } = useMinors();

  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const atCap = minors.length >= MAX_MINORS;
  const activeInicial = (active.isMinor ? active.nombre : user?.nombre)?.[0]?.toUpperCase() ?? '?';
  const activeLabel = active.isMinor ? active.nombre : user?.nombre ?? 'Usuario';

  const selectAdult = () => {
    setProfile({ patientId: null, isMinor: false, nombre: null });
    setOpen(false);
  };
  const selectMinor = (m: Minor) => {
    setProfile({ patientId: m.id, isMinor: true, nombre: m.nombre });
    setOpen(false);
  };
  const openAdd = () => {
    if (atCap) return;
    setOpen(false);
    setAddOpen(true);
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Chip del perfil activo */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '5px 12px 5px 6px', borderRadius: 30, cursor: 'pointer',
          background: active.isMinor ? 'var(--amber2)' : 'var(--surface2)',
          border: active.isMinor ? '1px solid var(--amber)' : '1px solid transparent',
        }}
      >
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: active.isMinor ? 'var(--amber)' : 'var(--accent)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>{activeInicial}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeLabel}
        </span>
        {active.isMinor && <Badge variant="warning" size="sm">Menor</Badge>}
        <Icon name="chevron" size={15} color="var(--text3)" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          {/* Backdrop para cerrar al clicar fuera */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            role="menu"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 61,
              width: 300, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            }}
          >
            {/* Cabecera con contador X/5 (R14) */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Perfiles</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>{minors.length}/{MAX_MINORS} menores</span>
            </div>

            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Adulto (siempre presente, aunque useMinors falle) */}
              <ProfileRow
                inicial={(user?.nombre?.[0] ?? '?').toUpperCase()}
                nombre={user?.nombre ?? 'Yo'}
                sub="Tu perfil"
                selected={!active.isMinor}
                accent="var(--accent)"
                onClick={selectAdult}
              />

              {/* Sección de menores: 4 estados de useMinors */}
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 8px' }}>
                  {[0, 1].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Skeleton width={34} height={34} radius={999} />
                      <div style={{ flex: 1 }}>
                        <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
                        <Skeleton width="40%" height={10} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>
                    No se pudieron cargar los menores: {extractError(error)}
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => refetch()}>Reintentar</Button>
                </div>
              ) : minors.length === 0 ? (
                <div style={{ padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Aún no agregas menores</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Agrega el perfil de un menor a tu cargo.</div>
                  <Button size="sm" onClick={openAdd} style={{ background: 'var(--amber)', color: '#fff' }}>
                    <Icon name="plus" size={15} color="#fff" /> Agregar menor
                  </Button>
                </div>
              ) : (
                minors.map((m) => (
                  <ProfileRow
                    key={m.id}
                    inicial={(m.nombre?.[0] ?? '?').toUpperCase()}
                    nombre={m.nombre}
                    sub={`${m.edad} años${m.relacion ? ` · ${m.relacion}` : ''}`}
                    selected={active.patientId === m.id}
                    accent="var(--amber)"
                    badge
                    onClick={() => selectMinor(m)}
                  />
                ))
              )}
            </div>

            {/* Pie: Agregar menor (R15, R16) */}
            <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
              <Button
                onClick={openAdd}
                disabled={atCap}
                style={{ width: '100%', background: atCap ? 'var(--surface2)' : 'var(--amber)', color: atCap ? 'var(--text3)' : '#fff' }}
              >
                <Icon name="plus" size={15} color={atCap ? 'var(--text3)' : '#fff'} /> Agregar menor
              </Button>
              {atCap && (
                <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
                  Alcanzaste el máximo de {MAX_MINORS} menores.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AddMinorModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function ProfileRow({
  inicial, nombre, sub, selected, accent, badge, onClick,
}: {
  inicial: string;
  nombre: string;
  sub: string;
  selected: boolean;
  accent: string;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
        padding: '8px 10px', borderRadius: 10, cursor: 'pointer', border: 'none',
        background: selected ? 'var(--surface2)' : 'transparent',
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: '50%', background: accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>{inicial}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</span>
          {badge && <Badge variant="warning" size="sm">Menor</Badge>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
      </div>
      {selected && <Icon name="check" size={16} color={accent} />}
    </button>
  );
}
