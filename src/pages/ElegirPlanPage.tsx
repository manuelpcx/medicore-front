import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetPlan } from '../hooks/usePlan';
import {
  useSubscription,
  useCheckout,
  getPendingCheckoutPlan,
  clearPendingCheckoutPlan,
} from '../hooks/usePayments';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { extractError } from '../utils/format';
import { useAuthStore } from '../store/auth.store';
import type { Plan } from '../types';
import { PLANS, type PlanCard } from '../utils/plans';

export default function ElegirPlanPage() {
  const navigate = useNavigate();
  const setPlan = useSetPlan();
  const checkout = useCheckout();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // R8: preselecciona la tarjeta del plan actual del usuario al montar
  // (useState perezoso — solo se evalúa en el primer render, no pisa una
  // elección en curso del usuario si el store cambia más tarde).
  const [selected, setSelected] = useState<Plan | null>(() => user?.plan ?? null);

  // R5/R9: se lee UNA sola vez al montar (useState perezoso, design.md §6) para
  // que la rama activa ("regreso del checkout" vs. selección normal) no cambie
  // a mitad de una sesión de render; el botón de R8 la resetea a null a
  // propósito para volver a la selección sin recargar la página.
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(() => getPendingCheckoutPlan());
  // Hook siempre invocado (regla de hooks): `enabled` es lo que evita la
  // consulta a GET /payments/subscription cuando no hay marcador (R5).
  const sub = useSubscription({ poll: true, enabled: !!pendingPlan });

  // Efecto: limpia el marcador de sessionStorage solo cuando el resultado del
  // regreso del checkout ya quedó determinado (éxito R7 o fallido/cancelado
  // R8). Mientras siga 'pending' (R6) o la consulta esté en error (R9) el
  // marcador se conserva para poder reintentar en un siguiente montaje.
  useEffect(() => {
    if (!pendingPlan || !sub.data) return;
    const isSuccess = sub.data.status === 'active' && sub.data.plan === pendingPlan;
    const isFailed = sub.data.status !== 'pending' && !isSuccess;
    if (isSuccess || isFailed) clearPendingCheckoutPlan();
    // R1: sincroniza el store de auth con el plan confirmado por el backend
    // (sub.data.plan, fuente fresca de GET /payments/subscription) en cuanto
    // el pago queda confirmado, sin esperar a un nuevo login/refresh. El
    // guard de valor (user.plan !== sub.data.plan) es obligatorio: evita que
    // el efecto vuelva a llamar setUser en cada render disparado por su
    // propia actualización del store (bucle infinito), ya que `user` cambia
    // de referencia en cada setUser y está en las dependencias del efecto.
    if (isSuccess && user && user.plan !== sub.data.plan) {
      setUser({ ...user, plan: sub.data.plan });
    }
  }, [pendingPlan, sub.data, user, setUser]);

  const choose = (id: Plan) => {
    setSelected(id);
    if (id === 'free') {
      setPlan.mutate('free'); // R1 — Free sigue igual, sin checkout
    } else {
      checkout.mutate(id); // R2, R3, R4 — Pro/Family via MercadoPago
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selected);
  const pendingPlanCard = PLANS.find((p) => p.id === pendingPlan);

  // ── Rama: regreso desde el checkout de MercadoPago (gate R5) ──────────────
  if (pendingPlan) {
    if (sub.isLoading) {
      return (
        <div style={pageStyle}>
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <Icon name="clock" size={30} color="var(--accent)" style={{ marginBottom: 16 }} />
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
              Verificando el pago…
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
              Estamos confirmando el resultado de tu pago.
            </p>
            <CardSkeleton />
          </div>
        </div>
      );
    }

    if (sub.isError) {
      return (
        <div style={pageStyle}>
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <div style={errorIconStyle}>
              <Icon name="alert" size={28} color="var(--red)" />
            </div>
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
              No pudimos verificar el pago
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
              {extractError(sub.error)}
            </p>
            <Button size="lg" onClick={() => sub.refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    if (sub.data) {
      const isSuccess = sub.data.status === 'active' && sub.data.plan === pendingPlan;

      // R7 — pago confirmado
      if (isSuccess) {
        return (
          <div style={pageStyle}>
            <div style={{ ...panelStyle, textAlign: 'center' }}>
              <div style={successIconStyle}>
                <Icon name="check" size={30} color="#fff" />
              </div>
              <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
                ¡Pago confirmado!
              </h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
                Tu plan {pendingPlanCard?.nombre ?? pendingPlan} ya está activo.
              </p>
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Ir al dashboard
              </Button>
            </div>
          </div>
        );
      }

      // R6 — pago pendiente de confirmación (webhook puede tardar)
      if (sub.data.status === 'pending') {
        return (
          <div style={pageStyle}>
            <div style={{ ...panelStyle, textAlign: 'center' }}>
              <Icon name="clock" size={30} color="var(--accent)" style={{ marginBottom: 16 }} />
              <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
                Pago pendiente de confirmación
              </h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                MercadoPago todavía no confirma tu pago; la confirmación puede
                tardar unos minutos. Esta pantalla se actualiza sola cada
                pocos segundos.
              </p>
              <CardSkeleton />
              <div style={{ marginTop: 20 }}>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => sub.refetch()}
                  loading={sub.isFetching}
                >
                  Verificar de nuevo
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // R8 — pago fallido o cancelado por el usuario en el checkout
      // (status === null / plan reportado distinto del solicitado)
      return (
        <div style={pageStyle}>
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <div style={errorIconStyle}>
              <Icon name="alert" size={28} color="var(--red)" />
            </div>
            <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
              El pago no se completó
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              No detectamos un pago confirmado. Puede que hayas cancelado el
              proceso de pago o que el pago haya sido rechazado.
            </p>
            <Button size="lg" onClick={() => setPendingPlan(null)}>
              Elegir un plan
            </Button>
          </div>
        </div>
      );
    }

    // Estado transitorio imposible en la práctica (ni loading, ni error, ni
    // data): se mantiene el skeleton para no dejar la pantalla en blanco.
    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // ── Estado success (Free) ────────────────────────────────────────────────
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

  // ── Estado error de checkout (Pro/Family) — R10, R11 ─────────────────────
  // extractError ya devuelve el mensaje real del backend: distingue 503
  // ("Pagos con MercadoPago no están disponibles...") de 409 ("Ya tienes una
  // suscripción en curso."), sin lógica de mapeo adicional en el frontend.
  if (checkout.isError) {
    return (
      <div style={pageStyle}>
        <div style={{ ...panelStyle, textAlign: 'center' }}>
          <div style={errorIconStyle}>
            <Icon name="alert" size={28} color="var(--red)" />
          </div>
          <h1 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
            No se pudo iniciar el pago
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
            {extractError(checkout.error)}
          </p>
          <Button
            size="lg"
            onClick={() => (selected === 'pro' || selected === 'family') && checkout.mutate(selected)}
            disabled={selected !== 'pro' && selected !== 'family'}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // ── Estado empty (defecto) + loading (skeleton) ───────────────────────────
  const loading = setPlan.isPending || checkout.isPending;

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
