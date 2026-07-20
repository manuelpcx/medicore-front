import api from './axios';
import type { Medication, CreateMedicationDto, ApiResponse } from '../types';

// Ver nota en allergies.api.ts: `?patientId` opcional para operar sobre un menor.
const q = (patientId?: string | null) => (patientId ? `?patientId=${patientId}` : '');

export const medicationsApi = {
  getAll: (patientId?: string | null) =>
    api.get<ApiResponse<Medication[]>>(`/medications${q(patientId)}`).then((r) => r.data.data),

  create: (dto: CreateMedicationDto, patientId?: string | null) =>
    api.post<ApiResponse<Medication>>(`/medications${q(patientId)}`, dto).then((r) => r.data.data),

  update: (id: string, dto: Partial<CreateMedicationDto>, patientId?: string | null) =>
    api.patch<ApiResponse<Medication>>(`/medications/${id}${q(patientId)}`, dto).then((r) => r.data.data),

  delete: (id: string, patientId?: string | null) =>
    api.delete(`/medications/${id}${q(patientId)}`),
};
