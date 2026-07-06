import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAdminUserDetail } from '../../hooks/useAdmin';
import { fDate, fRelative } from '../../utils/format';

/**
 * Detalle de un usuario. Solo muestra conteos y metadatos — nunca el
 * contenido médico real del usuario.
 */
export function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data, isLoading, isError } = useAdminUserDetail(userId);

  return (
    <Modal open={!!userId} onClose={onClose} title="Detalle del usuario" maxWidth={520}>
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={56} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </div>
      )}

      {isError && (
        <p style={{ color: 'var(--red)', fontSize: 14 }}>
          No se pudo cargar el detalle del usuario.
        </p>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Identidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--purple2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--purple)', fontWeight: 600, fontSize: 18, flexShrink: 0,
            }}>
              {data.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{data.nombre}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.email}
              </div>
            </div>
            <span style={{
              marginLeft: 'auto', flexShrink: 0, fontSize: 12, fontWeight: 500,
              padding: '4px 10px', borderRadius: 20,
              background: data.activo ? 'var(--accent2)' : 'var(--surface2)',
              color: data.activo ? 'var(--accent)' : 'var(--text3)',
            }}>
              {data.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Metadatos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Meta label="Registro" value={fDate(data.created_at)} />
            <Meta label="Último login" value={data.last_login_at ? fRelative(data.last_login_at) : 'Nunca'} />
            <Meta label="Tipo de sangre" value={data.tipo_sangre || '—'} />
            <Meta label="Rol" value={data.role === 'admin' ? 'Administrador' : 'Paciente'} />
          </div>

          {/* Conteos de uso */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Actividad
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              <CountBox label="Consultas" value={data.history_count} />
              <CountBox label="Exámenes" value={data.exam_count} />
              <CountBox label="Medicamentos" value={data.medication_count} />
              <CountBox label="Alergias" value={data.allergy_count} />
              <CountBox label="Vacunas" value={data.vaccine_count} />
              <CountBox label="Códigos QR" value={data.access_code_count} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function CountBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)' }}>{value ?? 0}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
