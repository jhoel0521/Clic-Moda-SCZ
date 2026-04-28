import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — Clic Moda SCZ',
  description: 'Accedé a tu cuenta en Clic Moda SCZ para gestionar tus pedidos y preferencias.',
};

/**
 * Página de login.
 * Sprint 0: Placeholder con estructura base.
 * LoginModal y lógica OAuth se implementan en Sprint 3.
 */
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_#fff7fb,_#f8f2f4_45%,_#ffffff_100%)] px-6 py-14">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 text-center lg:text-left animate-fade-in">
          <div className="inline-flex items-center rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-brand)]">
            Acceso seguro
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Entrá y seguí tu compra
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-8 text-[var(--color-text-secondary)] lg:mx-0">
            Iniciá sesión para ver tu perfil, revisar pedidos y guardar tus favoritos.
            El acceso está pensado para ser rápido, claro y sin pantallas cargadas.
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

        <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-8 text-center">
            <span className="gradient-text text-3xl font-extrabold tracking-tight">Clic Moda SCZ</span>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Iniciá sesión para continuar</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-secondary)]">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-secondary)]">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-[var(--gradient-brand)] py-3.5 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5 hover:opacity-95"
            >
              Iniciar sesión
            </button>

            <div className="flex items-center justify-between text-sm">
              <button type="button" className="font-medium text-[var(--color-brand)] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
              <Link href={ROUTES.HOME} className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
                Volver al inicio
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
