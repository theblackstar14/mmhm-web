import { defineMiddleware } from 'astro:middleware';

// Rutas del panel, las únicas que corren en servidor.
const RUTAS_PANEL = /^\/(api\/)?keystatic(\/|$)/i;

// Oculta el panel a los buscadores. En las páginas estáticas corre durante el build y no agrega nada.
export const onRequest = defineMiddleware(async ({ url }, next) => {
  const respuesta = await next();
  if (RUTAS_PANEL.test(url.pathname)) respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return respuesta;
});
