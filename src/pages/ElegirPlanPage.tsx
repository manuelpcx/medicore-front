import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetPlan } from '../hooks/usePlan';
import { useSubscription } from '../hooks/usePayments';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { CardPaymentModal } from '../components/modals/CardPaymentModal';
import { extractError } from '../utils/format';
import { useAuthStore } from '../store/auth.store';
import type { Plan, SubscriptionState } from '../types';
import { PLANS, type PlanCard } from '../utils/plans';

// R25 — tiempo acotado de polling antes de mostrar "esto está tardando más
// de lo normal" (ver specs/mercadopago-activar-plan-en-cobro-real/design.md §1.4).
const CONFIRM_TIMEOUT_MS = 60_000;

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

  // Plan pagado y ya ACTIVO (confirmado por el backend, vía webhook/reconciliación
  // del cobro real, detectado por el polling de abajo) — reutiliza el bloque
  // de éxito visual ya existente para el camino Free (design.md §4/§5 paso 8).
  const [paidPlan, setPaidPlan] = useState<Plan | null>(null);

  // ── Confirmación diferida del cobro real (R23-R26) ───────────────────────
  // Tras `checkout()` con `status:'pending'` (esta feature: el checkout ya no
  // activa el plan de inmediato, solo verifica la tarjeta), se activa este
  // sub-estado "confirmando" que hace polling a GET /payments/subscription
  // hasta detectar `active` (éxito), el retorno a `free` (cobro real
  // rechazado) o un timeout acotado (R25).
  const [confirming, setConfirming] = useState<{ plan: Extract<Plan, 'pro' | 'family'> } | null>(null);
  const [confirmRejected, setConfirmRejected] = useState(false);
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);
  // Fix bug lectura-stale-rechazo-falso (R1): marca el instante en que se
  // activa `confirming` para el pago en curso, para poder descartar
  // lecturas de `confirmPoll` anteriores a ese instante (caché stale de
  // antes de pagar o de un intento previo).
  const confirmStartedAtRef = useRef(0);

  const confirmPoll = useSubscription({ poll: true, enabled: !!confirming && !confirmRejected && !confirmTimedOut });

  // R24 — la suscripción pasó a 'active': sincroniza el store de auth y
  // muestra el bloque de éxito final ya existente, deteniendo el polling
  // (confirming pasa a null -> `enabled` de useSubscription queda en false).
  // R26 — la suscripción ya no está vigente (status null, plan free) tras
  // haber estado 'pending': el cobro real fue rechazado.
  useEffect(() => {
    if (!confirming || confirmRejected || confirmTimedOut) return;
    const data = confirmPoll.data;
    if (!data) return;
    // Fix bug lectura-stale-rechazo-falso (R2, R3, R4, R6): ignora
    // cualquier lectura anterior al inicio de la confirmación actual (dato
    // cacheado de antes de pagar / de un intento previo).
    if (confirmPoll.dataUpdatedAt < confirmStartedAtRef.current) return;
    if (data.status === 'active') {
      if (user && user.plan !== data.plan) {
        setUser({ ...user, plan: data.plan });
      }
      setPaidPlan(data.plan);
      setConfirming(null);
    } else if (data.status === null) {
      setConfirmRejected(true);
    }
  }, [confirmPoll.data, confirmPoll.dataUpdatedAt, confirming, confirmRejected, confirmTimedOut, user, setUser]);

  // R25 — timeout acotado: si sigue "confirmando" sin resolución, se detiene
  // el polling activo (enabled pasa a false) y se muestra la vía de escape.
  useEffect(() => {
    if (!confirming || confirmRejected) return;
    const timer = window.setTimeout(() => setConfirmTimedOut(true), CONFIRM_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [confirming, confirmRejected]);

  const choose = (id: Plan) => {
    setSelected(id);
    if (id === 'free') {
      setPlan.mutate('free'); // R1 — Free sigue igual, sin checkout
    } else {
      setCardModal({ open: true, plan: id }); // R2, R3, R4 — abre el formulario de tarjeta embebido
    }
  };

  const handleCardSuccess = (state: SubscriptionState) => {
    setCardModal({ open: false, plan: null });
    if (state.status === 'active') {
      // Defensivo: con el backend actual `checkout()` ya nunca devuelve
      // 'active' de forma síncrona, pero si algún día volviera a hacerlo,
      // no tiene sentido pasar por el estado "confirmando".
      if (user && user.plan !== state.plan) {
        setUser({ ...user, plan: state.plan });
      }
      setPaidPlan(state.plan);
      return;
    }
    // R23 — `status:'pending'`: la tarjeta quedó verificada, el cobro real se
    // está confirmando. Activa el sub-estado "confirmando" en vez del bloque
    // de éxito final.
    // Fix bug lectura-stale-rechazo-falso (R1, R5): fija el timestamp de
    // inicio ANTES de activar `confirming` (síncrono, no pasa por el ciclo
    // de commit de React), para que la guardia de frescura del useEffect de
    // arriba pueda descartar cualquier lectura cacheada previa a este pago.
    confirmStartedAtRef.current = Date.now();
    setConfirmRejected(false);
    setConfirmTimedOut(false);
    setConfirming({ plan: state.plan as Extract<Plan, 'pro' | 'family'> });
  };

  const retryAfterRejection = () => {
    const plan = confirming?.plan ?? selected;
    setConfirming(null);
    setConfirmRejected(false);
    setConfirmTimedOut(false);
    if (plan && plan !== 'free') {
      setCardModal({ open: true, plan });
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selected);
  const paidPlanCard = PLANS.find((p) => p.id === paidPlan);
  const confirmingPlanCard = PLANS.find((p) => p.id === confirming?.plan);

  // ── Estado "confirmando" (Pro/Family, cobro real en curso) ────────────────
  // R23-R26: tarjeta ya verificada, esperando que el webhook/reconciliación
  // del backend confirme el cobro real. No es el bloque de éxito final (ese
  // requiere status:'active', más abajo).
  if (confirming) {
    if (confirmRejected) {
      return (
        <div style={pageStyle}>
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <div style={errorIconStyle}>
              <Icon name="alert" size={28} color="var(--red)" />
            </div>
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
              El pago no pudo confirmarse
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              MercadoPago no pudo confirmar el cobro de tu plan{' '}
              {confirmingPlanCard?.nombre ?? confirming.plan}. Tu plan sigue en Free — puedes
              intentarlo de nuevo con la misma tarjeta u otra.
            </p>
            <Button size="lg" onClick={retryAfterRejection}>
              Reintentar pago
            </Button>
          </div>
        </div>
      );
    }

    if (confirmTimedOut) {
      return (
        <div style={pageStyle}>
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <div style={successIconStyle}>
              <Icon name="clock" size={28} color="#fff" />
            </div>
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
              Esto está tardando más de lo normal
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Seguimos confirmando el pago de tu plan{' '}
              {confirmingPlanCard?.nombre ?? confirming.plan} con MercadoPago. Puedes seguir
              usando MediHistory mientras tanto — verás tu plan actualizado en tu Perfil en
              cuanto se confirme.
            </p>
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Ir al dashboard
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <div style={successIconStyle}>
            <Icon name="clock" size={28} color="#fff" />
          </div>
          <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
            Confirmando tu pago…
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Tu tarjeta quedó verificada. Estamos confirmando el cobro de tu plan{' '}
            {confirmingPlanCard?.nombre ?? confirming.plan} con MercadoPago — esto no bloquea tu
            sesión, puedes seguir usando MediHistory mientras se confirma.
          </p>
          <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
            Ir al dashboard mientras se confirma
          </Button>
        </div>
      </div>
    );
  }

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
