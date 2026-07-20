import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '../api/exams.api';
import { useActiveProfile } from '../store/active-profile.store';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';
import type { CreateExamDto } from '../types';

// queryKey re-keyed por el perfil activo (ver nota en useAllergies.ts).
const key = (patientId: string | null) => ['exams', patientId];

export function useExams() {
  const patientId = useActiveProfile((s) => s.patientId);
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => examsApi.getAll(patientId),
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: ({ dto, file }: { dto: CreateExamDto; file?: File }) => examsApi.create(dto, file, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Examen subido'); },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  const patientId = useActiveProfile((s) => s.patientId);
  return useMutation({
    mutationFn: (id: string) => examsApi.delete(id, patientId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key(patientId) }); toast.success('Examen eliminado'); },
    onError: (err) => toast.error(extractError(err)),
  });
}
