# Web MM High Metrik Engineers (Astro)

## Agregar o editar una obra
Cada obra es una carpeta en `src/content/obras/<obra>/`:
- `datos.md`: título, tipo (rio | geo | pub | edif), resumen, ubicación, cliente, tramo, alcance, periodo,
  coordenadas, portada, antes, reto / solucion / resultado.
- Fotos con prefijo de etapa: `antes-01.jpg`, `durante-01.jpg`, `despues-01.jpg`, `render-01.jpg`.
  El prefijo decide la pestaña de la galería. La web optimiza las imágenes al compilar.
- `antesAlineado: true` solo si la foto del antes tiene el mismo encuadre que la portada (activa el deslizador);
  si no, se muestra la comparación lado a lado.

## Comandos
npm install      # una vez
npm run dev      # vista local en http://localhost:4321
npm run build    # genera la carpeta dist/ lista para publicar

## Página de obra (rediseño)

Campos nuevos en `src/content/obras/<slug>/datos.md`:

- `plazo`: plazo contractual ("60 días").
- `cifras`: hasta 3 cifras grandes de la cabecera (`v` valor, `u` unidad opcional, `t` texto).
- `hicimos`: lista "Lo que hicimos". Si falta, se usa `solucion`.
- `recorrido`: recorrido por fases con animación. Exactamente 5 fases (`t`, `s`, `lead`, `inc`, `out`, `foto` opcional).
  - `set`: `rios` (zigzag con plataformas de ríos), `bolognesi` (arco, solo Plaza Bolognesi) o `generico` (zigzag con las piezas de Gestión integral). Si no se indica: `rios` para tipo `rio`, `generico` para el resto.
  - `stat`: cifra central del arco (solo `bolognesi`).
  - Si una obra no tiene `recorrido`, la sección no se muestra.

Las bases y plataformas del recorrido están en `src/assets/recorrido/`; su geometría (posiciones, rutas de luz y etiquetas) en `src/lib/recorrido.ts`.
