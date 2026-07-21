import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetPlan } from '../hooks/usePlan';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { extractError } from '../utils/format';
import type { Plan } from '../types';

// ── Catálogo estático (no hay endpoint GET /plans) ──────────────────────────
interface PlanCard {
  id: Plan;
  nombre: string;
  precio: string;
  color: string;
  features: string[];
}

const PLANS: readonly PlanCard[] = [
  {
    id: 'free',
    nombre: 'Free',
    precio: '$0',
    color: 'var(--accent)',
    features: ['Historial personal', 'Hasta 4 exámenes con archivo', 'Alergias y vacunas'],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: '$4.990/mes',
    color: 'var(--accent)',
    features: ['Todo lo de Free', 'Exámenes con archivo ilimitados'],
  },
  {
    id: 'family',
    nombre: 'Family',
    precio: '$8.990/mes',
    color: 'var(--purple)',
    features: [
      'Todo lo de Pro',
      'Hasta 5 personas en tu grupo: familiares + menores',
      'Agregar menores a tu cargo (exclusivo Family)',
    ],
  },
] as const;

export default function ElegirPlanPage() {
  const navigate = useNavigate();
  const setPlan = useSetPlan();
  const [selected, setSelected] = useState<Plan | null>(null);

  const choose = (id: Plan) => {
    setSelected(id);
    setPlan.mutate(id);
  };

  const selectedPlan = PLANS.find((p) => p.id === selected);

  // ── Estado success ────────────────────────────────────────────────────────
  if (setPlan.isSuccess) {
    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <div style={successIconStyle}>
            <Icon name="check" size={30} color="#fff" />
          </div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
            ¡Plan {selectedPlan?.nombre ?? ''} activado!
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
            Tu plan quedó activo. Ya puedes empezar a usar MediHistory.
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Ir al dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ── Estado error ──────────────────────────────────────────────────────────
  if (setPlan.isError) {
    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <div style={errorIconStyle}>
            <Icon name="alert" size={28} color="var(--red)" />
          </div>
          <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
            No se pudo activar el plan
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
            {extractError(setPlan.error)}
          </p>
          <Button size="lg" onClick={() => selected && setPlan.mutate(selected)} disabled={!selected}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // ── Estado empty (defecto) + loading (skeleton) ───────────────────────────
  const loading = setPlan.isPending;

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={logoStyle}>M</div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 6 }}>
            Elige tu plan
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Elige el plan que más te convenga
          </p>
        </div>

        <div style={gridStyle}>
          {loading
            ? PLANS.map((p) => <CardSkeleton key={p.id} />)
            : PLANS.map((p) => (
                <PlanTile
                  key={p.id}
                  plan={p}
                  selected={selected === p.id}
                  disabled={loading}
                  onSelect={() => choose(p.id)}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de plan seleccionable ───────────────────────────────────────────
function PlanTile({
  plan, selected, disabled, onSelect,
}: {
  plan: PlanCard;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      style={{
        textAlign: 'left',
        background: 'var(--surface)',
        border: `2px solid ${selected ? plan.color : 'var(--border)'}`,
        borderRadius: 'var(--radius-card)',
        padding: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: plan.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {plan.nombre}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
          {plan.precio}
        </div>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
            <Icon name="check" size={15} color={plan.color} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div
        style={{
          marginTop: 'auto',
          borderRadius: 'var(--radius-btn)',
          padding: '9px 12px',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          background: selected ? plan.color : 'var(--surface2)',
          color: selected ? '#fff' : 'var(--text2)',
        }}
      >
        {selected ? 'Seleccionado' : 'Elegir este plan'}
      </div>
    </button>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = {
  minHeight: '100vh', background: 'var(--bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const panelStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)', padding: '36px 32px',
  width: '100%', maxWidth: 820, boxShadow: 'var(--shadow)',
  animation: 'fadeIn 0.2s ease',
};
const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
};
const logoStyle: React.CSSProperties = {
  width: 48, height: 48, background: 'var(--accent)', borderRadius: 12,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontFamily: 'DM Serif Display, serif', fontSize: 22, marginBottom: 10,
};
const successIconStyle: React.CSSProperties = {
  width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
};
const errorIconStyle: React.CSSProperties = {
  width: 60, height: 60, borderRadius: '50%', background: 'var(--red2)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
};
