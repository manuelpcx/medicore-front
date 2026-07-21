import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useAcceptInvitation } from '../hooks/useFamily';
import { extractError } from '../utils/format';
import { Button } from '../components/ui/Button';

/**
 * Página pública de aceptación de invitación familiar. Coincide con la ruta
 * `/family/accept/:invitationId` que arma el correo del backend
 * (`family.service.ts`). Decide el flujo según autenticación:
 *  - sin `invitationId` → estado vacío accionable.
 *  - sin sesión → ofrece registrarse (principal) o iniciar sesión, conservando
 *    el destino vía `returnTo`.
 *  - con sesión → dispara `acceptInvitation` una sola vez y renderiza los 4
 *    estados con calidad real (loading / success / error).
 */
export default function AceptarInvitacionPage(): JSX.Element {
  const { invitationId } = useParams<{ invitationId: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const navigate = useNavigate();
  const accept = useAcceptInvitation();
  const firedRef = useRef(false);

  // returnTo interno hacia esta misma página (para register/login).
  const returnTo = invitationId ? `/family/accept/${invitationId}` : '';
  const encodedReturnTo = encodeURIComponent(returnTo);

  // Disparo único de la mutación (seguro con StrictMode y re-renders). R11.
  useEffect(() => {
    if (isAuthenticated && invitationId && !firedRef.current) {
      firedRef.current = true;
      accept.mutate(invitationId);
    }
    // `accept` es estable entre renders (mutation object); no se incluye para
    // evitar re-disparos. La guardia `firedRef` garantiza una sola invocación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, invitationId]);

  // Éxito (incluye idempotencia "ya aceptada"): toast (del hook) + /familia. R13, R18.
  useEffect(() => {
    if (accept.isSuccess) {
      const t = setTimeout(() => navigate('/familia', { replace: true }), 900);
      return () => clearTimeout(t);
    }
  }, [accept.isSuccess, navigate]);

  // ── Estado: enlace inválido (sin invitationId) ── R14 ──────────────────────
  if (!invitationId) {
    return (
      <Shell>
        <StatusIcon tone="warn" />
        <h1 style={titleStyle}>Enlace de invitación inválido</h1>
        <p style={textStyle}>
          El enlace que abriste no incluye una invitación válida. Revisa el
          correo o pide que te reenvíen la invitación.
        </p>
        <div style={actionsStyle}>
          <Button size="lg" onClick={() => navigate('/familia')}>
            Ir a mi grupo familiar
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Estado: no autenticado → elección registro/login ── R4, R5, R6 ─────────
  if (!isAuthenticated) {
    return (
      <Shell>
        <StatusIcon tone="purple" />
        <h1 style={titleStyle}>Te invitaron a un grupo familiar</h1>
        <p style={textStyle}>
          Para aceptar la invitación necesitas una cuenta. Crea una con el
          mismo correo al que llegó la invitación o inicia sesión si ya la
          tienes.
        </p>
        <div style={actionsStyle}>
          <Link to={`/register?returnTo=${encodedReturnTo}`} style={{ textDecoration: 'none' }}>
            <Button size="lg" style={{ width: '100%' }}>Crear cuenta</Button>
          </Link>
          <Link to={`/login?returnTo=${encodedReturnTo}`} style={{ textDecoration: 'none' }}>
            <Button size="lg" variant="secondary" style={{ width: '100%' }}>
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Estado: cargando ── R12 ────────────────────────────────────────────────
  if (accept.isPending || accept.isIdle) {
    return (
      <Shell>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Spinner />
        </div>
        <h1 style={titleStyle}>Aceptando tu invitación…</h1>
        <p style={textStyle}>Un momento, estamos uniéndote al grupo familiar.</p>
      </Shell>
    );
  }

  // ── Estado: éxito ── R13, R18 ──────────────────────────────────────────────
  if (accept.isSuccess) {
    return (
      <Shell>
        <StatusIcon tone="success" />
        <h1 style={titleStyle}>¡Invitación aceptada!</h1>
        <p style={textStyle}>
          Ya formas parte del grupo familiar. Te llevamos a tu grupo…
        </p>
        <div style={actionsStyle}>
          <Button size="lg" onClick={() => navigate('/familia', { replace: true })}>
            Ir a mi grupo familiar
          </Button>
        </div>
      </Shell>
    );
  }

  // ── Estado: error mapeado ── R15, R16, R17, R19 ────────────────────────────
  const status =
    (accept.error as { response?: { status?: number } } | null)?.response?.status;

  let message: string;
  let showRetry = false;
  if (status === 404) {
    message = 'Esta invitación no existe o fue cancelada.';
  } else if (status === 403) {
    message =
      'Esta invitación no está dirigida a tu cuenta. Inicia sesión con el correo al que llegó la invitación.';
  } else if (status === 400) {
    message = 'El enlace de invitación no es válido.';
  } else {
    // Errores no deterministas (red / 500): mostrar motivo + permitir reintentar.
    message = extractError(accept.error);
    showRetry = true;
  }

  const retry = () => {
    accept.reset();
    firedRef.current = false;
    if (invitationId) {
      firedRef.current = true;
      accept.mutate(invitationId);
    }
  };

  return (
    <Shell>
      <StatusIcon tone="error" />
      <h1 style={titleStyle}>No pudimos aceptar la invitación</h1>
      <p style={textStyle}>{message}</p>
      <div style={actionsStyle}>
        {showRetry && (
          <Button size="lg" onClick={retry}>Reintentar</Button>
        )}
        <Button
          size="lg"
          variant={showRetry ? 'secondary' : 'primary'}
          onClick={() => navigate('/familia')}
        >
          Ir a mi grupo familiar
        </Button>
      </div>
    </Shell>
  );
}

/* ── UI helpers (reutilizan primitivos y el patrón visual de LoginPage) ── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center' }}>{children}</div>
      </div>
    </div>
  );
}

function StatusIcon({ tone }: { tone: 'purple' | 'success' | 'error' | 'warn' }) {
  const map: Record<string, { bg: string; color: string; glyph: string }> = {
    purple: { bg: 'var(--purple2, #ede9fe)', color: 'var(--purple, #7c3aed)', glyph: '♥' },
    success: { bg: 'var(--green2, #dcfce7)', color: 'var(--green, #16a34a)', glyph: '✓' },
    error: { bg: 'var(--red2)', color: 'var(--red)', glyph: '!' },
    warn: { bg: 'var(--amber2, #fef3c7)', color: 'var(--amber, #d97706)', glyph: '?' },
  };
  const s = map[tone];
  return (
    <div
      style={{
        width: 56, height: 56, borderRadius: 16, background: s.bg, color: s.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, fontWeight: 600, marginBottom: 18,
      }}
    >
      {s.glyph}
    </div>
  );
}

function Spinner() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" style={{ animation: 'spin 0.7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--purple, #7c3aed)" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="var(--purple, #7c3aed)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Styles ── */
const pageStyle: React.CSSProperties = {
  minHeight: '100vh', background: 'var(--bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const cardStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)', padding: '40px 36px',
  width: '100%', maxWidth: 460, boxShadow: 'var(--shadow)',
  animation: 'fadeIn 0.2s ease',
};
const titleStyle: React.CSSProperties = {
  fontSize: 24, fontWeight: 500, marginBottom: 10, color: 'var(--text)',
};
const textStyle: React.CSSProperties = {
  color: 'var(--text2)', fontSize: 15, lineHeight: 1.5, marginBottom: 24,
};
const actionsStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 12,
};
