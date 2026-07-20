import api from './axios';
import type { Allergy, CreateAllergyDto, ApiResponse } from '../types';

// Anexa `?patientId=<id>` cuando el perfil activo es un menor propio; sin él
// (patientId null/ausente) opera sobre el Patient del adulto (comportamiento
// actual). El backend (#19) valida el ownership con PatientScopeGuard.
const q = (patientId?: string | null) => (patientId ? `?patientId=${patientId}` : '');

export const allergiesApi = {
  getAll: (patientId?: string | null) =>
    api.get<ApiResponse<Allergy[]>>(`/allergies${q(patientId)}`).then((r) => r.data.data),

  create: (dto: CreateAllergyDto, patientId?: string | null) =>
    api.post<ApiResponse<Allergy>>(`/allergies${q(patientId)}`, dto).then((r) => r.data.data),

  delete: (id: string, patientId?: string | null) =>
    api.delete(`/allergies/${id}${q(patientId)}`),
};
