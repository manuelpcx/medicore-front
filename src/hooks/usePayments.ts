import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import type { Plan } from '../types';

// ── Hooks React Query ────────────────────────────────────────────────────────

const SUBSCRIPTION_KEY = ['payments', 'subscription'];

/**
 * GET /payments/subscription. PerfilPage la usa con `poll: false` (una sola
 * consulta + refetch manual/invalidación tras cancelar, R12–R19). Ya no hay
 * "regreso del checkout" que pollear (feature `mercadopago-checkout-bricks-
 * tarjeta`, R14: el resultado del checkout es síncrono, no un redirect).
 */
export function useSubscription(options?: { poll?: boolean; enabled?: boolean }) {
  return useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: paymentsApi.getSubscription,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.poll
      ? (query) => (query.state.data?.status === 'pending' ? 3000 : false)
      : false,
  });
}

/**
 * POST /payments/checkout. `cardTokenId` viene del Brick `<CardPayment>`
 * (`CardPaymentModal`). Ya no redirige a un `init_point` externo: el backend
 * responde `SubscriptionState` de forma síncrona; en éxito se invalida
 * `['payments','subscription']` para refrescar cualquier vista que dependa
 * del plan vigente.
 */
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ plan, cardTokenId }: { plan: Extract<Plan, 'pro' | 'family'>; cardTokenId: string }) =>
      paymentsApi.checkout(plan, cardTokenId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
    },
    // onError: no hay marcador que limpiar ni redirect que evitar — el error
    // se lee con isError/error en CardPaymentModal (R9) y se re-lanza hacia
    // el Brick (contrato de onSubmit, ver design.md §4).
  });
}

/**
 * POST /payments/subscription/cancel. Invalida ['payments','subscription']
 * al éxito para refrescar "Tu plan" (R18); el error se expone vía
 * isError/error para que PerfilPage muestre el mensaje real del backend
 * (R19), sin toast que lo oculte (mismo criterio que useSetPlan en
 * usePlan.ts, que tampoco emite toast de error).
 */
export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => paymentsApi.cancelSubscription(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
    },
  });
}
