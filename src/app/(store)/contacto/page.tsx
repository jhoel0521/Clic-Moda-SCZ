'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Globe, MessageCircle, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@src/routes';

const WHATSAPP_NUMBER = '59177000001';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola! Quiero consultar sobre sus productos 👗');

const REDES = [
  { nombre: 'Instagram', usuario: '@clicmodascz', icono: Share2, href: 'https://instagram.com/clicmodascz', color: '#E1306C' },
  { nombre: 'TikTok', usuario: '@clicmodascz', icono: MessageCircle, href: 'https://tiktok.com/@clicmodascz', color: '#010101' },
  { nombre: 'Facebook', usuario: 'Clic Moda SCZ', icono: Globe, href: 'https://facebook.com/clicmodascz', color: '#1877F2' },
];

export default function ContactoPage() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    // EL CONTENEDOR MÁXIMO (1200px) centrado (mx-auto) con gap masivo para separar secciones
    <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col gap-16 py-8 animate-fade-in">

      {/* 1. CABECERA */}
      <div className="w-full flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Estamos para <span className="text-pink-600">ayudarte</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
          ¿Tenés dudas sobre un producto, un pedido o simplemente querés saludar?
          Escribinos y te responderemos a la brevedad.
        </p>
      </div>

      {/* 2. GRID PRINCIPAL (2 columnas) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* COLUMNA IZQ: FORMULARIO */}
        <div className="w-full flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-gray-900">Envíanos un mensaje</h2>

          {formState === 'success' ? (
            <div className="flex flex-col items-center text-center gap-6 rounded-3xl border border-gray-200 bg-white p-12 shadow-xl">
              <CheckCircle2 size={64} className="text-green-500" />
              <p className="text-2xl font-bold text-gray-900">¡Mensaje enviado!</p>
              <p className="text-gray-500 text-lg">Te responderemos en menos de 24 horas.</p>
              <button onClick={() => setFormState('idle')} className="text-pink-600 font-bold hover:underline">
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 shadow-xl">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Nombre completo <span className="text-pink-600">*</span></label>
                <input required placeholder="Ej: María Pérez" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-pink-500 focus:bg-white" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Email <span className="text-pink-600">*</span></label>
                <input required type="email" placeholder="tu@email.com" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-pink-500 focus:bg-white" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Asunto</label>
                <select className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-pink-500 focus:bg-white cursor-pointer">
                  <option>Consulta sobre un producto</option>
                  <option>Estado de mi pedido</option>
                  <option>Devolución o cambio</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Mensaje <span className="text-pink-600">*</span></label>
                <textarea required rows={5} placeholder="Contanos en qué podemos ayudarte..." className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-pink-500 focus:bg-white" />
              </div>

              <button type="submit" disabled={formState === 'sending'} className="mt-2 w-full rounded-xl bg-pink-600 py-4 text-lg font-bold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-700 disabled:opacity-60 transition-all">
                {formState === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

        {/* COLUMNA DER: INFO */}
        <div className="w-full flex flex-col gap-12 lg:pt-4">

          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Contacto directo</h2>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noreferrer" className="flex items-center gap-6 rounded-3xl border border-gray-200 bg-white p-6 hover:border-green-500 hover:shadow-xl transition-all">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 shadow-md">
                <MessageCircle className="text-white" size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold text-gray-900">Chat por WhatsApp</p>
                <p className="text-sm font-medium text-gray-500">+591 77 000-001 · Respuesta rápida</p>
              </div>
            </a>
          </div>

          <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-gray-50 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><Mail size={20} className="text-pink-600" /></div>
              <div className="flex flex-col"><p className="text-sm font-bold text-gray-900">Correo Electrónico</p><p className="text-sm text-gray-600">contacto@clicmodascz.bo</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><MapPin size={20} className="text-pink-600" /></div>
              <div className="flex flex-col"><p className="text-sm font-bold text-gray-900">Ubicación</p><p className="text-sm text-gray-600">Santa Cruz de la Sierra, Bolivia</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"><Clock size={20} className="text-pink-600" /></div>
              <div className="flex flex-col"><p className="text-sm font-bold text-gray-900">Horario</p><p className="text-sm text-gray-600">Lun a Sáb · 8:00 – 20:00</p></div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-gray-900">Síguenos en redes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REDES.map((red) => {
                const Icono = red.icono;
                return (
                  <a key={red.nombre} href={red.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all" style={{ borderBottomColor: red.color, borderBottomWidth: '3px' }}>
                    <Icono size={24} style={{ color: red.color }} />
                    <div className="flex flex-col"><p className="text-sm font-bold text-gray-900">{red.nombre}</p><p className="text-xs text-gray-500">{red.usuario}</p></div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTÓN VOLVER */}
      <div className="w-full flex justify-center border-t border-gray-200">
        <Link href={ROUTES.CATALOG} className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
          &larr; Volver al catálogo de productos
        </Link>
      </div>

    </div>
  );
}