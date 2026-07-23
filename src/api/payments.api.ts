import api from './axios';
import type {
  ApiResponse,
  Plan,
  SubscriptionState,
  CancelSubscriptionResponse,
} from '../types';

/**
 * Cliente HTTP del dominio Pagos (MercadoPago). Consume `payments/` del
 * backend (feature 31, migrada de Flow a MercadoPago en la feature 41,
 * checkout con tokenización de tarjeta desde la feature 43). Mismo patrón
 * que `family.api.ts`: desenvuelve `r.data.data` sobre el `api` compartido
 * de `axios.ts`.
 *
 * `POST /payments/webhook` NO se expone aquí: es público y lo invoca
 * MercadoPago directamente, el frontend nunca lo llama.
 */
export const paymentsApi = {
  /**
   * `cardTokenId` viene del Brick `<CardPayment>` (nunca el número de
   * tarjeta/CVV crudo). El backend llama a MercadoPago síncronamente y
   * devuelve el mismo tipo `SubscriptionState` que `getSubscription()`.
   */
  checkout: (plan: Extract<Plan, 'pro' | 'family'>, cardTokenId: string) =>
    api
      .post<ApiResponse<SubscriptionState>>('/payments/checkout', {
        plan,
        card_token_id: cardTokenId,
      })
      .then((r) => r.data.data),

  getSubscription: () =>
    api.get<ApiResponse<SubscriptionState>>('/payments/subscription').then((r) => r.data.data),

  cancelSubscription: () =>
    api
      .post<ApiResponse<CancelSubscriptionResponse>>('/payments/subscription/cancel')
      .then((r) => r.data.data),
};
