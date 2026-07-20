import api from './axios';
import type { Exam, CreateExamDto, ApiResponse } from '../types';

// Ver nota en allergies.api.ts: `?patientId` opcional para operar sobre un menor.
const q = (patientId?: string | null) => (patientId ? `?patientId=${patientId}` : '');

export const examsApi = {
  getAll: (patientId?: string | null) =>
    api.get<ApiResponse<Exam[]>>(`/exams${q(patientId)}`).then((r) => r.data.data),

  create: (dto: CreateExamDto, file?: File, patientId?: string | null) => {
    const form = new FormData();
    Object.entries(dto).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
    if (file) form.append('archivo', file);
    return api.post<ApiResponse<Exam>>(`/exams${q(patientId)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },

  delete: (id: string, patientId?: string | null) =>
    api.delete(`/exams/${id}${q(patientId)}`),

  // Descarga el archivo del examen como Blob a través de axios, de modo que
  // el interceptor añade el JWT (Authorization) y aplica el auto-refresh.
  // Incluye `?patientId` para pasar el guard de ownership del backend (R25).
  getFileBlob: (id: string, patientId?: string | null) =>
    api.get(`/exams/${id}/file${q(patientId)}`, { responseType: 'blob' }).then((r) => r.data as Blob),
};
