'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Ingresá tu nombre' }),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileDataForm() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  function onSubmit(data: ProfileFormData) {
    if (!user) return;
    setUser({ ...user, name: data.name, phone: data.phone });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre completo"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          value={user?.email ?? ''}
          disabled
          hint="El email no se puede modificar"
        />
        <Input
          label="Teléfono (opcional)"
          placeholder="70000000"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <div>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
