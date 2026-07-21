import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ListSkeleton, Skeleton } from '../components/ui/Skeleton';
import { Icon } from '../components/ui/Icon';
import { InviteMemberModal } from '../components/family/InviteMemberModal';
import { AddMinorModal } from '../components/family/AddMinorModal';
import {
  useFamilyMembers,
  useFamilyGroup,
  useMyInvitations,
  useRemoveFamilyMember,
} from '../hooks/useFamily';
import { useMinors } from '../hooks/useMinors';
import { extractError } from '../utils/format';
import type { FamilyMemberRow } from '../types';

// Tope unificado del plan familiar (#21): 5 en total incluido el titular.
const MAX_MEMBERS_DEFAULT = 5;

function statusBadge(status: string) {
  if (status === 'accepted') return <Badge variant="success" size="sm">Aceptado</Badge>;
  if (status === 'pending') return <Badge variant="warning" size="sm">Pendiente</Badge>;
  return <Badge variant="default" size="sm">Rechazado</Badge>;
}

// ── Modo owner (plan === 'family') ───────────────────────────────────────────
function OwnerView() {
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useFamilyMembers();
  const { data: group, isLoading: groupLoading } = useFamilyGroup();
  const {
    data: minors = [],
    isLoading: minorsLoading,
    isError: minorsError,
    error: minorsErrObj,
    refetch: refetchMinors,
  } = useMinors();
  const remove = useRemoveFamilyMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [addMinorOpen, setAddMinorOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<FamilyMemberRow | null>(null);

  // Cupo unificado (#21): titular + miembros + menores contra max_members.
  // Sin grupo aún (404) usamos defaults coherentes (titular ocupa 1) sin
  // bloquear indebidamente el alta (R21); el backend defiende con 400/409.
  const total = group?.max_members ?? MAX_MEMBERS_DEFAULT;
  const usados = group?.occupied ?? 1;
  const membersCount = group?.members ?? members.filter((m) => m.status === 'accepted').length;
  const minorsCount = group?.minors ?? minors.length;
  const available = group?.available ?? (total - usados);
  const atCap = available <= 0;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 400 }}>Mi grupo familiar</h1>
          {groupLoading ? (
            <div style={{ marginTop: 6 }}><Skeleton width={280} height={14} /></div>
          ) : (
            <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>
              {usados} de {total} cupos usados · {membersCount} familiares · {minorsCount} menores
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            onClick={() => setInviteOpen(true)}
            disabled={atCap}
            style={{ background: 'var(--purple)', color: '#fff' }}
          >
            + Invitar familiar
          </Button>
          <Button
            onClick={() => setAddMinorOpen(true)}
            disabled={atCap}
            style={{ background: 'var(--amber)', color: '#fff' }}
          >
            + Agregar menor
          </Button>
        </div>
      </div>

      {atCap && (
        <div style={{
          background: 'var(--amber2)', border: '1px solid var(--amber)', borderRadius: 12,
          padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="alert" size={18} color="var(--amber)" />
          Alcanzaste el cupo del plan familiar (5 en total, incluidos miembros y menores).
        </div>
      )}
      {!atCap && <div style={{ marginBottom: 20 }} />}

      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', marginBottom: 12 }}>Familiares con cuenta</h2>
      {isLoading ? (
        <ListSkeleton count={3} />
      ) : members.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Icon name="user" size={40} color="var(--purple)" />
          </div>
          <p style={{ color: 'var(--text2)' }}>
            Aún no has invitado a nadie. Pulsa «+ Invitar familiar» para empezar.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {members.map((m) => (
            <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{
                width: 46, height: 46, borderRadius: '50%', background: 'var(--purple2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--purple)', fontWeight: 700, fontSize: 18, flexShrink: 0,
              }}>
                {m.nombre?.[0]?.toUpperCase() ?? '?'}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.nombre}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{m.relationship}</span>
                  {statusBadge(m.status)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {m.status === 'accepted' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/familia/${m.id}`)}
                    style={{ background: 'var(--purple2)', color: 'var(--purple)' }}
                  >
                    Ver historial
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => setConfirmRemove(m)}>
                  Remover
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sección de menores a cargo (4 estados) — R7, R17–R20 */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', margin: '28px 0 12px' }}>Menores a tu cargo</h2>
      {minorsLoading ? (
        <ListSkeleton count={2} />
      ) : minorsError ? (
        <Card style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <Icon name="alert" size={32} color="var(--amber)" />
          </div>
          <p style={{ color: 'var(--text2)', marginBottom: 14 }}>
            No se pudieron cargar los menores: {extractError(minorsErrObj)}
          </p>
          <Button variant="secondary" onClick={() => refetchMinors()}>Reintentar</Button>
        </Card>
      ) : minors.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--amber2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="user" size={28} color="var(--amber)" />
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Aún no agregas menores</div>
          <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 380, margin: '0 auto 18px' }}>
            Agrega el perfil de un menor a tu cargo para gestionar su historial médico.
          </p>
          <Button
            onClick={() => setAddMinorOpen(true)}
            disabled={atCap}
            style={{ background: 'var(--amber)', color: '#fff' }}
          >
            + Agregar menor
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {minors.map((mn) => (
            <Card key={mn.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderColor: 'var(--amber)' }}>
              <span style={{
                width: 46, height: 46, borderRadius: '50%', background: 'var(--amber2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--amber)', fontWeight: 700, fontSize: 18, flexShrink: 0,
              }}>
                {mn.nombre?.[0]?.toUpperCase() ?? '?'}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{mn.nombre}</span>
                  <Badge variant="warning" size="sm">Menor</Badge>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                  {mn.edad} años{mn.relacion ? ` · ${mn.relacion}` : ''}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <AddMinorModal open={addMinorOpen} onClose={() => setAddMinorOpen(false)} />

      <Modal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        title="Remover del grupo familiar"
        maxWidth={400}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRemove(null)}>Cancelar</Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={async () => {
                if (!confirmRemove) return;
                await remove.mutateAsync(confirmRemove.id);
                setConfirmRemove(null);
              }}
            >
              Remover
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          ¿Seguro que quieres remover a {confirmRemove?.nombre} del grupo familiar? Se
          liberará su cupo. Esta acción no afecta su historial médico.
        </p>
      </Modal>
    </div>
  );
}

// ── Modo miembro no-owner / upsell ───────────────────────────────────────────
function MemberOrUpsellView() {
  const navigate = useNavigate();
  const familyGroupId = useAuthStore((s) => s.user?.family_group_id);
  const { data: group } = useFamilyGroup();
  const { data: invitations = [] } = useMyInvitations();

  const pending = invitations.filter((i) => i.status === 'pending');
  const belongsToGroup = !!familyGroupId || !!group;

  // Miembro aceptado: pertenece a un grupo (R21). NO se lista a otros miembros.
  if (belongsToGroup) {
    return (
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 20 }}>Familia</h1>
        <Card style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--purple2)', border: '1px solid var(--purple)' }}>
          <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="user" size={24} color="#fff" />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Formas parte del grupo familiar de {group?.owner?.nombre ?? 'tu titular'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              El titular del plan puede consultar tu historial médico.
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Invitación pendiente (R22).
  if (pending.length > 0) {
    return (
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 20 }}>Familia</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map((inv) => (
            <Card key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--purple2)', border: '1px solid var(--purple)' }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="user" size={22} color="#fff" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Tienes una invitación pendiente a un grupo familiar</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
                  Relación indicada: {inv.relationship}. Acéptala o recházala desde el banner de tu panel.
                </div>
              </div>
              <Badge variant="warning" size="sm">Pendiente</Badge>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Upsell (R14).
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h1 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 20 }}>Plan Familiar</h1>
      <Card style={{ textAlign: 'center', padding: 48, borderColor: 'var(--purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--purple2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={32} color="var(--purple)" />
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Cuida a toda tu familia</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px' }}>
          Con el Plan Familiar puedes sumar hasta 4 familiares (5 en total,
          incluidos menores a tu cargo) y consultar su historial médico desde un
          solo lugar.
        </p>
        <Button
          onClick={() => navigate('/perfil')}
          style={{ background: 'var(--purple)', color: '#fff' }}
        >
          Actualizar a Plan Familiar
        </Button>
      </Card>
    </div>
  );
}

/**
 * Página `/familia`. El modo lo decide el plan del usuario:
 * - `plan === 'family'` → owner (grupo familiar).
 * - miembro aceptado / invitación pendiente / sin nada → mensaje o upsell.
 */
export default function FamiliaPage() {
  const plan = useAuthStore((s) => s.user?.plan);
  if (plan === 'family') return <OwnerView />;
  return <MemberOrUpsellView />;
}
