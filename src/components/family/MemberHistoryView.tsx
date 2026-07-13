import React from 'react';
import { Card } from '../ui/Card';
import { Badge, tipoBadge, severidadBadge, resultadoBadge } from '../ui/Badge';
import { ListSkeleton } from '../ui/Skeleton';
import { Icon, type IconName } from '../ui/Icon';
import { fDate } from '../../utils/format';
import type {
  MedicalHistory,
  Medication,
  Exam,
  Allergy,
  Vaccine,
} from '../../types';

// Color por tipo de consulta para el punto del timeline (igual que el dashboard).
const TIPO_COLOR: Record<string, string> = {
  control: 'var(--accent)',
  urgencia: 'var(--red)',
  especialidad: 'var(--blue)',
  preventivo: 'var(--purple)',
};

interface Props {
  history: MedicalHistory[];
  medications: Medication[];
  exams: Exam[];
  allergies: Allergy[];
  vaccines: Vaccine[];
  isLoading: boolean;
}

function SectionHeader({ icon, title, count }: { icon: IconName; title: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: 'var(--purple2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={18} color="var(--purple)" />
      </span>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
      <Badge variant="purple" size="sm">{count}</Badge>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{text}</p>;
}

/**
 * Vista de SOLO LECTURA del historial de un miembro del grupo familiar.
 * Replica la presentación del dashboard del paciente con los mismos primitivos
 * (`Card`, `Badge`, `Icon`, `fDate`) SIN ningún control de edición/creación/
 * borrado (R26) y con los exámenes en modo metadatos, sin preview/descarga
 * (R28). No usa hooks acoplados al usuario logueado: se alimenta por props.
 */
export function MemberHistoryView({
  history, medications, exams, allergies, vaccines, isLoading,
}: Props) {
  if (isLoading) return <ListSkeleton count={4} />;

  const activeMeds = medications.filter((m) => m.estado === 'activo');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Historial / timeline */}
      <Card style={{ padding: 22 }}>
        <SectionHeader icon="clipboard" title="Historial clínico" count={history.length} />
        {history.length === 0 ? (
          <Empty text="Sin consultas registradas." />
        ) : (
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {history.map((h) => (
              <div key={h.id} style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: TIPO_COLOR[h.tipo] || 'var(--text3)',
                  border: '3px solid var(--bg)', marginTop: 4, zIndex: 1,
                }} />
                <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{h.especialidad}</span>
                    {tipoBadge(h.tipo)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    {h.doctor}{h.institucion && ` · ${h.institucion}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{fDate(h.fecha)}</div>
                  {h.diagnostico && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, fontSize: 13 }}>
                      <strong>Diagnóstico:</strong> {h.diagnostico}
                    </div>
                  )}
                  {h.notas && (
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
                      {h.notas}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Medicamentos */}
      <Card style={{ padding: 22 }}>
        <SectionHeader icon="pill" title="Medicamentos" count={medications.length} />
        {medications.length === 0 ? (
          <Empty text="Sin medicamentos registrados." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {medications.map((m) => (
              <div key={m.id} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{m.nombre}</span>
                  <Badge variant={m.estado === 'activo' ? 'success' : 'default'} size="sm">
                    {m.estado === 'activo' ? 'Activo' : 'Finalizado'}
                  </Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{m.dosis} · {m.frecuencia}</div>
                {m.horario && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: 'var(--purple)' }}>
                    <Icon name="clock" size={13} strokeWidth={1.8} color="var(--purple)" />
                    <span style={{ fontSize: 11 }}>{m.horario}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {medications.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
            {activeMeds.length} activo{activeMeds.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>

      {/* Exámenes — solo metadatos, sin preview/descarga (R28) */}
      <Card style={{ padding: 22 }}>
        <SectionHeader icon="flask" title="Exámenes" count={exams.length} />
        {exams.length === 0 ? (
          <Empty text="Sin exámenes registrados." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {exams.map((e) => (
              <div key={e.id} style={{ background: 'var(--surface2)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--blue2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="flask" size={16} color="var(--blue)" />
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.nombre}
                  </span>
                </div>
                {resultadoBadge(e.resultado_badge)}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                  {fDate(e.fecha)}{e.laboratorio && ` · ${e.laboratorio}`}
                </div>
                {e.tipo && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.tipo}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Alergias */}
      <Card style={{ padding: 22 }}>
        <SectionHeader icon="alert" title="Alergias" count={allergies.length} />
        {allergies.length === 0 ? (
          <Empty text="Sin alergias registradas." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allergies.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'var(--surface2)', borderRadius: 12, padding: '10px 14px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{a.nombre}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 6 }}>{a.tipo}</span>
                </div>
                {severidadBadge(a.severidad)}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vacunas */}
      <Card style={{ padding: 22 }}>
        <SectionHeader icon="syringe" title="Vacunas" count={vaccines.length} />
        {vaccines.length === 0 ? (
          <Empty text="Sin vacunas registradas." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {vaccines.map((v) => (
              <div key={v.id} style={{ background: 'var(--surface2)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{v.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{fDate(v.fecha)}</div>
                {v.institucion && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{v.institucion}</div>}
                {v.proxima_dosis && (
                  <div style={{ fontSize: 12, color: 'var(--purple)', marginTop: 4 }}>
                    Próxima dosis: {fDate(v.proxima_dosis)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
