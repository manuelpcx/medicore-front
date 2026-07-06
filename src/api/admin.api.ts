import api from './axios';
import type {
  ApiResponse,
  AdminStats,
  AdminUsersPage,
  AdminUsersParams,
  AdminUserDetail,
} from '../types';

export const adminApi = {
  /** Métricas agregadas del panel (usuarios, registros por día, uso general). */
  getAdminStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data.data),

  /** Listado paginado de usuarios con búsqueda por nombre o email. */
  getAdminUsers: (params: AdminUsersParams) =>
    api
      .get<ApiResponse<AdminUsersPage>>('/admin/users', { params })
      .then((r) => r.data.data),

  /** Detalle de un usuario — solo conteos y metadatos. */
  getAdminUserDetail: (id: string) =>
    api
      .get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`)
      .then((r) => r.data.data),
};
