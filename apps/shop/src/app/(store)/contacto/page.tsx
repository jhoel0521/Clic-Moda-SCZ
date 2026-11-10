'use client';

import { useState } from 'react';
import { MessageCircle, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';

const WA_NUMBER = '59177000001';
const WA_MSG = encodeURIComponent('Hola! Quiero consultar sobre sus productos 👗');

export default function ContactoPage() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('success'), 1500);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Estamos para <span className="text-pink-600">ayudarte</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            ¿Tenés dudas sobre un producto, un pedido o simplemente querés saludar? Escribinos y te
            responderemos a la brevedad.
          </p>
        </div>

        {/* Grid 2 columnas */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* LEFT — Formulario */}
          <div>
            <h2 className="mb-6 text-2xl font-black text-gray-900">Envíanos un mensaje</h2>

            {formState === 'success' ? (
              <div className="flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <CheckCircle2 size={56} className="text-green-500" />
                <p className="text-2xl font-black text-gray-900">¡Mensaje enviado!</p>
                <p className="text-gray-500">Te responderemos en menos de 24 horas.</p>
                <button
                  type="button"
                  onClick={() => setFormState('idle')}
                  className="font-bold text-pink-600 hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">
                      Nombre completo <span className="text-pink-600">*</span>
                    </label>
                    <input
                      required
                      placeholder="Ej: María Pérez"
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors outline-none focus:border-pink-500 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">
                      Email <span className="text-pink-600">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="tu@email.com"
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors outline-none focus:border-pink-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Asunto</label>
                  <select className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors outline-none focus:border-pink-500 focus:bg-white">
                    <option>Consulta sobre un producto</option>
                    <option>Estado de mi pedido</option>
                    <option>Devolución o cambio</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">
                    Mensaje <span className="text-pink-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Contanos en qué podemos ayudarte..."
                    className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  className="w-full rounded-xl bg-gray-900 py-4 font-black text-white shadow-md transition-colors hover:bg-pink-600 disabled:opacity-60"
                >
                  {formState === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT — Info de contacto */}
          <div className="flex flex-col gap-8">
            {/* WhatsApp CTA */}
            <div>
              <h2 className="mb-4 text-2xl font-black text-gray-900">Contacto directo</h2>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-green-400 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500 shadow-md">
                  <MessageCircle className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">Chat por WhatsApp</p>
                  <p className="text-sm text-gray-500">+591 77 000-001 · Respuesta rápida</p>
                </div>
              </a>
            </div>

            {/* Info cards */}
            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {[
                { Icon: Mail, label: 'Correo Electrónico', value: 'contacto@clicmodascz.bo' },
                { Icon: MapPin, label: 'Ubicación', value: 'Santa Cruz de la Sierra, Bolivia' },
                { Icon: Clock, label: 'Horario', value: 'Lun a Sáb · 8:00 – 20:00' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50">
                    <Icon size={18} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Redes sociales */}
            <div>
              <h3 className="mb-4 text-lg font-black text-gray-900">Síguenos en redes</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://instagram.com/clicmodascz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
                  style={{ borderBottomColor: '#E1306C', borderBottomWidth: '3px' }}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#E1306C">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Instagram</p>
                    <p className="text-xs text-gray-500">@clicmodascz</p>
                  </div>
                </a>
                <a
                  href="https://facebook.com/clicmodascz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
                  style={{ borderBottomColor: '#1877F2', borderBottomWidth: '3px' }}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Facebook</p>
                    <p className="text-xs text-gray-500">Clic Moda SCZ</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
