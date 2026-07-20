import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allergiesApi } from '../api/allergies.api';
import { useActiveProfile } from '../store/active-profile.store';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';
import type { CreateAllergyDto } from '../types';

// queryKey re-keyed por el perfil activo (`patientId`): TanStack Query mantiene
// cachés separadas por perfil. patientId = null (adulto) ⇒ sin `?patientId` ⇒
// comportamiento actual sin regresión.
const key = (patientId: string | null) => ['allergies', patientId];

export function useAllergies() {
  const patientId = useActiveProfile((s) => s.patientId);
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => allergiesApi.getAll(patientId),
  });
}

export function useCreateAllergy() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (dto: CreateAllergyDto) => allergiesApi.create(dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Alergia registrada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useDeleteAllergy() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (id: string) => allergiesApi.delete(id, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Alergia eliminada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}
