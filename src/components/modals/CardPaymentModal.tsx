import React, { useEffect, useState } from 'react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { CardSkeleton } from '../ui/Skeleton';
import { useCheckout } from '../../hooks/usePayments';
import { extractSpecificError } from '../../utils/format';
import { useAuthStore } from '../../store/auth.store';
import { PLANS } from '../../utils/plans';
import type { Plan, SubscriptionState } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  plan: Extract<Plan, 'pro' | 'family'>;
  onSuccess: (state: SubscriptionState) => void;
}

/**
 * Modal de pago con tarjeta (MercadoPago Checkout Bricks). Reemplaza el
 * redirect a `init_point` de `#41`/`#42` — el número de tarjeta/CVV se
 * capturan DENTRO del iframe que monta `<CardPayment>` (R1); nunca llegan a
 * `medicore-frontend` como texto plano ni se envían a `medicore-backend`
 * (R2, R3). Solo el `token` que genera el Brick viaja a nuestro backend.
 *
 * Estados (regla no-solo-camino-feliz, R5–R9):
 * - `!ready` (antes de `onReady`): skeleton de carga sobre el Brick, que
 *   igual está montado (oculto con `visibility:hidden`) para que MercadoPago
 *   pueda medir/renderizar el iframe con normalidad.
 * - `ready` (tras `onReady`, sin envío aún): formulario listo.
 * - envío en curso (`submitting`): el propio Brick deshabilita su botón; se
 *   suma un indicador textual.
 * - `errorMessage` seteado: banner de error ENCIMA del Brick (no lo oculta,
 *   ni antes de `onSubmit` — `onError` del Brick, R8 — ni después — rechazo
 *   del backend, R9) para permitir reintentar sin recargar (el Brick
 *   reactiva su propio formulario cuando la Promise de `onSubmit` rechaza).
 * - `success`: reemplaza el formulario por la confirmación (R7) y dispara
 *   `onSuccess` tras un breve delay visual.
 *
 * R10: `POST /payments/checkout` (`checkout.mutateAsync`) SOLO se llama
 * dentro de `onSubmit`, es decir, solo si el usuario efectivamente envía el
 * formulario de tarjeta — cerrar el modal antes de eso no dispara ninguna
 * llamada de red.
 */
let mpInitialized = false;

export function CardPaymentModal({ open, onClose, plan, onSuccess }: Props) {
  const user = useAuthStore((s) => s.user);
  const checkout = useCheckout();
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as string | undefined;
  const planCard = PLANS.find((p) => p.id === plan);
  const montoMensual = planCard?.montoMensual ?? 0;

  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubscriptionState | null>(null);

  // Reinicia el estado local cada vez que el modal se abre (o cambia de
  // plan) — evita arrastrar un error/éxito de una apertura anterior.
  useEffect(() => {
    if (!open) return;
    setReady(false);
    setSubmitting(false);
    setErrorMessage(null);
    setSuccess(null);
    if (publicKey && !mpInitialized) {
      initMercadoPago(publicKey, { locale: 'es-CL' }); // singleton — una sola vez
      mpInitialized = true;
    }
  }, [open, plan, publicKey]);

  if (!open) return null;

  // R11, R12 — sin PUBLIC KEY configurada: error explícito, el Brick NUNCA
  // se monta (ni pantalla en blanco ni excepción no capturada).
  if (!publicKey) {
    return (
      <Modal open={open} onClose={onClose} title="Pagar con tarjeta" maxWidth={440}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={errorIconStyle}>
            <Icon name="alert" size={26} color="var(--red)" />
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            El pago con tarjeta no está disponible en este momento (falta la
            configuración de MercadoPago). Contacta a soporte o inténtalo más
            tarde.
          </p>
          <Button size="lg" onClick={onClose}>Cerrar</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={success ? undefined : `Pagar plan ${planCard?.nombre ?? ''}`}
      maxWidth={480}
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={successIconStyle}>
            <Icon name="check" size={26} color="#fff" />
          </div>
          <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
            ¡Pago confirmado!
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Tu plan {planCard?.nombre ?? plan} ya está activo.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
            Ingresa los datos de tu tarjeta. MercadoPago procesa el pago de
            forma segura dentro de este formulario — Medicore nunca ve ni
            guarda tu número de tarjeta.
          </p>

          {errorMessage && (
            <div style={errorBannerStyle}>
              <Icon name="alert" size={16} color="var(--red)" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ position: 'relative', minHeight: ready ? undefined : 220 }}>
            {!ready && (
              <div style={loadingOverlayStyle}>
                <CardSkeleton />
                <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 10 }}>
                  Cargando formulario de pago…
                </p>
              </div>
            )}

            <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
              <CardPayment
                key={plan}
                initialization={{ amount: montoMensual, payer: { email: user?.email } }}
                customization={{ paymentMethods: { maxInstallments: 1 } }}
                locale="es-CL"
                onReady={() => setReady(true)} // R5, R6
                onError={(error) => {
                  // R8 — error de validación/tokenización ANTES de onSubmit,
                  // sin llamar a nuestro backend.
                  setErrorMessage(
                    error.message ||
                      error.cause ||
                      'No se pudieron validar los datos de la tarjeta. Verifica e intenta de nuevo.',
                  );
                }}
                onSubmit={async (cardData) => {
                  setSubmitting(true);
                  setErrorMessage(null);
                  try {
                    const state = await checkout.mutateAsync({ plan, cardTokenId: cardData.token }); // R2, R3, R10
                    setSubmitting(false);
                    setSuccess(state); // R7
                    window.setTimeout(() => onSuccess(state), 900);
                  } catch (err) {
                    setSubmitting(false);
                    // R9 — mensaje ESPECÍFICO del backend (no el genérico por
                    // status que `HttpExceptionFilter` pone en `data.message`,
                    // ver `extractSpecificError()`): p. ej. el texto real que
                    // arma `sanitizeCheckoutError()` para una tarjeta rechazada.
                    setErrorMessage(extractSpecificError(err));
                    throw err; // re-lanza: el Brick reactiva su formulario (contrato de onSubmit)
                  }
                }}
              />
            </div>
          </div>

          {submitting && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 12 }}>
              Procesando pago…
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ── Styles ── */
const errorIconStyle: React.CSSProperties = {
  width: 56, height: 56, borderRadius: '50%', background: 'var(--red2)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
};
const successIconStyle: React.CSSProperties = {
  width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
};
const errorBannerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 8,
  background: 'var(--red2)', color: 'var(--red)', borderRadius: 8,
  padding: '10px 12px', fontSize: 13, lineHeight: 1.5, marginBottom: 14,
};
const loadingOverlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
};
