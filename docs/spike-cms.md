# Prueba técnica del panel (T12): Keystatic + Cloudflare

Estado: **cerrada**. Recomendación: seguir con Keystatic en modo GitHub. Queda sin probar que el sitio se reconstruya tras un guardado.

## Resultados

| Prueba | Resultado | Resumen |
|---|---|---|
| (a) El modo local escribe el frontmatter correcto, con rutas de imagen relativas | **Sí, con ajustes** | Da `./durante-t12.jpg` solo con un envoltorio propio. De fábrica no funciona |
| (b) Abrir y guardar sin editar no produce diferencias | **Sí, pero no prueba nada** | El panel no escribe si no hay cambios. Con un cambio real, **no**: ver detalle |
| (c) Las rutas del panel funcionan en Cloudflare con el sitio estático | **Sí** | Sitio estático, `/keystatic` y su API funcionan en la vista previa. El API quedó probado por (d) y (e) |
| (d) El login con GitHub funciona | **Sí** | Probado por el usuario en la vista previa, con la GitHub App. Requirió corregir la instalación para poder crear ramas |
| (e) Un guardado crea un commit en una rama del fork | **Sí** | Dos guardados crearon dos commits en `spike/t12-guardado`. `main` del fork y upstream no cambiaron |

## Versiones instaladas

Astro sigue en 5.18.2 (`npm ls astro` muestra una sola copia).

- `@astrojs/cloudflare` 12.6.13, `@astrojs/react` 4.4.2, `@keystatic/core` 0.6.9, `@keystatic/astro` 6.0.0, `react` y `react-dom` 19.3.1.
- No se aprobó ningún script de instalación. `workerd`, las tres versiones de `esbuild` y el build funcionan sin ellos. npm sigue avisando de 5 paquetes pendientes (`workerd`, `sharp`, 3 de `esbuild`).

## Detalle de (a)

Se creó una obra temporal desde el panel, se subió una foto y luego se eliminó la obra.

- **Frontmatter:** claves y valores correctos. El archivo queda como `datos.md` junto a la foto.
- **Imagen:** con bytes únicos, el build generó 11 variantes y la ficha la muestra.
- **Problema:** el panel escribe `coords: []` si no se llenan las coordenadas, y el build falla (`coords: Array must contain at least 2 element(s)`). Además, en Windows ese build fallido termina con un error de libuv y código 127. Hay que leer el log hacia arriba para ver la causa.

### Por qué las imágenes no funcionan de fábrica

Con `path: src/content/obras/*/datos`, Keystatic busca las fotos en `<obra>/datos/`, no junto a `datos.md`, y conserva el `./` dentro del nombre.

1. El panel muestra las fotos existentes como vacías.
2. Al guardar, envía un borrado hacia `.../datos/./durante-01.jpg`. Su propio API lo rechaza con `400 Bad data` y no escribe nada.

El ajuste está en `keystatic.config.ts`: la función `imagen()` usa `directory` y quita y vuelve a poner el `./`. También evita que Keystatic renombre la foto a `portada.jpg` y borre la original, lo que la sacaría de la galería (se clasifica por prefijo). Este envoltorio sobrescribe métodos internos del campo, así que **cada actualización de Keystatic debe volver a probarlo**.

## Detalle de (b)

**Sin editar:** el botón Guardar no envía nada (`isSavingDisabled = !hasChanged` en `@keystatic/core`). Se observaron 0 llamadas a `/api/keystatic/update` y hashes iguales en las tres obras.

**Con una edición de una sola línea** en `resumen`, en `rio-lurin`, `costa-verde` y `crematorio-surco`:

| Obra | Líneas cambiadas en el primer guardado | En el segundo guardado |
|---|---|---|
| `rio-lurin` | 30 | Solo la línea editada |
| `costa-verde` | 29 | Solo la línea editada |
| `crematorio-surco` | 143 | Solo la línea editada |

Qué cambia en el primer guardado:

- **Comillas:** se quitan o cambian (`"rio"` pasa a `rio`).
- **Textos largos:** pasan a bloques `>-` con corte de línea.
- **Listas:** `coords: [a, b]` pasa a formato de bloque, con otra sangría.
- **Orden de claves:** sigue el de la configuración (en `crematorio-surco`, `periodo` y `borrador` se mueven).
- **Saltos de línea:** el archivo de trabajo pasa de CRLF a LF. `git diff` no lo muestra porque el índice ya está en LF (`core.autocrlf=true`).
- **Claves nuevas:** `cifras: []` y `hicimos: []` en las obras que no las tenían.
- **Claves perdidas:** `destacada: false` desaparece en `costa-verde`, por el ajuste de casillas.

La comparación por contenido no encontró otras pérdidas: `crematorio-surco` conserva sus 66 valores, `recorrido` incluido. Las tres obras construyen bien.

### Fallos que T13 debe resolver

1. **`hicimos: []` cambia lo que se publica.** `src/pages/proyectos/[slug].astro:113` evalúa `d.hicimos ?` y un arreglo vacío da verdadero: la obra mostraría una lista vacía en lugar del texto de `solucion`. Las pruebas compilan, pero este error no lo detecta el build.
2. **`coords: []` rompe el build.**
3. **`recorrido` y `prensa` no son editables en esta prueba.** Con `fields.object`, las obras que no los tienen reciben `prensa: {}` y un `recorrido` sin fases, que incumplen el esquema Zod. Aquí se usa `fields.ignored()`, que los conserva sin mostrarlos.
4. **Primer guardado ruidoso.** Conviene normalizar las 14 obras una sola vez en un commit aparte. Después, cada guardado solo muestra lo editado. La aceptación de T13 ("sin diferencias inesperadas") debe redactarse sobre esa base.

## Detalle de (c): vista previa en Cloudflare

Worker `mmhm-web-spike` en `https://mmhm-web-spike.mmhm-prueba.workers.dev`, desplegado con subida directa (`npx wrangler deploy`). Solo tiene el binding `ASSETS`: no se creó almacenamiento `SESSION` ni otro recurso. Antes hubo que verificar el correo de la cuenta de Cloudflare y registrar el subdominio de `workers.dev`, ambos pasos manuales.

- **Sitio estático:** `/`, `/proyectos/`, `/proyectos/rio-lurin/` y `/servicios/` responden 200, con cuerpo idéntico byte a byte a `dist/` y `Cache-Control: public, max-age=0, must-revalidate`, propio de los assets. `/` conserva `noindex, nofollow`.
- **Panel:** `/keystatic` y `/keystatic/collection/obras` responden 200 sin esa cabecera y no existen como archivos en `dist/`, así que los responde el Worker. En Chrome, `/keystatic` muestra "Log in with GitHub".
- **API:** antes de cargar los secretos, `/api/keystatic/github/login` y `/api/keystatic/github/refresh-token` respondían 500. Con los tres secretos cargados con `wrangler secret put` y el callback agregado en la GitHub App, el login y los guardados funcionaron.
- **No expuestos:** `/_worker.js/index.js`, `/_routes.json`, `/.assetsignore` y `/.env` responden 404.
- **Para T14:** `/keystatic` no lleva `noindex`, a diferencia de las páginas públicas.

## Detalle de (d)

Probado por el usuario en la vista previa; el resultado no se observó de forma automática. Los commits de (e) quedaron atribuidos a su cuenta, lo que es compatible con ese login.

Al crear la rama, el panel respondió `Resource not accessible by integration` hasta que el usuario corrigió la instalación de la GitHub App en el repositorio. No se registró qué ajuste exacto cambió. El manual de T14 debe indicar cómo revisar esa instalación.

## Detalle de (e)

Verificado con `gh api` (solo GET) sobre `repos/steffano-llo/mmhm-web`.

| Commit | Autor | Archivos | Líneas | Cambio |
|---|---|---|---|---|
| `28bd1de` | `steffano-llo` | `src/content/obras/rio-lurin/datos.md` | +20 -10 | Agrega "Probando." al `resumen` y normaliza todo el YAML |
| `59bdf23` | `steffano-llo` | `src/content/obras/rio-lurin/datos.md` | +2 -2 | Pasa "Probando." al `titulo` y restaura el `resumen` |

- **Rama:** `spike/t12-guardado`, 2 commits delante de `main` y 0 detrás, base `59692ac`. Se creó desde `main` del fork, que sigue en el prototipo: no contiene T01 a T08. (Histórico: hoy `main` ya incluye esas tareas.)
- **Commit:** lo firma GitHub (`web-flow`, verificado), con el usuario como autor. El mensaje es genérico: `Update src/content/obras/rio-lurin/datos`. No dice qué cambió, algo a tener en cuenta para el historial que leerá personal no técnico.
- **Saltos de línea:** LF en ambas versiones (0 CRLF: 15 líneas en `main`, 25 en la rama).
- **Campos perdidos:** ninguno. `portada` sigue en `./durante-01.jpg` y las dos fotos conservan tamaño y hash de blob.
- **Campos agregados:** `cifras: []` y `hicimos: []`. Es el fallo ya descrito: esta obra mostraría una lista vacía en "Lo que hicimos" en lugar de `solucion`.
- **Orden de claves:** se mantiene en esta obra; `cifras` y `hicimos` entran antes de `borrador`.
- **Comparación con el modo local:** coincide. El primer guardado normaliza (30 líneas) y el siguiente solo toca lo editado. Los 4 cambios del segundo commit corresponden a dos ediciones: `titulo` y `resumen`.
- **Otros repos:** `main` del fork sigue en `59692ac`. En upstream, `git ls-remote` da `59692ac`, igual que la última referencia conocida, y tiene una sola rama.

## Detalle de (c): avance local

Se probó el build en modo GitHub con `wrangler dev --local` (runtime `workerd`), sin cuenta de Cloudflare y sin secretos.

- `/`, `/proyectos/`, `/proyectos/rio-lurin/`, `/keystatic` y `/keystatic/collection/obras` responden 200.
- `/_worker.js/index.js` y `/_routes.json` responden 404: el código del servidor no se expone.
- `/api/keystatic/github/login` responde 500 porque faltan las variables, con el mensaje propio de Keystatic. Es lo esperado sin secretos.
- Las 21 páginas públicas salieron idénticas byte a byte a la línea base al agregar el adaptador, antes de los ajustes posteriores de configuración.
- Keystatic lee los secretos en tiempo de ejecución con `getSecret`, no los incrusta en el build según su código. Comprobado sobre el build de `npm run build:panel`: los tres secretos no aparecen en `dist/`, ni en los assets ni en el bundle del Worker. Solo aparece el slug de la App, que es público.

Ajuste necesario en modo dev: excluir `@keystatic/astro/api` de `optimizeDeps`, porque Vite no resuelve `astro:env/server` al prebundlear.

## Riesgos anotados

- **`npm audit`:** 13 avisos (1 crítico, 6 altos, 5 moderados, 1 bajo). El crítico es del propio `astro` y `sharp` también tiene uno alto: ya estaban en el proyecto. `miniflare`, `undici` y `ws` llegan con el adaptador. El arreglo propuesto exige Astro 7 y adaptador 14, fuera del alcance de esta prueba. Conviene evaluarlo antes de T18.
- **Fork público:** los commits de prueba quedan visibles. T14 exige repo privado para producción.
- **`.assetsignore` y CRLF:** con `autocrlf` puede quedar en CRLF en una copia de Windows. El despliegue desde Windows lo respetó con el archivo en LF (`/_worker.js/index.js` responde 404). Con el archivo en CRLF no se probó.

## Recomendación

**Seguir con Keystatic en modo GitHub.** Las pruebas (c), (d) y (e) pasaron en Cloudflare, sin secretos en el build y con las páginas públicas idénticas a la línea base. No hace falta el Plan B (Decap). La condición es resolver antes la lista siguiente: de fábrica, Keystatic no maneja el formato actual de las obras.

### Lo que T13 debe resolver

1. **Listas vacías nuevas.** Keystatic agrega `cifras: []` y `hicimos: []`. `cifras` ya se oculta si está vacía (`[slug].astro:68`). `hicimos` no: `[slug].astro:113` muestra una lista vacía. Ocultar la sección perdería el respaldo actual, así que una lista vacía debe mostrar el texto de `solucion`, como cuando falta el campo.
2. **Rama base.** El panel crea las ramas desde `main` del fork, que sigue sin T01 a T08. Antes de usarlo en serio, `main` tiene que estar al día.
3. **Mensajes de commit genéricos.** Dicen `Update src/content/obras/<obra>/datos`. En `@keystatic/core` 0.6.9 el texto está fijo en el código de la interfaz y la configuración no ofrece ninguna opción para cambiarlo. Personalizarlo exigiría parchear el paquete, lo que no se recomienda sin evaluar antes el costo de mantenerlo.
4. **Hosting.** El panel depende del adaptador de Cloudflare. Si algún día se envía este trabajo al repositorio del líder, que hoy está en Vercel, la decisión de hosting debe estar acordada con él.
5. **Fallos descritos arriba.** `coords: []` rompe el build, `recorrido` y `prensa` aún no se pueden editar, y conviene normalizar las 14 obras en un solo commit. Ver "Fallos que T13 debe resolver".
6. **Envoltorio de imágenes.** `imagen()` sobrescribe métodos internos del campo: hay que volver a probarlo en cada actualización de Keystatic.

### Estado tras T13

Probado solo en modo local. El guardado en modo GitHub con esta configuración sigue sin probar.

- **Resuelto:** punto 1 (`hicimos` vacío muestra `solucion`) y, del punto 5, `coords: []` (ahora es un texto `lat, lng`) y la normalización de las 14 obras.
- **Sigue abierto:** puntos 2, 3, 4 y 6. Del punto 5, `recorrido` y `prensa` siguen sin poder editarse (`fields.ignored()`), por decisión del usuario en el caso de `recorrido`.
- **`imagen()` en una lista de objetos:** funciona. Editar, agregar, reordenar y quitar fotos produce solo el cambio esperado.
- **Portada:** guardar sin tocarla la conserva. Reemplazarla o quitarla no borra el archivo si `fotos` también lo usa.
- **Sin ruido:** editar un campo en cada una de las 14 obras cambió una sola línea en cada una.

Fallos encontrados:

- **Nombre repetido (corregido):** subir una foto con un nombre existente sobrescribía la otra sin avisar. Ahora cada foto subida recibe un sufijo único. Como efecto, subir la misma foto en dos campos crea dos archivos: la ficha la mostraría dos veces si se sube como portada y en la galería.
- **Foto usada por `recorrido` (abierto):** quitarla de `fotos` borra el archivo, porque Keystatic no ve ese campo, y el build falla con `ImageNotFound`. Hay una advertencia en la ayuda del campo.
- **Interfaz (abierto):** `locale: 'es-ES'` traduce solo una parte. Siguen en inglés "Choose file", "Remove", "Done", "Regenerate" y el diálogo de eliminar, que además dice "This action cannot be undone", aunque el modo GitHub lo deja en el historial.
- **Modo dev en Windows (abierto):** al cambiar varios archivos seguidos, Astro puede mostrar `UnknownFilesystemError` al escribir `.astro/data-store.json`, y tras borrar una foto la ficha puede responder 404 o 500 hasta reiniciar `dev`. El build no se ve afectado.
- **Modo local (abierto):** eliminar una obra o cambiar su slug deja una carpeta vacía. Git la ignora.

## Decisión pendiente: GitHub App o Keystatic Cloud

Queda por decidir. Solo se probó la GitHub App.

| | GitHub App | Keystatic Cloud |
|---|---|---|
| Estado | Probada: login y commits funcionan | Sin probar |
| Usuarios | Sin límite propio; cada editor necesita cuenta de GitHub con permiso de escritura | Gratis hasta 3 usuarios, según `TAREAS.md`. [PENDIENTE: confirmar el límite vigente] |
| A cargo del equipo | Instalación de la App, tres secretos y callback por cada dominio | [PENDIENTE: evaluar al probarla] |

Hay que decidirlo antes de T14, porque define los secretos, los roles y el manual.

## No probado

- **"El sitio se reconstruye" tras un guardado:** **no probado**. Es parte de la aceptación de T12 y requiere conectar Cloudflare al fork. Por eso esa aceptación queda incompleta.
- **Crear una obra en la vista previa:** no probado. En modo GitHub solo se editó una obra existente; la creación se probó en modo local.
- **Cloudflare Access (T14)** tampoco se probó: hoy `/keystatic` es público y su acceso depende del login de GitHub.

## Omitido por decisión del usuario

- **Revisión visual en 360, 768 y 1280 px:** las 21 páginas públicas salieron idénticas byte a byte a la línea base, también en el build final de `build:panel`.
- **Verificación independiente.**
- **Revisión de Gentle AI:** no se hizo. Falló dos veces por exceder el presupuesto de contexto y después se dejó de ejecutar.
