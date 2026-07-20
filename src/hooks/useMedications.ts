import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';
import { useActiveProfile } from '../store/active-profile.store';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';
import type { CreateMedicationDto } from '../types';

// queryKey re-keyed por el perfil activo (ver nota en useAllergies.ts).
const key = (patientId: string | null) => ['medications', patientId];

export function useMedications() {
  const patientId = useActiveProfile((s) => s.patientId);
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => medicationsApi.getAll(patientId),
  });
}

export function useCreateMedication() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (dto: CreateMedicationDto) => medicationsApi.create(dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Medicamento agregado'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useUpdateMedication() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateMedicationDto> }) =>
      medicationsApi.update(id, dto, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Medicamento actualizado'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useDeleteMedication() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (id: string) => medicationsApi.delete(id, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Medicamento eliminado'); },
    onError: (err) => toast.error(extractError(err)),
  });
}
