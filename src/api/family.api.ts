import api from './axios';
import type {
  ApiResponse,
  FamilyMemberRow,
  FamilyGroupInfo,
  Invitation,
  MedicalHistory,
  Medication,
  Exam,
  Allergy,
  Vaccine,
} from '../types';

/**
 * Cliente HTTP del dominio Plan Familiar. Consume el módulo `family/` del
 * backend (feature 12). Mismo patrón que `exams.api.ts`: desenvuelve
 * `r.data.data` (el `ResponseInterceptor` global envuelve toda respuesta en
 * `{ data, message, statusCode }`).
 */
export const familyApi = {
  // Gestión del grupo
  inviteFamilyMember: (email: string, relationship: string) =>
    api
      .post<ApiResponse<FamilyMemberRow>>('/family/invite', { email, relationship })
      .then((r) => r.data.data),

  getFamilyMembers: () =>
    api.get<ApiResponse<FamilyMemberRow[]>>('/family/members').then((r) => r.data.data),

  getFamilyGroup: () =>
    api.get<ApiResponse<FamilyGroupInfo>>('/family/group').then((r) => r.data.data),

  getMyInvitations: () =>
    api.get<ApiResponse<Invitation[]>>('/family/invitations').then((r) => r.data.data),

  acceptInvitation: (invitationId: string) =>
    api
      .post<ApiResponse<Invitation>>(`/family/accept/${invitationId}`)
      .then((r) => r.data.data),

  rejectInvitation: (invitationId: string) =>
    api
      .post<ApiResponse<Invitation>>(`/family/reject/${invitationId}`)
      .then((r) => r.data.data),

  removeFamilyMember: (memberId: string) =>
    api
      .delete<ApiResponse<{ message: string }>>(`/family/members/${memberId}`)
      .then((r) => r.data.data),

  // Historial de un miembro (solo owner, vía FamilyAccessGuard)
  getMemberHistory: (memberId: string) =>
    api
      .get<ApiResponse<MedicalHistory[]>>(`/family/members/${memberId}/history`)
      .then((r) => r.data.data),

  getMemberMedications: (memberId: string) =>
    api
      .get<ApiResponse<Medication[]>>(`/family/members/${memberId}/medications`)
      .then((r) => r.data.data),

  getMemberExams: (memberId: string) =>
    api
      .get<ApiResponse<Exam[]>>(`/family/members/${memberId}/exams`)
      .then((r) => r.data.data),

  getMemberAllergies: (memberId: string) =>
    api
      .get<ApiResponse<Allergy[]>>(`/family/members/${memberId}/allergies`)
      .then((r) => r.data.data),

  getMemberVaccines: (memberId: string) =>
    api
      .get<ApiResponse<Vaccine[]>>(`/family/members/${memberId}/vaccines`)
      .then((r) => r.data.data),
};
