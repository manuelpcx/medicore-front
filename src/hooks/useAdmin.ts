import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAuthStore } from '../store/auth.store';
import type { AdminUsersParams } from '../types';

const isAdmin = () => useAuthStore.getState().user?.role === 'admin';

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
  });
}

export function useAdminUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getAdminUserDetail(id as string),
    enabled: !!id && isAdmin(),
  });
}
