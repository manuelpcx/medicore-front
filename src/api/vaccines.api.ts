import api from './axios';
import type { Vaccine, CreateVaccineDto, ApiResponse } from '../types';

// Ver nota en allergies.api.ts: `?patientId` opcional para operar sobre un menor.
const q = (patientId?: string | null) => (patientId ? `?patientId=${patientId}` : '');

export const vaccinesApi = {
  getAll: (patientId?: string | null) =>
    api.get<ApiResponse<Vaccine[]>>(`/vaccines${q(patientId)}`).then((r) => r.data.data),

  create: (dto: CreateVaccineDto, patientId?: string | null) =>
    api.post<ApiResponse<Vaccine>>(`/vaccines${q(patientId)}`, dto).then((r) => r.data.data),

  delete: (id: string, patientId?: string | null) =>
    api.delete(`/vaccines/${id}${q(patientId)}`),
};
