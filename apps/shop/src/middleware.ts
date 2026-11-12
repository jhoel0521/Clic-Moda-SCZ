import { defineMiddleware } from 'astro:middleware';
import { REF_COOKIE, resolveRef } from './lib/ref';

// Recuerda el código `ref` del enlace en una cookie de SESIÓN (sin fecha de vencimiento, solo servidor, sin
// datos personales) para que viaje en el mensaje de WhatsApp aunque el visitante navegue a otras páginas.
export const onRequest = defineMiddleware((context, next) => {
  const { ref, remember } = resolveRef(context.url, context.cookies.get(REF_COOKIE)?.value);
  if (remember && ref) {
    context.cookies.set(REF_COOKIE, ref, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: context.url.protocol === 'https:',
    });
  }
  context.locals.ref = ref;
  return next();
});
