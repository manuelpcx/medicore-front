import React from 'react';
import { Link } from 'react-router-dom';
import { useMinors } from '../../hooks/useMinors';
import { useActiveProfile } from '../../store/active-profile.store';
import { useHistory } from '../../hooks/useHistory';
import { useMedications } from '../../hooks/useMedications';
import { useAllergies } from '../../hooks/useAllergies';
import { useExams } from '../../hooks/useExams';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, severidadBadge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Icon, type IconName } from '../ui/Icon';
import { fDate, extractError } from '../../utils/format';

const SEXO_LABEL: Record<string, string> = {
  masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro',
};

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

/**
 * Resumen del menor (R37–R41). Identidad tomada de `useMinors` +
 * `useActiveProfile`; métricas de dominio de los hooks re-keyed por el
 * `patientId` activo. Implementa los 4 estados con layout real.
 */
export function MinorSummary() {
  const activePatientId = useActiveProfile((s) => s.patientId);
  const { data: minors = [] } = useMinors();
  const minor = minors.find((m) => m.id === activePatientId);

  const history = useHistory();
  const meds = useMedications();
  const allergies = useAllergies();
  const exams = useExams();

  const queries = [history, meds, allergies, exams];
  const isLoading = queries.some((q) => q.isLoading);
  const errored = queries.find((q) => q.isError);

  const historyData = history.data ?? [];
  const medsData = meds.data ?? [];
  const allergiesData = allergies.data ?? [];
  const examsData = exams.data ?? [];
  const activeMeds = medsData.filter((m) => m.estado === 'activo');
  const isEmpty = historyData.length === 0 && medsData.length === 0 && allergiesData.length === 0 && examsData.length === 0;

  const refetchAll = () => queries.forEach((q) => q.refetch());

  const identidad = minor
    ? `${minor.edad} años · ${SEXO_LABEL[minor.sexo] ?? minor.sexo}${minor.relacion ? ` · ${minor.relacion}` : ''}`
    : 'Menor';

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Hero de identidad del menor (ámbar/pediátrico) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        background: 'linear-gradient(100deg, var(--amber) 0%, #E0A43A 100%)',
        color: '#fff', borderRadius: 18, padding: '22px 26px', marginBottom: 20,
      }}>
        <span style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="user" size={26} color="#fff" />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{minor?.nombre ?? 'Menor'}</span>
            <Badge variant="warning" size="sm">Menor</Badge>
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 3 }}>{identidad}</div>
        </div>
      </div>

      {isLoading ? (
        <SummarySkeleton />
      ) : errored ? (
        <Card style={{ padding: 28, textAlign: 'center' }}>
          <Icon name="alert" size={26} color="var(--red)" style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>No pudimos cargar el resumen</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>{extractError(errored.error)}</div>
          <Button variant="secondary" onClick={refetchAll}>Reintentar</Button>
        </Card>
      ) : isEmpty ? (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <span style={{ width: 54, height: 54, borderRadius: 16, background: 'var(--amber2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="clipboard" size={24} color="var(--amber)" />
          </span>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Aún no hay datos de {minor?.nombre ?? 'este menor'}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Empieza registrando su historial médico, medicamentos o vacunas.</div>
          <Link to="/historial">
            <Button style={{ background: 'var(--amber)', color: '#fff' }}>
              <Icon name="plus" size={15} color="#fff" /> Registrar historial
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Métricas del menor (re-keyed por su patientId) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <StatTile icon="clipboard" bg="var(--accent2)" col="var(--accent)" value={historyData.length} label="Consultas" />
            <StatTile icon="flask" bg="var(--blue2)" col="var(--blue)" value={examsData.length} label="Exámenes" />
            <StatTile icon="pill" bg="var(--purple2)" col="var(--purple)" value={activeMeds.length} label="Medicamentos" />
            <StatTile icon="alert" bg="var(--amber2)" col="var(--amber)" value={allergiesData.length} label="Alergias" />
          </div>

          <div className="dash-columns" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 18 }}>
            <Card style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Últimas consultas</h3>
                <Link to="/historial" style={{ color: 'var(--amber)', fontSize: 13, fontWeight: 700 }}>Ver todo</Link>
              </div>
              {historyData.length === 0 ? (
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sin consultas registradas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {historyData.slice(0, 3).map((h) => (
                    <div key={h.id} style={{ padding: 12, background: 'var(--surface2)', borderRadius: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{h.especialidad}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{h.doctor} · {fDate(h.fecha)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Card style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 13px' }}>Medicamentos activos</h3>
                {activeMeds.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>Ninguno</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeMeds.map((m) => (
                      <div key={m.id} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{m.dosis} · {m.frecuencia}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 13px' }}>Alergias</h3>
                {allergiesData.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>Ninguna registrada</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {allergiesData.map((a) => (
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
            <Skeleton width={44} height={44} radius={12} />
            <div style={{ flex: 1 }}>
              <Skeleton width="50%" height={22} style={{ marginBottom: 6 }} />
              <Skeleton width="70%" height={12} />
            </div>
          </Card>
        ))}
      </div>
      <div className="dash-columns" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 18 }}>
        <Card style={{ padding: 22 }}>
          <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
          {[0, 1, 2].map((i) => <Skeleton key={i} height={56} style={{ marginBottom: 12 }} />)}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: 20 }}><Skeleton width="50%" height={15} style={{ marginBottom: 13 }} /><Skeleton height={48} /></Card>
          <Card style={{ padding: 20 }}><Skeleton width="50%" height={15} style={{ marginBottom: 13 }} /><Skeleton height={48} /></Card>
        </div>
      </div>
    </div>
  );
}
