import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAuthStore } from '../store/auth.store';
import type { AdminUsersParams } from '../types';

const isAdmin = () => useAuthStore.getState().user?.role === 'admin';

/** No reintentar en errores del cliente (404, 403, etc.); solo en errores de red/5xx. */
const retryNotClientError = (count: number, err: unknown) => {
  const status = (err as any)?.response?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) return false;
  return count < 2;
};

export function useAdminStats() {
  const enabled = useAuthStore((s) => s.user?.role === 'admin');
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getAdminStats,
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminUsers(params: AdminUsersParams) {
  const enabled = useAuthStore((s) => s.user?.role === 'admin');
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getAdminUsers(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    retry: retryNotClientError,
  });
}

export function useAdminUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getAdminUserDetail(id as string),
    enabled: !!id && isAdmin(),
  });
}
