import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useInviteFamilyMember } from '../../hooks/useFamily';
import { toast } from '../../store/toast.store';
import { extractError } from '../../utils/format';

// Values = enum aceptado por el backend (`@IsIn` en invite.dto.ts).
const RELATIONSHIP_OPTIONS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'hijo/a', label: 'Hijo/a' },
  { value: 'cónyuge', label: 'Cónyuge' },
  { value: 'otro', label: 'Otro' },
];

const schema = z.object({
  email: z.string().email('Email inválido'),
  relationship: z.enum(['padre', 'madre', 'hijo/a', 'cónyuge', 'otro']),
});
type Form = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ open, onClose }: Props) {
  const invite = useInviteFamilyMember();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { relationship: 'otro' },
  });

  const close = () => { reset({ relationship: 'otro' }); onClose(); };

  const onSubmit = async (values: Form) => {
    try {
      await invite.mutateAsync({ email: values.email, relationship: values.relationship });
      toast.success(`Invitación enviada a ${values.email}`);
      reset({ relationship: 'otro' });
      onClose();
    } catch (err) {
      // Incluye el error de cupos (400). El modal permanece abierto (R32).
      toast.error(extractError(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invitar familiar"
      maxWidth={440}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button
            form="invite-form"
            type="submit"
            loading={invite.isPending}
            style={{ background: 'var(--purple)', color: '#fff' }}
          >
            Enviar invitación
          </Button>
        </>
      }
    >
      <form
        id="invite-form"
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <Input
          label="Email del familiar"
          type="email"
          placeholder="familiar@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Relación"
          options={RELATIONSHIP_OPTIONS}
          error={errors.relationship?.message}
          {...register('relationship')}
        />
      </form>
    </Modal>
  );
}
