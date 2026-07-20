import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { useCreateMinor } from '../../hooks/useMinors';
import { toast } from '../../store/toast.store';
import { extractError } from '../../utils/format';

const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

// Edad en años cumplidos a partir de una fecha YYYY-MM-DD.
function edadEnAnios(birth: string): number {
  const d = new Date(birth + 'T00:00:00');
  const now = new Date();
  let edad = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) edad--;
  return edad;
}

function esFechaValida(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T00:00:00');
  return !Number.isNaN(d.getTime());
}

const schema = z.object({
  nombre: z.string().trim().min(1, 'Ingresa el nombre del menor'),
  birth_date: z
    .string()
    .min(1, 'Ingresa la fecha de nacimiento')
    .refine(esFechaValida, 'Fecha inválida')
    .refine((v) => new Date(v + 'T00:00:00') <= new Date(), 'La fecha no puede ser futura')
    .refine((v) => edadEnAnios(v) < 18, 'El perfil requiere ser menor de 18 años'),
  sexo: z.enum(['masculino', 'femenino', 'otro']),
  relacion: z.string().trim().max(30).optional(),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: 'Debes autorizar el registro del menor' }),
  }),
});
type Form = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddMinorModal({ open, onClose }: Props) {
  const create = useCreateMinor();
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    // `consentimiento` empieza en false para que la barrera del botón aplique.
    defaultValues: { sexo: 'masculino', consentimiento: false as unknown as true },
  });

  const consentimiento = watch('consentimiento');

  const close = () => {
    reset({ sexo: 'masculino', consentimiento: false as unknown as true });
    onClose();
  };

  const onSubmit = async (values: Form) => {
    try {
      await create.mutateAsync({
        nombre: values.nombre.trim(),
        birth_date: values.birth_date,
        sexo: values.sexo,
        relacion: values.relacion?.trim() || undefined,
        consentimiento: true,
      });
      toast.success('Menor agregado');
      reset({ sexo: 'masculino', consentimiento: false as unknown as true });
      onClose();
    } catch (err) {
      // Incluye 400 (consentimiento/edad/fecha) y 409 (cupo lleno). El modal
      // permanece abierto con los datos ya escritos para reintentar (R34, R36).
      toast.error(extractError(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Agregar menor"
      maxWidth={460}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button
            form="add-minor-form"
            type="submit"
            loading={create.isPending}
            disabled={consentimiento !== true}
            style={{ background: 'var(--amber)', color: '#fff' }}
          >
            Agregar menor
          </Button>
        </>
      }
    >
      <form
        id="add-minor-form"
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <Input
          label="Nombre del menor"
          placeholder="María Pérez"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />
        <Select
          label="Sexo"
          options={SEXO_OPTIONS}
          error={errors.sexo?.message}
          {...register('sexo')}
        />
        <Input
          label="Relación (opcional)"
          placeholder="hijo, hija, sobrino…"
          error={errors.relacion?.message}
          {...register('relacion')}
        />

        {/* Consentimiento obligatorio: bloquea el envío hasta ser aceptado (R32). */}
        <div style={{
          background: 'var(--amber2)', border: '1px solid var(--amber)',
          borderRadius: 12, padding: '14px 16px', marginTop: 4,
        }}>
          <Controller
            control={control}
            name="consentimiento"
            render={({ field }) => (
              <Toggle
                checked={field.value === true}
                onChange={(v) => field.onChange(v)}
                label="Autorizo el registro de este menor"
                description="Confirmo que soy su representante y consiento el tratamiento de sus datos de salud."
              />
            )}
          />
          {errors.consentimiento && (
            <span style={{ fontSize: 12, color: 'var(--red)', display: 'block', marginTop: 8 }}>
              {errors.consentimiento.message}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
