import api from './axios';
import type { Minor, CreateMinorDto, ApiResponse } from '../types';

/**
 * Cliente HTTP del espacio del menor. Consume el módulo `family/minors` del
 * backend (feature 19), sobre el axios compartido (JWT + auto-refresh). Mismo
 * patrón que el resto de la capa api: desenvuelve `r.data.data` (el
 * `ResponseInterceptor` global envuelve toda respuesta en `{ data, message,
 * statusCode }`).
 */
export const minorsApi = {
  createMinor: (payload: CreateMinorDto) =>
    api.post<ApiResponse<Minor>>('/family/minors', payload).then((r) => r.data.data),

  getMinors: () =>
    api.get<ApiResponse<Minor[]>>('/family/minors').then((r) => r.data.data),

  deleteMinor: (id: string) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/family/minors/${id}`)
      .then((r) => r.data.data),
};
