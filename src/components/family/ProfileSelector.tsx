import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMinors } from '../../hooks/useMinors';
import { useFamilyGroup } from '../../hooks/useFamily';
import { useActiveProfile } from '../../store/active-profile.store';
import { useAuthStore } from '../../store/auth.store';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Icon } from '../ui/Icon';
import { extractError } from '../../utils/format';
import { AddMinorModal } from './AddMinorModal';
import type { Minor } from '../../types';

interface ProfileSelectorProps {
  /** Se invoca al elegir un perfil o abrir el alta; cierra el drawer móvil. */
  onSelect?: () => void;
}

/**
 * Selector de perfil alojado en el Sidebar (#22, antes en el TopBar). Lista al
 * adulto y a sus menores (de `useMinors`), muestra badge "Menor" ámbar, el
 * desglose del cupo unificado (`useFamilyGroup`) y la opción "Agregar menor".
 * Al seleccionar un perfil actualiza el store `useActiveProfile` (R3).
 * Implementa los 4 estados de `useMinors` dentro del menú.
 */
export function ProfileSelector({ onSelect }: ProfileSelectorProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isFamily = user?.plan === 'family';
  const active = useActiveProfile();
  const setProfile = useActiveProfile((s) => s.setProfile);
  const { data: minors = [], isLoading, isError, error, refetch } = useMinors();
  const { data: group } = useFamilyGroup();

  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Cupo unificado de #21 (miembros + menores contra max_members). Sin grupo aún
  // (404) no se bloquea el primer alta; el backend defiende con 409 (R14).
  const atCap = group ? group.available <= 0 : false;
  const cupoLabel = group
    ? `${group.occupied}/${group.max_members} · ${group.minors} menores`
    : `${minors.length} menores`;
  const activeInicial = (active.isMinor ? active.nombre : user?.nombre)?.[0]?.toUpperCase() ?? '?';
  const activeLabel = active.isMinor ? active.nombre : user?.nombre ?? 'Usuario';

  const selectAdult = () => {
    setProfile({ patientId: null, isMinor: false, nombre: null });
    setOpen(false);
    onSelect?.();
  };
  const selectMinor = (m: Minor) => {
    setProfile({ patientId: m.id, isMinor: true, nombre: m.nombre });
    setOpen(false);
    onSelect?.();
  };
  const openAdd = () => {
    if (atCap) return;
    setOpen(false);
    setAddOpen(true);
    onSelect?.();
  };
  const goToUpsell = () => {
    setOpen(false);
    onSelect?.();
    navigate('/elegir-plan');
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Chip del perfil activo (ancho del contenedor de la sidebar) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 9, width: '100%',
          justifyContent: 'space-between',
          padding: '6px 12px 6px 6px', borderRadius: 30, cursor: 'pointer',
          background: active.isMinor ? 'var(--amber2)' : 'var(--surface2)',
          border: active.isMinor ? '1px solid var(--amber)' : '1px solid transparent',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: active.isMinor ? 'var(--amber)' : 'var(--accent)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>{activeInicial}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeLabel}
          </span>
          {active.isMinor && <Badge variant="warning" size="sm">Menor</Badge>}
        </span>
        <Icon name="chevron" size={15} color="var(--text3)" style={{ flexShrink: 0, transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          {/* Backdrop para cerrar al clicar fuera */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            role="menu"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 61,
              width: '100%', minWidth: 240, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            }}
          >
            {/* Cabecera con el desglose del cupo unificado (R14) */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Perfiles</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{cupoLabel}</span>
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
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: isFamily ? 10 : 0 }}>
                    {isFamily ? 'Agrega el perfil de un menor a tu cargo.' : 'Agregar menores requiere el Plan Family.'}
                  </div>
                  {isFamily && (
                    <Button size="sm" onClick={openAdd} style={{ background: 'var(--amber)', color: '#fff' }}>
                      <Icon name="plus" size={15} color="#fff" /> Agregar menor
                    </Button>
                  )}
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

            {/* Pie: Agregar menor (R14) */}
            <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
              {isFamily ? (
                <>
                  <Button
                    onClick={openAdd}
                    disabled={atCap}
                    style={{ width: '100%', background: atCap ? 'var(--surface2)' : 'var(--amber)', color: atCap ? 'var(--text3)' : '#fff' }}
                  >
                    <Icon name="plus" size={15} color={atCap ? 'var(--text3)' : '#fff'} /> Agregar menor
                  </Button>
                  {atCap && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
                      Alcanzaste el cupo del plan familiar.
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                    Agregar menores a tu cargo requiere el Plan Familiar.
                  </div>
                  <Button
                    onClick={goToUpsell}
                    style={{ width: '100%', background: 'var(--purple)', color: '#fff' }}
                  >
                    Actualizar a Plan Familiar
                  </Button>
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
