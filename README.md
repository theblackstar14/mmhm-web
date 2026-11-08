# Web MM High Metrik Engineers (Astro)

## Agregar o editar una obra
Cada obra es una carpeta en `src/content/obras/<obra>/`:
- `datos.md`: título, tipo (rio | geo | pub | edif), resumen, ubicación, cliente, tramo, alcance, periodo,
  coordenadas, portada, antes, fotos, reto / solucion / resultado.
- Fotos de la galería: copie el archivo en la carpeta de la obra y agréguelo a la lista `fotos` de `datos.md`.
  Una foto que no esté en la lista no aparece en la galería. El orden de la lista es el de la galería, salvo la
  portada, que se muestra primero. La web optimiza las imágenes al compilar.
  ```yaml
  fotos:
    - img: ./durante-01.jpg
      fase: durante        # antes | durante | despues | render
      alt: Texto opcional  # si falta, se genera con el título y la etapa
  ```
- `antesAlineado: true` solo si la foto del antes tiene el mismo encuadre que la portada (activa el deslizador);
  si no, se muestra la comparación lado a lado.
- `servicios`: ids de los servicios aplicados (ver `SERVICIOS` en `src/lib/site.ts`). Con ellos se calculan
  las "Obras relacionadas" de cada servicio.
- `destacada: true`: la obra aparece en la franja "Más obras" del Inicio (requiere portada; máximo
  `MAX_OBRAS_FRANJA` de `site.ts`).
- `destacadaInicio: true`: obra grande del Inicio. `destacadaListado: true`: obra principal de `/proyectos`.
  Cada una solo puede estar en una obra; si se repite, el build falla.
- `borrador: true`: oculta la obra en producción (en `npm run dev` sigue visible).

## Panel de obras (Keystatic)
- Con `npm run dev`, el panel está en http://localhost:4321/keystatic y guarda directamente en los archivos locales.
- `npm run dev:panel` y `npm run build:panel` usan el modo GitHub: cada guardado es un commit y requiere el login de la GitHub App.
- `recorrido` y `prensa` no se editan en el panel: se conservan tal cual y se cambian en `datos.md`.
- Antes de quitar una foto de la galería, revise que `recorrido` no la use. Keystatic borraría el archivo y el build fallaría con `ImageNotFound`; la foto se recupera del historial.
- Las fotos subidas se renombran sin espacios ni tildes y con un sufijo único, para no sobrescribir otra foto de la obra.
- Al actualizar `@keystatic/core`, vuelva a probar `imagen()` de `keystatic.config.ts`: sobrescribe métodos internos del campo.

## Comandos
npm install      # una vez
npm run dev      # vista local en http://localhost:4321
npm run build    # genera la carpeta dist/ lista para publicar

`npm run preview` no funciona con el adaptador de Cloudflare: solo muestra un aviso. Para medir el sitio
compilado, siga el método de [docs/linea-base.md](docs/linea-base.md).

Más documentación (despliegue, panel, accesos, calidad) en [docs/](docs/).

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
