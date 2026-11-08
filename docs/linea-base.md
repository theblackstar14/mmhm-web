# Línea base (T01)

Referencia para comparar los cambios del rediseño (T10, T11 y T17).

## Entorno

| Dato | Valor |
|---|---|
| Fecha | 2026-10-31 |
| Commit | `59692ac` (rama `feat/t01-linea-base`) |
| Node / npm | 24.19.0 / 11.17.0 |
| Astro | 5.18.2 |
| SO | Windows 11 Pro |

## Build

- `npm install`: sin cambios en dependencias (280 paquetes auditados).
- `npm run build`: sin errores ni advertencias. 17 páginas, 230 imágenes optimizadas.
- Copia de `dist/` guardada fuera del repositorio en `C:\Users\ADMIN\mmhm-base\dist-base` (315 archivos, idéntica a `dist/` al momento de la copia).

Páginas generadas: `/`, `/servicios/`, `/proyectos/` y 14 fichas en `/proyectos/<slug>/`.

## Lighthouse

Medición sobre `npm run preview` (build de producción, `http://localhost:4321`), con `npx lighthouse` 13.6.0 y Chrome en modo headless. Móvil usa la configuración por defecto (con limitación simulada de red y CPU); escritorio usa `--preset=desktop`. Una sola corrida por página: el rendimiento puede variar unos puntos entre corridas. (Histórico: `npm run preview` dejó de funcionar en T12; el método actual está en «Método», más abajo.)

| Página | Modo | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | Móvil | 64 | 97 | 96 | 66 | 14,9 s | 0,003 | 140 ms |
| `/` | Escritorio | 82 | 97 | 96 | 66 | 3,0 s | 0 | 0 ms |
| `/servicios/` | Móvil | 65 | 94 | 96 | 66 | 16,3 s | 0,001 | 80 ms |
| `/servicios/` | Escritorio | 83 | 98 | 96 | 66 | 3,0 s | 0,002 | 0 ms |
| `/proyectos/` | Móvil | 68 | 95 | 96 | 66 | 19,8 s | 0,06 | 10 ms |
| `/proyectos/` | Escritorio | 81 | 99 | 96 | 66 | 3,4 s | 0,014 | 0 ms |
| `/proyectos/costa-verde/` | Móvil | 72 | 91 | 96 | 66 | 14,4 s | 0 | 10 ms |
| `/proyectos/costa-verde/` | Escritorio | 86 | 95 | 96 | 66 | 2,5 s | 0,001 | 0 ms |

Peso total transferido (móvil): Inicio 7.601 KiB, `/proyectos/` 3.411 KiB, Costa Verde 2.257 KiB.

### Notas para interpretar

- **SEO 66**: penalizado a propósito porque `Base.astro` tiene `noindex, nofollow` fijo (se corrige en T16).
- **Buenas prácticas 96**: el único error de consola es un 404 de `/_vercel/insights/script.js`, que solo existe en Vercel. En local siempre falla.
- **LCP móvil alto (14–20 s)**: es el punto más débil. Coincide con el peso de las páginas, sobre todo el Inicio.
- Auditorías que fallan en varias páginas: `color-contrast`, `heading-order`, `label-content-name-mismatch` y, en Costa Verde móvil, `aria-prohibited-attr`.

## Observaciones

- `npm audit` reporta 7 vulnerabilidades (1 baja, 1 moderada, 4 altas, 1 crítica). No se corrigieron en T01 porque implican cambiar dependencias.
- npm 11 bloquea los scripts de instalación de `esbuild` y `sharp` (`allow-scripts`). El build funciona igual con los binarios ya presentes.

## Rendimiento (T19)

Referencia para T19: commit `2f0d1b2`, medido el 2026-11-04. Resultado: commit `9ed5e93`, medido el mismo día.

### Las cifras de T01 no se reproducen

La copia intacta de T01 (`C:\Users\ADMIN\mmhm-base\dist-base`), medida el 2026-11-04 con el mismo Lighthouse 13.6.0, da en el Inicio móvil LCP 1,5 s y 2.220 KiB, frente a los 14,9 s y 7.601 KiB anotados en T01. Con los mismos archivos, la diferencia viene del entorno de aquella corrida. La causa exacta no está confirmada, porque sus reportes no se guardaron. Por eso, la comparación de T19 usa como "antes" la medición de 2026-11-04 y no la tabla de T01, que se conserva sin cambios.

### Método

`npm run preview` dejó de funcionar en T12: `The @astrojs/cloudflare adapter does not support the preview command`. Para medir se usa el mismo servidor estático de Astro con una configuración sin adaptador, guardada fuera del repositorio:

```js
// preview.config.mjs, ruta relativa a la raíz del proyecto al pasarla con --config
export default { root: 'C:/Users/ADMIN/mmhm-web', trailingSlash: 'ignore', build: { format: 'directory' } };
```

```
npm run build
npx astro preview --config <ruta relativa>/preview.config.mjs --port 4322
npx lighthouse@13.6.0 http://localhost:4322/ --output=json --chrome-flags="--headless=new"
npx lighthouse@13.6.0 http://localhost:4322/ --preset=desktop --output=json --chrome-flags="--headless=new"
```

Chrome 156 headless. Dos corridas por página en móvil y una en escritorio; un rango indica que las corridas difirieron. Lighthouse no desplaza la página: quien la recorre descarga más imágenes de las contadas aquí.

### Antes y después

| Página | Modo | Rendimiento | LCP | FCP | CLS | Peso |
|---|---|---|---|---|---|---|
| `/` | Móvil | 99 → 98 a 100 | 1,5 s → 0,8 a 0,9 s | 1,5 s → 0,8 a 0,9 s | 0,003 → 0 | 2.332 → 1.679 KiB |
| `/` | Escritorio | 99 → 100 | 1,0 s → 0,2 s | 0,5 s → 0,2 s | 0 → 0 | 4.587 → 2.023 KiB |
| `/servicios/` | Móvil | 80 a 85 → 93 a 96 | 4,4 a 5,3 s → 2,8 a 3,2 s | 1,5 s → 0,8 a 0,9 s | 0,001 → 0 | 1.049 → 473 KiB |
| `/servicios/` | Escritorio | 98 → 100 | 1,1 s → 0,8 s | 0,5 s → 0,2 s | 0,002 → 0 | 1.376 → 670 KiB |
| `/proyectos/` | Móvil | 74 → 89 | 8,0 s → 3,8 s | 1,5 s → 0,8 s | 0,065 a 0,068 → 0,01 | 1.470 → 1.038 KiB |
| `/proyectos/` | Escritorio | 96 → 98 | 1,4 s → 1,2 s | 0,5 s → 0,2 s | 0,014 → 0,011 | 1.365 → 1.209 KiB |
| `/proyectos/costa-verde/` | Móvil | 93 a 94 → 96 | 3,1 s → 2,9 s | 1,5 s → 0,9 s | 0 → 0 | 676 → 404 KiB |
| `/proyectos/costa-verde/` | Escritorio | 99 → 100 | 0,9 s → 0,6 s | 0,5 s → 0,2 s | 0,001 → 0 | 662 → 396 KiB |

`/proyectos/` móvil es la cifra menos estable: una corrida del commit previo, con el mismo contenido de la página, dio LCP 5,0 s y rendimiento 82.

Accesibilidad, buenas prácticas y SEO no cambiaron con T19.

### Qué se cambió

1. `/proyectos/`: imagen hero y comparador con `srcset` y `fetchpriority` (la imagen hero móvil pasó de 397 a 122 KiB).
2. Fuente Archivo alojada en `public/fonts/`, con su licencia OFL. Google Fonts ya no bloquea el render.
3. Imágenes fijas movidas de `public/assets/` a `src/assets/sitio/` y servidas con `astro:assets`.
4. Inicio: anchos menores en la obra grande y la franja.
5. Recorrido: `srcset` en el plano y las piezas.
6. Video del hero: WebM con respaldo a MP4 (934 frente a 1.211 KiB). Calidad comparada a simple vista: equivalente. No se recomprimió.
7. Leaflet se carga solo al abrir un mapa.

### Verificación

- Capturas de 6 páginas en 360, 768 y 1280 px, antes y después: como máximo 0,47 % de píxeles distintos, por recompresión de imágenes. Sin cambios de tamaño de página.
- Mapa, marcadores, filtros y teclado en `/proyectos/` y una ficha, más comparador, carrusel, galería y recorrido: los mismos resultados que antes y sin errores de JavaScript. La única diferencia es que Leaflet ya no se pide al cargar.

### Pendiente

- El video sigue siendo el recurso más pesado del Inicio móvil (934 KiB de 1.679). No se creó una variante móvil.
- Logo de la Municipalidad de Lima: SVG de 253 KB (91 KiB comprimido).
