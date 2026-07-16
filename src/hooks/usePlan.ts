import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { toast } from '../store/toast.store';
import type { Plan } from '../types';

/**
 * Mutación de activación de plan (PATCH /auth/plan).
 * onSuccess: refleja el nuevo `plan` en el store (setUser) para el sidebar/gating,
 * invalida el paciente y emite un toast de confirmación.
 * NOTA: NO se emite un toast de error; el estado `error` se muestra en la propia
 * pantalla /elegir-plan (lee isError/error), no debe ocultarse tras un toast.
 */
export function useSetPlan() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (plan: Plan) => authApi.setPlan(plan),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['patient', 'me'] });
      toast.success('Plan actualizado');
    },
  });
}
