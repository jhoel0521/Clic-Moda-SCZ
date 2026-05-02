'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { AuthService } from '@src/services/AuthService';
import { ApiError } from '@src/services/api';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCartStore } from '@src/core/store/useCartStore';
import { ROUTES } from '@src/routes';
import { RegisterModal } from './RegisterModal';
import type { IUser } from '@src/core/models';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});
type LoginFormData = z.infer<typeof loginSchema>;

function OAuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <p className="mb-3 text-4xl">😅</p>
        <p className="mb-2 text-xl font-black text-gray-900">No disponible en demo</p>
        <p className="mb-6 text-sm text-gray-500">
          La autenticación social no está habilitada en este entorno. Usá el formulario de email y
          contraseña.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-gray-900 py-3 font-bold text-white transition-colors hover:bg-pink-600"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const cartItems = useCartStore((s) => s.items);

  const [showRegister, setShowRegister] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), mode: 'onBlur' });

  function handleSuccess(user: IUser) {
    const guestItems = [...cartItems];
    setUser(user);
    if (guestItems.length > 0) mergeGuestCart(guestItems);
    router.push(searchParams.get('redirect') ?? ROUTES.HOME);
  }

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const user = await AuthService.login(data);
      handleSuccess(user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('password', { message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20 md:items-center md:justify-center md:pb-0">
      {/* Desktop minimal header */}
      <div className="absolute top-0 right-0 left-0 hidden w-full md:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <Link href={ROUTES.HOME} className="text-2xl font-black tracking-tighter text-gray-900">
            CLIC MODA <span className="text-pink-500">SCZ</span>
          </Link>
          <Link
            href={ROUTES.HOME}
            className="text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
          >
            ← Volver a la tienda
          </Link>
        </nav>
      </div>

      {/* Mobile top bar */}
      <div className="w-full border-b border-gray-100 bg-white px-4 py-4 md:hidden">
        <Link href={ROUTES.HOME} className="text-xl font-black tracking-tighter text-gray-900">
          CLIC MODA <span className="text-pink-500">SCZ</span>
        </Link>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md flex-1 bg-white p-6 md:mt-0 md:flex-none md:rounded-3xl md:p-10 md:shadow-2xl">
        <div className="mb-8 md:text-center">
          <h2 className="mb-2 text-3xl font-black text-gray-900 md:text-4xl">Bienvenido</h2>
          <p className="text-sm text-gray-500 md:text-base">
            Inicia sesión para gestionar tus pedidos y guardar tus datos.
          </p>
        </div>

        {/* Form */}
        <form className="mb-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-sm transition-all outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">Contraseña</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-12 text-sm transition-all outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-gray-900 py-4 font-black text-white shadow-lg transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            O continúa con
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social buttons — stacked full-width */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowOAuth(true)}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-3.5 font-bold text-white shadow-md transition-colors hover:bg-[#166fe5]"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Continuar con Facebook
          </button>
          <button
            type="button"
            onClick={() => setShowOAuth(true)}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3.5 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="font-bold text-pink-600 hover:underline"
          >
            Registrate gratis
          </button>
        </p>
      </div>

      {showRegister && (
        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showOAuth && <OAuthModal onClose={() => setShowOAuth(false)} />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginPageContent />
    </Suspense>
  );
}
