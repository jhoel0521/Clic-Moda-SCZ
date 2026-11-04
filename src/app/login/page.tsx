'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { AuthService } from '@src/services/AuthService';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { ROUTES } from '@src/routes';
import { RegisterModal } from './RegisterModal';
import type { IUser } from '@src/core/models';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Ingresá tu contraseña' }),
});
type LoginFormData = z.infer<typeof loginSchema>;

/** Cuentas de ejemplo públicas de la demo (data/db.json). */
const DEMO_PASSWORD = 'demo1234';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const [showRegister, setShowRegister] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  function handleSuccess(user: IUser, fallback: string = ROUTES.HOME) {
    setUser(user);
    router.push(searchParams.get('redirect') ?? fallback);
  }

  async function onSubmit(data: LoginFormData) {
    try {
      handleSuccess(await AuthService.login(data));
    } catch (err) {
      setError('password', { message: (err as Error).message });
    }
  }

  async function enterAs(email: string, fallback: string) {
    const user = await AuthService.login({ email, password: DEMO_PASSWORD });
    setUser(user);
    router.push(fallback);
  }

  return (
    <div className="safe-top min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-md px-5 py-4">
        <Link
          href={ROUTES.HOME}
          aria-label="Volver a la tienda"
          className="-ml-2 flex h-11 w-11 items-center justify-center text-gray-800"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="mt-2 mb-1 text-2xl font-black text-gray-900">Entrar</h1>
        <p className="mb-5 text-sm text-gray-500">
          No hace falta cuenta para comprar. Entrá para ver tus pedidos.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => enterAs('cliente@demo.test', ROUTES.PROFILE)}
            className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-gray-300 p-4 text-left text-gray-900 active:bg-gray-100"
          >
            <User size={22} className="shrink-0" />
            <span>
              <span className="block font-bold">Entrar como cliente de prueba</span>
              <span className="block text-xs text-gray-500">Mis pedidos y datos</span>
            </span>
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400">o con tu cuenta de prueba</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-pink-600"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-pink-600"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-gray-900 font-bold text-gray-900 disabled:opacity-50"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="min-h-11 font-bold text-pink-600"
          >
            Registrate
          </button>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Es una demo: no uses una contraseña real.
        </p>
      </div>

      {showRegister && (
        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSuccess={(user) => handleSuccess(user)}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
