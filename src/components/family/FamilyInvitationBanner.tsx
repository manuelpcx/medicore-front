import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useMyInvitations, useAcceptInvitation, useRejectInvitation } from '../../hooks/useFamily';

/**
 * Banner aditivo del dashboard: muestra las invitaciones `pending` dirigidas al
 * usuario, con botones Aceptar/Rechazar. Si no hay invitaciones retorna `null`
 * (no ocupa espacio ni altera el layout del dashboard — R35).
 *
 * Nota: GET /family/invitations devuelve filas FamilyMember crudas sin el
 * nombre del owner resuelto, por lo que se usa un texto genérico + la relación
 * declarada (no añade endpoints de backend).
 */
export function FamilyInvitationBanner() {
  const { data: invitations = [] } = useMyInvitations();
  const accept = useAcceptInvitation();
  const reject = useRejectInvitation();

  const pending = invitations.filter((i) => i.status === 'pending');
  if (pending.length === 0) return null;

  const busy = accept.isPending || reject.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
      {pending.map((inv) => (
        <Card
          key={inv.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            background: 'var(--purple2)', border: '1px solid var(--purple)',
          }}
        >
          <span style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="user" size={22} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              Tienes una invitación a un grupo familiar
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
              Relación indicada: {inv.relationship}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="sm"
              loading={busy}
              onClick={() => accept.mutate(inv.id)}
              style={{ background: 'var(--purple)', color: '#fff' }}
            >
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => reject.mutate(inv.id)}
            >
              Rechazar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
