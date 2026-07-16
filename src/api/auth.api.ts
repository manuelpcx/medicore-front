import api from './axios';
import type { LoginDto, RegisterDto, LoginResponse, ApiResponse, Plan, SetPlanResponse } from '../types';

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', dto).then((r) => r.data.data),

  login: (dto: LoginDto) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', dto).then((r) => r.data.data),

  refresh: (refresh_token: string) =>
    api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', { refresh_token }).then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  /** Activa el plan del usuario — PATCH /auth/plan. */
  setPlan: (plan: Plan) =>
    api.patch<ApiResponse<SetPlanResponse>>('/auth/plan', { plan }).then((r) => r.data.data),

  /** Elimina la cuenta permanentemente — derecho de supresión Ley 19.628 */
  deleteAccount: () =>
    api.delete<ApiResponse<{ message: string }>>('/auth/account').then((r) => r.data.data),
};
