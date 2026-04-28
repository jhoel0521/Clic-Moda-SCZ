'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Globe, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { ROUTES } from '@src/routes';

const WHATSAPP_NUMBER = '59177000001';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola! Quiero consultar sobre sus productos 👗');

const REDES = [
  {
    nombre: 'Instagram',
    usuario: '@clicmodascz',
    icono: Share2,
    href: 'https://instagram.com/clicmodascz',
    color: '#E1306C',
  },
  {
    nombre: 'TikTok',
    usuario: '@clicmodascz',
    icono: MessageCircle,
    href: 'https://tiktok.com/@clicmodascz',
    color: '#010101',
  },
  {
    nombre: 'Facebook',
    usuario: 'Clic Moda SCZ',
    icono: Globe,
    href: 'https://facebook.com/clicmodascz',
    color: '#1877F2',
  },
];

type FormState = 'idle' | 'sending' | 'success' | 'error';

export default function ContactoPage() {
  const [formState, setFormState] = useState<FormState>('idle');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');
    // Simulación de envío — Sprint 3 conecta con backend real
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <div className="space-y-4 text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          Estamos para <span className="gradient-text">ayudarte</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-text-secondary)]">
          Tenés dudas sobre un producto, un pedido o simplemente querés saludar.
          Escribinos y te respondemos rápido.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="mx-auto w-full max-w-2xl lg:max-w-none">
          <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">Envianos un mensaje</h2>

          {formState === 'success' ? (
            <div
              className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)]"
            >
              <span className="text-5xl">✅</span>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">¡Mensaje enviado!</p>
              <p className="text-[var(--color-text-secondary)]">
                Te respondemos por email o WhatsApp en menos de 24 horas.
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-sm)]" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Nombre completo <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Email <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="asunto" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Asunto
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
                >
                  <option value="consulta">Consulta sobre un producto</option>
                  <option value="pedido">Estado de mi pedido</option>
                  <option value="devolucion">Devolución o cambio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mensaje" className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Mensaje <span className="text-[var(--color-danger)]">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Contanos en qué podemos ayudarte..."
                  className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand)]/20"
                />
              </div>

              <button
                type="submit"
                disabled={formState === 'sending'}
                className="w-full rounded-xl bg-[var(--gradient-brand)] py-3.5 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formState === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8 lg:pt-14">
          <div>
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">Contacto directo</h2>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-green-500 hover:shadow-[var(--shadow-md)]"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                <MessageCircle className="text-white" size={22} />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-green-600">WhatsApp</p>
                <p className="text-sm text-[var(--color-text-muted)]">+591 77 000-001 · Respuesta en minutos</p>
              </div>
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <Mail size={16} className="text-[var(--color-brand)]" />
              <span>contacto@clicmodascz.bo</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <MapPin size={16} className="text-[var(--color-brand)]" />
              <span>Santa Cruz de la Sierra, Bolivia</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <Clock size={16} className="text-[var(--color-brand)]" />
              <span>Lunes a Sábado · 8:00 – 20:00</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[var(--color-text-primary)]">Seguinos en redes</h3>
            <div className="space-y-3">
              {REDES.map((red) => {
                const Icono = red.icono;
                return (
                  <a
                    key={red.nombre}
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <Icono size={20} style={{ color: red.color }} />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{red.nombre}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{red.usuario}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={ROUTES.CATALOG}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)] transition-colors hover:underline"
        >
          ← Volver al catálogo
        </Link>
      </div>

    </div>
  );
}
