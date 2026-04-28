import type { Metadata } from 'next';

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="gradient-text font-extrabold text-3xl tracking-tight">
            Clic Moda SCZ
          </span>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            Iniciá sesión para continuar
          </p>
        </div>

        {/* Card placeholder */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 space-y-5 shadow-[var(--shadow-lg)]">
          <div className="space-y-3">
            <div className="h-10 rounded-xl bg-[var(--color-surface-raised)] animate-pulse" />
            <div className="h-10 rounded-xl bg-[var(--color-surface-raised)] animate-pulse" />
          </div>

          <div
            className="w-full h-12 rounded-xl flex items-center justify-center font-semibold text-white"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Iniciar Sesión
          </div>

          <p className="text-center text-xs text-[var(--color-text-muted)]">
            ¿No tenés cuenta?{' '}
            <span className="text-[var(--color-brand)] cursor-pointer hover:underline">
              Registrate gratis
            </span>
          </p>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          🚧 Formulario completo disponible en <strong>Sprint 3</strong>
        </p>
      </div>
    </div>
  );
}
