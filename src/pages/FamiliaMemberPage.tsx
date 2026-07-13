import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MemberHistoryView } from '../components/family/MemberHistoryView';
import { useFamilyMembers, useMemberData } from '../hooks/useFamily';

/**
 * Vista de SOLO LECTURA del historial de un miembro del grupo familiar. Solo
 * accesible por el owner (envuelta en `FamilyOwnerRoute`). El nombre y la
 * relación se resuelven desde `useFamilyMembers()`; los datos médicos vienen de
 * `useMemberData(memberId)`.
 */
export default function FamiliaMemberPage() {
  const { memberId = '' } = useParams();
  const navigate = useNavigate();
  const { data: members = [] } = useFamilyMembers();
  const member = members.find((m) => m.id === memberId);
  const data = useMemberData(memberId);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/familia')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: 'var(--purple)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            marginBottom: 12,
          }}
        >
          ← Volver a mi grupo familiar
        </button>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>
          {member
            ? `Historial de ${member.nombre} (${member.relationship})`
            : 'Historial del miembro'}
        </h1>
      </div>

      <MemberHistoryView
        history={data.history}
        medications={data.medications}
        exams={data.exams}
        allergies={data.allergies}
        vaccines={data.vaccines}
        isLoading={data.isLoading}
      />
      {/* Sin controles de edición/creación/borrado (R26). */}
    </div>
  );
}
