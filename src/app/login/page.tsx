'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { MockAuthService, MockAuthError } from '@src/mocks/services/MockAuthService';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCartStore } from '@src/core/store/useCartStore';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import { Modal } from '@src/shared/ui/Modal';
import { ROUTES } from '@src/routes';
import { RegisterModal } from './RegisterModal';
import type { IUser } from '@src/core/models';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
});
type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const mergeGuestCart = useCartStore((s) => s.mergeGuestCart);
  const cartItems = useCartStore((s) => s.items);

  const [showRegister, setShowRegister] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  function handleSuccess(user: IUser) {
    const guestItems = [...cartItems];
    setUser(user);
    if (guestItems.length > 0) mergeGuestCart(guestItems);
    const redirect = searchParams.get('redirect') ?? ROUTES.HOME;
    router.push(redirect);
  }

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const user = await MockAuthService.login(data);
      handleSuccess(user);
    } catch (err) {
      if (err instanceof MockAuthError) {
        setError('password', { message: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_#fff7fb,_#f8f2f4_45%,_#ffffff_100%)] px-6 py-14">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Hero */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-brand)]">
            Acceso seguro
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Entrá y seguí tu compra
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-8 text-[var(--color-text-secondary)] lg:mx-0">
            Iniciá sesión para ver tu perfil, revisar pedidos y guardar tus favoritos. Rápido y sin fricciones.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { valor: '1 click', texto: 'Acceso simple' },
              { valor: '24/7', texto: 'Disponible' },
              { valor: 'Seguro', texto: 'Sesión protegida' },
            ].map((item) => (
              <div key={item.texto} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{item.valor}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-6 text-center">
            <p className="text-2xl font-extrabold tracking-tight text-[var(--color-brand)]">Clic Moda SCZ</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Iniciá sesión para continuar</p>
          </div>

          {/* OAuth */}
          <div className="mb-5 space-y-3">
            <button
              type="button"
              onClick={() => setShowOAuthModal(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2a10.1 10.1 0 0 0-.16-1.76H9v3.33h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.55Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34A9 9 0 0 0 9 18Z" fill="#34A853"/><path d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.34Z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3 2.34C4.68 5.16 6.66 3.58 9 3.58Z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => setShowOAuthModal(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#166fe5] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.027 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Continuar con Facebook
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">o con email</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              isPassword
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSubmitting}>
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
            ¿No tenés cuenta?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="font-semibold text-[var(--color-brand)] hover:underline"
            >
              Registrate gratis
            </button>
          </p>

          <div className="mt-3 text-center">
            <Link href={ROUTES.HOME} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* RegisterModal */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={handleSuccess}
      />

      {/* OAuth no disponible */}
      <Modal isOpen={showOAuthModal} onClose={() => setShowOAuthModal(false)} title="Autenticación social" size="sm">
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          La autenticación con Google y Facebook no está disponible en este entorno de demostración. Por favor, usá el formulario de email y contraseña.
        </p>
        <div className="mt-5">
          <Button variant="primary" fullWidth onClick={() => setShowOAuthModal(false)}>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-5rem)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
