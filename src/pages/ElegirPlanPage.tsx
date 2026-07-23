import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetPlan } from '../hooks/usePlan';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { CardPaymentModal } from '../components/modals/CardPaymentModal';
import { extractError } from '../utils/format';
import { useAuthStore } from '../store/auth.store';
import type { Plan, SubscriptionState } from '../types';
import { PLANS, type PlanCard } from '../utils/plans';

export default function ElegirPlanPage() {
  const navigate = useNavigate();
  const setPlan = useSetPlan();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // R8: preselecciona la tarjeta del plan actual del usuario al montar
  // (useState perezoso — solo se evalúa en el primer render, no pisa una
  // elección en curso del usuario si el store cambia más tarde).
  const [selected, setSelected] = useState<Plan | null>(() => user?.plan ?? null);

  // Modal de pago con tarjeta (Pro/Family) — ver design.md §4. El checkout ya
  // no redirige a un dominio externo (R4): abre CardPaymentModal, que
  // tokeniza la tarjeta y llama a POST /payments/checkout de forma síncrona.
  const [cardModal, setCardModal] = useState<{
    open: boolean;
    plan: Extract<Plan, 'pro' | 'family'> | null;
  }>({ open: false, plan: null });

  // Plan pagado confirmado por el backend (via CardPaymentModal.onSuccess) —
  // reutiliza el bloque de éxito visual ya existente para el camino Free,
  // adaptado para leer el plan comprado (design.md §4, paso 7).
  const [paidPlan, setPaidPlan] = useState<Plan | null>(null);

  const choose = (id: Plan) => {
    setSelected(id);
    if (id === 'free') {
      setPlan.mutate('free'); // R1 — Free sigue igual, sin checkout
    } else {
      setCardModal({ open: true, plan: id }); // R2, R3, R4 — abre el formulario de tarjeta embebido
    }
  };

  const handleCardSuccess = (state: SubscriptionState) => {
    // R1 (design §4 paso 7): sincroniza el store de auth con el plan
    // confirmado por el backend en cuanto el pago queda confirmado, sin
    // esperar a un nuevo login/refresh.
    if (user && user.plan !== state.plan) {
      setUser({ ...user, plan: state.plan });
    }
    setCardModal({ open: false, plan: null });
    setPaidPlan(state.plan);
  };

  const selectedPlan = PLANS.find((p) => p.id === selected);
  const paidPlanCard = PLANS.find((p) => p.id === paidPlan);

  // ── Estado success (Free o Pro/Family vía tarjeta) ───────────────────────
  if (setPlan.isSuccess || paidPlan) {
    const nombre = paidPlan ? (paidPlanCard?.nombre ?? paidPlan) : (selectedPlan?.nombre ?? '');
    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <div style={successIconStyle}>
            <Icon name="check" size={30} color="#fff" />
          </div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
            ¡Plan {nombre} activado!
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

  // ── Estado error (Free) ──────────────────────────────────────────────────
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

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} disabled={loading}>
            Volver
          </Button>
        </div>
      </div>

      {cardModal.plan && (
        <CardPaymentModal
          open={cardModal.open}
          plan={cardModal.plan}
          onClose={() => setCardModal({ open: false, plan: null })}
          onSuccess={handleCardSuccess}
        />
      )}
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
