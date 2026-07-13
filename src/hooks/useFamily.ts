import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '../api/family.api';
import { toast } from '../store/toast.store';
import { extractError } from '../utils/format';

const FAMILY = ['family'];

// ── Lecturas (R8) ────────────────────────────────────────────────────────────

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: familyApi.getFamilyMembers,
  });
}

/**
 * GET /family/group devuelve 404 cuando el usuario aún no tiene grupo (el grupo
 * se crea de forma perezosa en el primer invite). Con `retry: false` no
 * reintentamos ese 404; las páginas tratan el error/undefined como "sin grupo"
 * sin romper el render.
 */
export function useFamilyGroup() {
  return useQuery({
    queryKey: ['family', 'group'],
    queryFn: familyApi.getFamilyGroup,
    retry: false,
  });
}

export function useMyInvitations() {
  return useQuery({
    queryKey: ['family', 'invitations'],
    queryFn: familyApi.getMyInvitations,
  });
}

// ── Mutations (R9, R10, R11) ─────────────────────────────────────────────────

/**
 * Al éxito invalida todo el árbol `['family']` (miembros y grupo). NO pone un
 * toast genérico: el modal orquesta el toast "Invitación enviada a {email}"
 * (R31) y el error de cupos (R32) con `mutateAsync`.
 */
export function useInviteFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, relationship }: { email: string; relationship: string }) =>
      familyApi.inviteFamilyMember(email, relationship),
    onSuccess: () => { qc.invalidateQueries({ queryKey: FAMILY }); },
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => familyApi.acceptInvitation(invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILY });
      toast.success('Invitación aceptada');
    },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useRejectInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => familyApi.rejectInvitation(invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILY });
      toast.info('Invitación rechazada');
    },
    onError: (err) => toast.error(extractError(err)),
  });
}

export function useRemoveFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => familyApi.removeFamilyMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILY });
      toast.success('Miembro removido del grupo familiar');
    },
    onError: (err) => toast.error(extractError(err)),
  });
}

// ── Historial de un miembro (R12) ────────────────────────────────────────────

/**
 * Agrupa las cinco lecturas del historial de un miembro. Las queries están
 * deshabilitadas cuando `memberId` es falsy (`enabled: !!memberId`).
 */
export function useMemberData(memberId: string) {
  const enabled = !!memberId;

  const history = useQuery({
    queryKey: ['family', 'member', memberId, 'history'],
    queryFn: () => familyApi.getMemberHistory(memberId),
    enabled,
  });
  const medications = useQuery({
    queryKey: ['family', 'member', memberId, 'medications'],
    queryFn: () => familyApi.getMemberMedications(memberId),
    enabled,
  });
  const exams = useQuery({
    queryKey: ['family', 'member', memberId, 'exams'],
    queryFn: () => familyApi.getMemberExams(memberId),
    enabled,
  });
  const allergies = useQuery({
    queryKey: ['family', 'member', memberId, 'allergies'],
    queryFn: () => familyApi.getMemberAllergies(memberId),
    enabled,
  });
  const vaccines = useQuery({
    queryKey: ['family', 'member', memberId, 'vaccines'],
    queryFn: () => familyApi.getMemberVaccines(memberId),
    enabled,
  });

  return {
    history: history.data ?? [],
    medications: medications.data ?? [],
    exams: exams.data ?? [],
    allergies: allergies.data ?? [],
    vaccines: vaccines.data ?? [],
    isLoading:
      history.isLoading ||
      medications.isLoading ||
      exams.isLoading ||
      allergies.isLoading ||
      vaccines.isLoading,
  };
}
