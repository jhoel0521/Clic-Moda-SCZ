'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@src/shared/ui/Modal';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import { AuthService } from '@src/services/AuthService';
import { ApiError } from '@src/services/api';
import type { IUser } from '@src/core/models';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Ingresá tu nombre' }),
    email: z.string().email({ message: 'Email inválido' }),
    phone: z.string().optional(),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: IUser) => void;
}

export function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    try {
      const user = await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      onSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError('email', { message: err.message });
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear cuenta" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre completo"
          placeholder="María García"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Teléfono (opcional)"
          placeholder="70000000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Contraseña"
          isPassword
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar contraseña"
          isPassword
          placeholder="Repetí tu contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          Crear cuenta
        </Button>
      </form>
    </Modal>
  );
}
