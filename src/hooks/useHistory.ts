import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '../api/history.api';
import { useActiveProfile } from '../store/active-profile.store';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';
import type { CreateHistoryDto } from '../types';

// queryKey re-keyed por el perfil activo (ver nota en useAllergies.ts).
const key = (patientId: string | null) => ['history', patientId];

export function useHistory() {
  const patientId = useActiveProfile((s) => s.patientId);
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => historyApi.getAll(patientId),
  });
}

export function useCreateHistory() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (dto: CreateHistoryDto) => historyApi.create(dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Consulta guardada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useUpdateHistory() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateHistoryDto> }) => historyApi.update(id, dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Consulta actualizada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useDeleteHistory() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (id: string) => historyApi.delete(id, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Consulta eliminada'); },
    onError: (err) => toast.error(extractError(err)),
  });
}
