import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinesApi } from '../api/vaccines.api';
import { useActiveProfile } from '../store/active-profile.store';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';
import type { CreateVaccineDto } from '../types';

// queryKey re-keyed por el perfil activo (ver nota en useAllergies.ts).
const key = (patientId: string | null) => ['vaccines', patientId];

export function useVaccines() {
  const patientId = useActiveProfile((s) => s.patientId);
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => vaccinesApi.getAll(patientId),
  });
}

export function useCreateVaccine() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (dto: CreateVaccineDto) => vaccinesApi.create(dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Vacuna registrada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useDeleteVaccine() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (id: string) => vaccinesApi.delete(id, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Vacuna eliminada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}
