import React from 'react';
import { Link } from 'react-router-dom';
import { parseISO, isValid, differenceInDays } from 'date-fns';
import { useAuthStore } from '../store/auth.store';
import { usePatient } from '../hooks/usePatient';
import { useHistory } from '../hooks/useHistory';
import { useMedications } from '../hooks/useMedications';
import { useAllergies } from '../hooks/useAllergies';
import { useExams } from '../hooks/useExams';
import { Card } from '../components/ui/Card';
import { tipoBadge, severidadBadge } from '../components/ui/Badge';
import { ListSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Icon, type IconName } from '../components/ui/Icon';
import { FamilyInvitationBanner } from '../components/family/FamilyInvitationBanner';
import { MinorSummary } from '../components/family/MinorSummary';
import { useActiveProfile } from '../store/active-profile.store';
import { fDate } from '../utils/format';

const TIPO_COLOR: Record<string, { bg: string; col: string }> = {
  control:      { bg: 'var(--accent2)', col: 'var(--accent)' },
  urgencia:     { bg: 'var(--red2)',    col: 'var(--red)' },
  especialidad: { bg: 'var(--blue2)',   col: 'var(--blue)' },
  preventivo:   { bg: 'var(--purple2)', col: 'var(--purple)' },
};

const VITALS: { key: string; label: string; unit: string }[] = [
  { key: 'peso', label: 'Peso', unit: 'kg' },
  { key: 'altura', label: 'Altura', unit: 'm' },
  { key: 'presion_arterial', label: 'Presión arterial', unit: 'mmHg' },
  { key: 'frecuencia_cardiaca', label: 'Frec. cardíaca', unit: 'bpm' },
  { key: 'temperatura', label: 'Temperatura', unit: '°C' },
];

function StatTile({ icon, bg, col, value, label }: { icon: IconName; bg: string; col: string; value: number; label: string }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={21} color={col} />
      </span>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{label}</div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isMinor = useActiveProfile((s) => s.isMinor);
  const { data: patient, isLoading: loadingPatient } = usePatient();
  const { data: history = [], isLoading: loadingHistory } = useHistory();
  const { data: medications = [], isLoading: loadingMeds } = useMedications();
  const { data: allergies = [], isLoading: loadingAllergies } = useAllergies();
  const { data: exams = [] } = useExams();

  // Cuando el perfil activo es un menor, el dashboard muestra su resumen (con
  // identidad + métricas re-keyed) en lugar de las tarjetas exclusivas del
  // adulto (signos vitales / tipo de sangre de /patients/me). R37.
  if (isMinor) return <MinorSummary />;

  const activeMeds = medications.filter((m) => m.estado === 'activo');
  const recentHistory = [...history].slice(0, 3);
  const vitals = patient?.perfil;

  // Próxima cita más cercana entre las consultas activas o futuras
  // (excluye citas cuya fecha ya pasó; "hoy" cuenta como activa).
  const isActiveOrUpcoming = (fechaStr: string) => {
    const d = parseISO(fechaStr);
    return isValid(d) && differenceInDays(d, new Date()) >= 0;
  };

  const nextAppt = [...history]
    .filter((h) => h.proxima_cita && isActiveOrUpcoming(h.proxima_cita))
    .sort((a, b) => (a.proxima_cita! > b.proxima_cita! ? 1 : -1))[0];

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Banner de invitación familiar (aditivo; null si no hay invitaciones) */}
      <FamilyInvitationBanner />

      {/* Hero: saludo + próxima cita */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        background: 'linear-gradient(100deg, var(--accent) 0%, var(--accent3) 100%)',
        color: '#fff', borderRadius: 18, padding: '24px 28px', marginBottom: 20,
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Hola, {user?.nombre?.split(' ')[0] ?? ''}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 3 }}>Aquí está el resumen de tu historial médico.</div>
        </div>
        {nextAppt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.14)', borderRadius: 13, padding: '12px 18px' }}>
            <Icon name="calendar" size={22} color="#fff" />
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 }}>Próxima cita</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>{fDate(nextAppt.proxima_cita!)} · {nextAppt.doctor}</div>
            </div>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatTile icon="clipboard" bg="var(--accent2)" col="var(--accent)" value={history.length} label="Consultas" />
        <StatTile icon="flask" bg="var(--blue2)" col="var(--blue)" value={exams.length} label="Exámenes" />
        <StatTile icon="pill" bg="var(--purple2)" col="var(--purple)" value={activeMeds.length} label="Medicamentos" />
        <StatTile icon="alert" bg="var(--amber2)" col="var(--amber)" value={allergies.length} label="Alergias" />
      </div>

      {/* Grid principal */}
      <div className="dash-columns" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 18 }}>
        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Signos vitales */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Icon name="heart" size={19} color="var(--accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Signos vitales</h3>
            </div>
            {loadingPatient ? <Skeleton height={70} /> : vitals ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                {VITALS.map((v) => {
                  const value = (vitals as unknown as Record<string, unknown>)[v.key];
                  return (
                    <div key={v.key} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{value != null ? String(value) : '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{v.unit}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>{v.label}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin datos de signos vitales. Actualiza tu perfil.</p>
            )}
          </Card>

          {/* Últimas consultas */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Últimas consultas</h3>
              <Link to="/historial" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>Ver todo</Link>
            </div>
            {loadingHistory ? <ListSkeleton count={3} /> : recentHistory.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin consultas registradas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentHistory.map((h) => {
                  const c = TIPO_COLOR[h.tipo] ?? TIPO_COLOR.control;
                  return (
                    <div key={h.id} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: 12, background: 'var(--surface2)', borderRadius: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: 11, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="clipboard" size={18} color={c.col} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{h.especialidad}</span>
                          {tipoBadge(h.tipo)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{h.doctor} · {fDate(h.fecha)}</div>
                        {h.diagnostico && <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 5 }}>{h.diagnostico}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Medicamentos activos */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 13px' }}>Medicamentos activos</h3>
            {loadingMeds ? <ListSkeleton count={2} /> : activeMeds.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Ninguno</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeMeds.map((m) => (
                  <div key={m.id} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{m.dosis} · {m.frecuencia}</div>
                    {m.horario && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: 'var(--accent)' }}>
                        <Icon name="clock" size={13} strokeWidth={1.8} />
                        <span style={{ fontSize: 11 }}>{m.horario}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Alergias */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 13px' }}>Alergias</h3>
            {loadingAllergies ? <ListSkeleton count={2} /> : allergies.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Ninguna registrada</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {allergies.map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{a.nombre}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>{a.tipo}</span>
                    </div>
                    {severidadBadge(a.severidad)}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tipo de sangre */}
          {patient && (
            <div style={{ background: 'var(--accent)', borderRadius: 16, padding: 18, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="drop" size={24} color="#fff" />
                </span>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 }}>Tipo de sangre</div>
                  <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{patient.tipo_sangre || 'No registrado'}</div>
                </div>
              </div>
              {patient.perfil?.contacto_emergencia && (
                <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, opacity: 0.9 }}>
                  <Icon name="phone" size={14} color="#fff" />
                  {patient.perfil.contacto_emergencia}
                  {patient.perfil.telefono_emergencia && ` · ${patient.perfil.telefono_emergencia}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
