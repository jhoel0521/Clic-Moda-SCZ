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
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        <p className="text-4xl mb-3">😅</p>
        <p className="font-black text-xl text-gray-900 mb-2">No disponible en demo</p>
        <p className="text-sm text-gray-500 mb-6">
          La autenticación social no está habilitada en este entorno. Usá el formulario de email y contraseña.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:justify-center md:items-center pb-20 md:pb-0">

      {/* Desktop minimal header */}
      <div className="hidden md:block w-full absolute top-0 left-0 right-0">
        <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="font-black text-2xl tracking-tighter text-gray-900">
            CLIC MODA <span className="text-pink-500">SCZ</span>
          </Link>
          <Link href={ROUTES.HOME} className="font-bold text-gray-500 hover:text-gray-900 text-sm transition-colors">
            ← Volver a la tienda
          </Link>
        </nav>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden w-full bg-white border-b border-gray-100 px-4 py-4">
        <Link href={ROUTES.HOME} className="font-black text-xl tracking-tighter text-gray-900">
          CLIC MODA <span className="text-pink-500">SCZ</span>
        </Link>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md bg-white md:shadow-2xl md:rounded-3xl p-6 md:p-10 flex-1 md:flex-none md:mt-0">

        <div className="mb-8 md:text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Bienvenido</h2>
          <p className="text-gray-500 text-sm md:text-base">
            Inicia sesión para gestionar tus pedidos y guardar tus datos.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5 mb-8" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-pink-600 text-white font-black py-4 rounded-xl mt-2 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">O continúa con</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social buttons — stacked full-width */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowOAuth(true)}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Continuar con Facebook
          </button>
          <button
            type="button"
            onClick={() => setShowOAuth(true)}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3.5 rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
