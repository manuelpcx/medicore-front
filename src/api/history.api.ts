import api from './axios';
import type { MedicalHistory, CreateHistoryDto, ApiResponse } from '../types';

// Ver nota en allergies.api.ts: `?patientId` opcional para operar sobre un menor.
const q = (patientId?: string | null) => (patientId ? `?patientId=${patientId}` : '');

export const historyApi = {
  getAll: (patientId?: string | null) =>
    api.get<ApiResponse<MedicalHistory[]>>(`/history${q(patientId)}`).then((r) => r.data.data),

  create: (dto: CreateHistoryDto, patientId?: string | null) =>
    api.post<ApiResponse<MedicalHistory>>(`/history${q(patientId)}`, dto).then((r) => r.data.data),

  update: (id: string, dto: Partial<CreateHistoryDto>, patientId?: string | null) =>
    api.patch<ApiResponse<MedicalHistory>>(`/history/${id}${q(patientId)}`, dto).then((r) => r.data.data),

  delete: (id: string, patientId?: string | null) =>
    api.delete(`/history/${id}${q(patientId)}`),
};
