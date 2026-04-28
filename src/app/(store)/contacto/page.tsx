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
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

      {/* ── ENCABEZADO ───────────────────────────────────────────── */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold">
          Estamos para <span className="gradient-text">ayudarte</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Tenés dudas sobre un producto, un pedido o simplemente querés saludar.
          Escribinos y te respondemos rápido.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">

        {/* ── FORMULARIO ───────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Envianos un mensaje</h2>

          {formState === 'success' ? (
            <div
              className="rounded-2xl border p-8 text-center space-y-4"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <span className="text-5xl">✅</span>
              <p className="font-semibold text-lg">¡Mensaje enviado!</p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Te respondemos por email o WhatsApp en menos de 24 horas.
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="text-sm underline"
                style={{ color: 'var(--color-brand)' }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Nombre completo <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  minLength={2}
                  placeholder="Tu nombre"
                  className="w-full h-11 rounded-xl px-4 text-sm border outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Email <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full h-11 rounded-xl px-4 text-sm border outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="asunto" className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Asunto
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  className="w-full h-11 rounded-xl px-4 text-sm border outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="consulta">Consulta sobre un producto</option>
                  <option value="pedido">Estado de mi pedido</option>
                  <option value="devolucion">Devolución o cambio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mensaje" className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Mensaje <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Contanos en qué podemos ayudarte..."
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-all resize-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={formState === 'sending'}
                className="w-full h-12 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--gradient-brand)' }}
              >
                {formState === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

        {/* ── INFO DE CONTACTO ─────────────────────────────────── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">Contacto directo</h2>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:border-green-500 group"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                <MessageCircle className="text-white" size={22} />
              </div>
              <div>
                <p className="font-semibold group-hover:text-green-500 transition-colors">WhatsApp</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>+591 77 000-001 · Respuesta en minutos</p>
              </div>
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Mail size={16} style={{ color: 'var(--color-brand)' }} />
              <span>contacto@clicmodascz.bo</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin size={16} style={{ color: 'var(--color-brand)' }} />
              <span>Santa Cruz de la Sierra, Bolivia</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Clock size={16} style={{ color: 'var(--color-brand)' }} />
              <span>Lunes a Sábado · 8:00 – 20:00</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Seguinos en redes</h3>
            <div className="space-y-3">
              {REDES.map((red) => {
                const Icono = red.icono;
                return (
                  <a
                    key={red.nombre}
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-[var(--color-border-hover)]"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <Icono size={20} style={{ color: red.color }} />
                    <div>
                      <p className="font-medium text-sm">{red.nombre}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{red.usuario}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="text-center">
        <Link
          href={ROUTES.CATALOG}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-brand)' }}
        >
          ← Volver al catálogo
        </Link>
      </div>

    </div>
  );
}
