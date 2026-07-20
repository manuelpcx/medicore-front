import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { minorsApi } from '../api/minors.api';
import { useActiveProfile } from '../store/active-profile.store';
import type { CreateMinorDto } from '../types';

const KEY = ['minors'];

/**
 * Lista de menores del adulto (alimenta el selector y el contador X/5).
 * queryKey estable `['minors']` (R5).
 */
export function useMinors() {
  return useQuery({ queryKey: KEY, queryFn: minorsApi.getMinors });
}

/**
 * Alta de un menor. NO pone toast dentro del hook: el `AddMinorModal` orquesta
 * el toast de éxito (R35) y el de error (R34) con `mutateAsync`. Invalida
 * `['minors']` en éxito para refrescar selector y contador (R6).
 */
export function useCreateMinor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMinorDto) => minorsApi.createMinor(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

/**
 * Baja de un menor (libera cupo). Invalida `['minors']` (R7) y, si el menor
 * borrado es el perfil activo, restablece el perfil al adulto para no quedar
 * apuntando a un `patientId` inexistente (R11).
 */
export function useDeleteMinor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => minorsApi.deleteMinor(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      if (useActiveProfile.getState().patientId === id) {
        useActiveProfile.getState().resetToAdult();
      }
    },
  });
}
