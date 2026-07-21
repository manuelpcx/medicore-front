import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import type { Plan } from '../types';

// ── Marcador de "regreso de Flow" (sessionStorage) ──────────────────────────
// Ver design.md §4: el backend construye urlReturn como
// `${frontendBaseUrl}/elegir-plan` sin query params, así que el frontend deja
// su propio marcador en sessionStorage ANTES de redirigir a Flow (R4), para
// poder distinguir al volver a montar ElegirPlanPage entre una visita normal
// (R5) y un regreso desde el checkout (R6-R9).
const FLOW_CHECKOUT_FLAG = 'medicore:flow_checkout_plan';

export function setPendingCheckoutPlan(plan: Plan): void {
  sessionStorage.setItem(FLOW_CHECKOUT_FLAG, plan);
}

export function getPendingCheckoutPlan(): Plan | null {
  return (sessionStorage.getItem(FLOW_CHECKOUT_FLAG) as Plan | null) ?? null;
}

export function clearPendingCheckoutPlan(): void {
  sessionStorage.removeItem(FLOW_CHECKOUT_FLAG);
}

// ── Hooks React Query ────────────────────────────────────────────────────────

const SUBSCRIPTION_KEY = ['payments', 'subscription'];

/**
 * GET /payments/subscription. `poll` habilita refetch automático mientras
 * el estado siga 'pending' (usado por ElegirPlanPage en el regreso de Flow,
 * R6); PerfilPage la usa con `poll: false` (una sola consulta + refetch
 * manual/invalidación tras cancelar, R12–R19).
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
 * POST /payments/checkout. Antes de redirigir registra el marcador de
 * sessionStorage (R4) — así el checkout_url solo se sigue si el registro
 * del marcador ya ocurrió, sin ventana de carrera entre ambos.
 */
export function useCheckout() {
  return useMutation({
    mutationFn: (plan: Extract<Plan, 'pro' | 'family'>) => paymentsApi.checkout(plan),
    onSuccess: ({ checkout_url }, plan) => {
      setPendingCheckoutPlan(plan); // R4
      window.location.href = checkout_url; // R3
    },
    // onError: NO limpia el marcador (nunca se llegó a registrar) y NO
    // redirige (R10, R11) — el error se lee con isError/error en la página.
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
