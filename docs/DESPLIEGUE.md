# Publicar el sitio en Cloudflare

Esta guía lleva el sitio del prototipo al dominio `www.mmhighmetrik.com`, con el panel protegido y el sitio reconstruido desde GitHub. Está dirigida a quienes administran el repositorio, Cloudflare y el DNS.

**Estado:** nada de esto se ha ejecutado. Solo se preparó el código: brochure propio, script de Vercel condicionado y archivo de redirecciones. Lea primero [Lo que aún no se ha probado](#lo-que-aún-no-se-ha-probado).

## Orden general

Siga este orden. Cloudflare exige que el dominio esté activo antes de asociarlo al Worker, y Access debe existir antes del primer despliegue para que el panel nunca quede abierto.

| # | Paso | Afecta al público |
|---|---|---|
| 1 | [Repositorio definitivo](#1-repositorio-definitivo) | No |
| 2 | [GitHub App nueva](#2-github-app-nueva) | No |
| 3 | [Activar el dominio en Cloudflare](#3-activar-el-dominio-en-cloudflare) | Solo si faltan registros DNS |
| 4 | [Cloudflare Access](#4-cloudflare-access) | No |
| 5 | [Worker y Workers Builds](#5-worker-y-workers-builds) | No |
| 6 | [Variables y secretos](#6-variables-y-secretos) | No |
| 7 | [Probar en el dominio de revisión](#7-probar-en-el-dominio-de-revisión) | No |
| 8 | [Cambiar `www` al sitio nuevo](#8-cambiar-www-al-sitio-nuevo) | **Sí** |
| 9 | [Activar la indexación](#9-activar-la-indexación) | **Sí** |
| 10 | [Retirar lo provisional](#10-retirar-lo-provisional) | No |

Antes de los pasos 8 y 9, revise la [checklist previa](#checklist-previa) y tenga a mano el [plan de reversa](#plan-de-reversa).

## Decisiones y accesos que debe dar la empresa

| Tema | Pendiente |
|---|---|
| Repositorio | [PENDIENTE: organización de GitHub y nombre del repositorio, acordados con el líder del proyecto y la empresa] |
| Personas | [PENDIENTE: administradores y editores, con correo y cuenta de GitHub] |
| Revisión obligatoria | [PENDIENTE: decidir si justifica pagar GitHub Team. Ver `docs/ACCESOS.md`] |
| Cuenta de Cloudflare | [PENDIENTE: cuenta de la empresa, con al menos dos administradores] |
| Plan de Cloudflare | [PENDIENTE: confirmar que el plan elegido cubre el uso comercial de la empresa, según sus términos vigentes] |
| Dominio | [PENDIENTE: quién administra el registrador y el DNS de `mmhighmetrik.com`] |
| Sitio antiguo | [PENDIENTE: dónde está alojado, quién lo administra y cuántos días se conserva después del cambio] |
| URL antiguas | [PENDIENTE: lista de URL antiguas que conviene conservar] |
| Fecha | [PENDIENTE: fecha y horario del cambio de dominio] |
| Indexación | [PENDIENTE: visto bueno de la empresa] |

## 1. Repositorio definitivo

El fork actual no sirve para producción: es público y GitHub no permite hacer privado el fork de un repositorio público.

1. Cree la organización y exija 2FA. Ver `docs/ACCESOS.md`. [PENDIENTE: organización]
2. Cree un repositorio **privado y vacío**, que no sea un fork. [PENDIENTE: nombre]
3. Deje en su `main` todas las tareas aprobadas, porque el panel crea las ramas desde allí y Cloudflare publica desde allí. [PENDIENTE: el líder del proyecto decide qué rama se lleva]
4. En `keystatic.config.ts`, cambie `storage.repo`, que hoy apunta a `steffano-llo/mmhm-web`.
5. Dé acceso a las personas según los roles de `docs/ACCESOS.md`.

## 2. GitHub App nueva

Cree una App propia para este repositorio. No reutilice la de la prueba T12.

Regístrela a mano para que pertenezca a la organización: **Your organizations > Settings > Developer settings > GitHub Apps > New GitHub App**. El botón **Create GitHub App** del panel solo funciona en modo de desarrollo y crea una App pública.

| Campo | Valor |
|---|---|
| GitHub App name | [PENDIENTE: nombre, máximo 34 caracteres] |
| Homepage URL | `https://www.mmhighmetrik.com/keystatic` |
| Callback URL | Las tres de la lista siguiente |
| Request user authorization (OAuth) during installation | Activado |
| Webhook | Desactivado: el panel no lo usa |
| Permisos del repositorio | Contents: **Read and write**. Metadata: **Read-only**. Pull requests: **Read-only** |
| Where can this GitHub App be installed? | **Only on this account** |

Callback URL:

```text
https://www.mmhighmetrik.com/api/keystatic/github/oauth/callback
https://revision.mmhighmetrik.com/api/keystatic/github/oauth/callback
http://127.0.0.1/api/keystatic/github/oauth/callback
```

Los permisos, el callback y la autorización son los que Keystatic 0.6.9 solicita en su propio formulario. La última URL solo sirve para trabajar en local: omítala si nadie usará el modo GitHub en su equipo.

Después de crearla:

1. Instale la App **solo en el repositorio definitivo**.
2. Anote el **Client ID** y el nombre corto (slug) que aparece en la URL de la App.
3. Genere un **client secret**. No lo escriba en correos, chats ni en este repositorio.

Si al guardar aparece `Resource not accessible by integration`, revise que la App esté instalada en el repositorio correcto. Ocurrió en T12.

## 3. Activar el dominio en Cloudflare

Este paso no mueve el sitio, siempre que el DNS quede copiado completo.

1. Agregue `mmhighmetrik.com` a la cuenta de Cloudflare. [PENDIENTE: cuenta]
2. **Guarde una copia del DNS actual** y compárela registro por registro con lo que Cloudflare detectó, incluidos `MX` y `TXT` si existen. La copia es también su plan de reversa.
3. Cambie los servidores de nombres en el registrador. [PENDIENTE: acceso al registrador]
4. Espere a que la zona figure como activa.
5. Compruebe que el sitio antiguo y el correo del dominio, si lo hay, siguen funcionando.

Esta guía usa `revision.mmhighmetrik.com` para las pruebas. [PENDIENTE: confirmar el subdominio]

## 4. Cloudflare Access

Hágalo antes del primer despliegue. Sin Access, el panel solo queda protegido por el login de GitHub.

1. En **Zero Trust > Access controls > Applications**, elija **Create new application > Self-hosted and private > Add public hostname**.
2. Agregue estas rutas en **ambos** dominios, `www` y `revision`:
   - `keystatic*`
   - `api/keystatic*`
3. Cree una política **Allow**, regla **Include**, selector **Emails**, con la lista de correos. [PENDIENTE: lista de correos]
4. Elija el método de identificación y pulse **Create**. [PENDIENTE: método de identificación]

Use `keystatic*` y no `keystatic/*`: según Cloudflare, `example.com/alpha/*` no cubre `example.com/alpha`.

[PENDIENTE: verificar el límite vigente de usuarios del plan gratuito de Zero Trust. Las páginas oficiales consultadas no lo indican.]

## 5. Worker y Workers Builds

### Ajustar `wrangler.jsonc`

Hoy apunta al Worker de prueba `mmhm-web-spike`. En el repositorio definitivo, déjelo así:

```jsonc
{
  "name": "[PENDIENTE: nombre del Worker]",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2026-01-14",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./dist", "binding": "ASSETS" },
  "workers_dev": false,
  "preview_urls": false,
  "routes": [
    { "pattern": "revision.mmhighmetrik.com", "custom_domain": true }
  ]
}
```

- **`name`** debe coincidir con el nombre del Worker en Cloudflare, o el build falla.
- **`workers_dev` y `preview_urls` en `false`** son obligatorios: esas URL públicas saltarían Access.

### Conectar el repositorio

Vaya a **Workers & Pages > Create application > GitHub**, elija el repositorio y use esta configuración. Después se ajusta en **Settings > Build**.

| Campo | Valor |
|---|---|
| Git branch | `main` |
| Build command | `npm run build:panel` |
| Deploy command | `npx wrangler deploy` |
| Preview command | `npx wrangler versions upload` |
| Root directory | Vacío |

### Cuándo se reconstruye el sitio

Cada commit en `main` reconstruye y publica. Los guardados del panel son commits, pero **no todos publican**:

| Dónde guarda la persona | Qué ocurre |
|---|---|
| En una rama de trabajo, el flujo de `docs/MANUAL-PANEL.md` | Corre el **Preview command**. El sitio publicado no cambia |
| Al unir el Pull Request a `main` | Se reconstruye y se publica |
| Directamente en `main`, si no está protegida | Se reconstruye y se publica de inmediato, sin revisión |
| Un guardado que hace fallar el build | El despliegue no llega a ejecutarse y sigue en línea la versión anterior |

Cada guardado en una rama consume minutos de build. Las páginas consultadas no describen cómo desactivar esos builds. [PENDIENTE: revisar en el panel de Cloudflare si se pueden desactivar en las ramas de trabajo]

[PENDIENTE: decidir quién recibe el aviso de un build fallido. Si nadie lo mira, una persona editora creerá que su cambio se publicó.]

### Límites del plan gratuito

| Recurso | Límite |
|---|---|
| Solicitudes a archivos estáticos | Gratuitas y sin límite |
| Solicitudes que ejecutan el Worker, como las del panel | 100 000 al día |
| Archivos por versión | 20 000 |
| Tamaño por archivo | 25 MiB. `brochure.pdf` pesa unos 8,2 MiB |
| Workers Builds | 3000 minutos al mes, 1 build a la vez, máximo 20 minutos cada uno |
| Redirecciones en `_redirects` | 2000 estáticas y 100 dinámicas |

Datos consultados el 5 de noviembre de 2026. Confírmelos antes de elegir el plan.

## 6. Variables y secretos

Cloudflare los guarda en **dos lugares distintos**. Las variables del build no existen cuando el sitio ya corre, y al revés. `docs/ACCESOS.md` explica cada una y cómo rotarlas.

### Variables del build

Se cargan en **Settings > Build > Build variables and secrets**. Un cambio se aplica en el **siguiente build**.

| Variable | Valor |
|---|---|
| `SITE_URL` | `https://www.mmhighmetrik.com` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | El slug de la App del paso 2 |
| `NODE_VERSION` | Versión exacta. El predeterminado cambia con el tiempo. [PENDIENTE: fijarla al confirmar el primer build, hoy el predeterminado es 24.22.1] |
| `PUBLIC_INDEXABLE` | **No la cree todavía.** Ver el [paso 9](#9-activar-la-indexación) |

### Secretos del Worker

Se cargan en **Settings > Variables & Secrets**, o con `npx wrangler secret put <NOMBRE>`. Este comando publica una versión nueva de inmediato.

| Secreto | Origen |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | La App del paso 2 |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | La App del paso 2 |
| `KEYSTATIC_SECRET` | Valor nuevo de al menos 32 caracteres, por ejemplo con `openssl rand -hex 32` |

## 7. Probar en el dominio de revisión

- [ ] El primer build termina bien. Revise que `sharp` y `workerd` se instalen en el entorno Linux de Cloudflare.
- [ ] Las páginas muestran `noindex, nofollow` y no piden Access.
- [ ] `/brochure.pdf` abre el PDF.
- [ ] No hay error de `/_vercel/insights/script.js` en la consola.
- [ ] Con un correo no autorizado, `/keystatic` y `/api/keystatic/github/login` quedan bloqueados.
- [ ] Con un correo autorizado, el login de GitHub termina bien y regresa al panel.
- [ ] Guardar en una rama crea un commit y **no** cambia el sitio publicado.
- [ ] Unir ese cambio a `main` reconstruye el sitio. Anote cuánto tarda y complete `docs/MANUAL-PANEL.md`.
- [ ] Antes del cambio de dominio, un commit en `main` que haga fallar el build deja en línea la versión anterior. Reviértalo después de comprobarlo.
- [ ] Crear una obra desde el panel en modo GitHub termina bien.
- [ ] `/keystatic` y `/api/keystatic/github/login` envían `X-Robots-Tag: noindex, nofollow`.
- [ ] La URL de `workers.dev` no responde.

## 8. Cambiar `www` al sitio nuevo

Hágalo con el visto bueno de la empresa y fuera del horario de mayor uso. [PENDIENTE: fecha y horario]

1. Cargue las redirecciones en `public/_redirects`. [PENDIENTE: lista de URL antiguas]
2. Compruebe qué registro tiene hoy `www`. Cloudflare no permite crear el dominio sobre un `CNAME` existente: **elimínelo justo antes del paso siguiente** y deje copia de su valor.
3. Agregue `www` a `routes` en `wrangler.jsonc` y súbalo a `main`:

   ```jsonc
   { "pattern": "www.mmhighmetrik.com", "custom_domain": true }
   ```

4. Cloudflare crea el registro DNS y el certificado HTTPS.
5. Redirija `mmhighmetrik.com` a `www`, con un registro de marcador con proxy y una regla de redirección. `_redirects` no lo cubre porque no admite reglas por dominio.
6. Conserve el sitio antiguo en su hosting hasta terminar el periodo acordado. [PENDIENTE: días]

Compruebe:

- [ ] `https://www.mmhighmetrik.com` abre el sitio nuevo con certificado válido.
- [ ] `https://mmhighmetrik.com` y `http://www.mmhighmetrik.com` llevan a `https://www.mmhighmetrik.com`.
- [ ] `/brochure.pdf`, `/privacidad/` y `/terminos/` abren.
- [ ] Las URL de la lista antigua redirigen con 301.
- [ ] El panel sigue protegido por Access en `www`, y el login y un guardado de prueba funcionan.
- [ ] Las páginas públicas abren sin Access.
- [ ] El correo del dominio, si lo hay, sigue funcionando.

## 9. Activar la indexación

Este orden evita que los buscadores registren una versión a medias. No lo adelante.

1. Termine el paso 8 y la [checklist previa](#checklist-previa).
2. Obtenga el visto bueno de la empresa por escrito. [PENDIENTE: visto bueno y responsable]
3. Cree `PUBLIC_INDEXABLE` con el valor exacto `true` en las variables del **build**.
4. Lance un build nuevo. Cambiar la variable no modifica las páginas ya publicadas.
5. Compruebe:
   - [ ] Las páginas públicas muestran `index, follow`.
   - [ ] `/robots.txt` indica el sitemap en `www.mmhighmetrik.com`.
   - [ ] `/sitemap-index.xml` responde y no incluye rutas del panel.
   - [ ] Las canónicas usan `www.mmhighmetrik.com`.
   - [ ] `/keystatic` sigue enviando `X-Robots-Tag: noindex, nofollow`.
6. Registre el sitio en Google Search Console y envíe el sitemap. [PENDIENTE: cuenta de la empresa]

## 10. Retirar lo provisional

- [ ] Elimine el Worker `mmhm-web-spike` y sus secretos.
- [ ] Elimine `https://revision.mmhighmetrik.com` de `routes`, de Access y de los callback de la App.
- [ ] Retire o proteja el prototipo `mmhm-p.vercel.app`: el plan Hobby de Vercel no permite uso comercial. [PENDIENTE: decisión del líder del proyecto]
- [ ] Retire el sitio antiguo al terminar el periodo acordado. [PENDIENTE: días]

## Plan de reversa

Actúe según lo que falló. Ninguno de estos caminos se ha ensayado: pruebe el primero en el dominio de revisión.

| Qué falló | Qué hacer |
|---|---|
| Una versión publicada tiene errores | En el Worker, **Deployments**, menú de tres puntos, **Rollback**, o `npx wrangler rollback`. Solo alcanza las 100 versiones más recientes. **También revierta el commit en `main`**, o el siguiente cambio volverá a publicar el error |
| Un build falló | No hace falta revertir: sigue en línea la versión anterior. Corrija y vuelva a subir |
| El dominio nuevo no funciona | Quite `www` de `routes` o del Worker, y restaure el registro DNS guardado para volver al sitio antiguo |
| El cambio de servidores de nombres afectó a otros servicios | Corrija el registro que falta en Cloudflare. Volver a los servidores anteriores también funciona, pero tarda más en propagarse |
| Se activó la indexación por error | Elimine `PUBLIC_INDEXABLE`, lance un build nuevo y pida la retirada de las URL en Search Console. Un rollback también lo revierte, pero el siguiente build mantiene la variable si no la elimina |
| El panel quedó expuesto | Quite el dominio del Worker o corrija la política de Access de inmediato. Luego rote los secretos según `docs/ACCESOS.md` |
| Los builds se disparan sin control | **Settings > Builds > Disconnect**. El sitio sigue en línea con la última versión |

Un rollback restaura el código, no el contenido: las obras guardadas siguen en el repositorio.

## Checklist previa

Antes del paso 8:

- [ ] Todas las decisiones de la tabla inicial están resueltas.
- [ ] `npm run build:panel` termina sin errores con la versión de `main`.
- [ ] El paso 7 está completo, en especial el login detrás de Access y la reconstrucción.
- [x] `npm audit` está revisado (ver `docs/qa.md`, sección «Dependencias»). En T12 dio 13 avisos, 1 crítico en `astro` (histórico). Tras la revisión quedan 12, con exposición baja para el sitio público; la migración a Astro 7 queda como tarea futura.
- [ ] `imagen()` de `keystatic.config.ts` se volvió a probar si Keystatic cambió de versión.
- [ ] Hay copia del DNS antiguo y alguien tiene acceso al registrador durante el cambio.
- [ ] `public/_redirects` tiene la lista de la empresa.
- [ ] `brochure.pdf` es la versión vigente, aprobada por la empresa.
- [ ] `docs/MANUAL-PANEL.md` y `docs/ACCESOS.md` están al día, y los editores están capacitados.

Antes del paso 9:

- [ ] Ninguna página publicada contiene `[PENDIENTE`.
- [ ] Los textos de Privacidad y Términos tienen la aprobación de la empresa. [PENDIENTE: área legal]
- [ ] Los recorridos de `docs/recorridos-por-validar.md` están validados.
- [ ] Logos, cifras y certificaciones tienen autorización. [PENDIENTE: empresa]

## Lo que aún no se ha probado

| Tema | Riesgo |
|---|---|
| Reconstrucción tras un guardado | Nunca se conectó Workers Builds. Es la prueba central del paso 7 |
| Login de GitHub detrás de Access | Puede fallar el regreso desde GitHub |
| GitHub App registrada a mano | En T12 se usó otra App; esta guía toma los valores del código de Keystatic |
| Crear una obra en modo GitHub | Solo se probó en modo local |
| `_redirects` en Cloudflare | Se probó en el runtime local de Workers: un archivo solo con comentarios no aplica reglas y una regla de prueba devolvió 301. Falta probarlo en línea |
| Script de Vercel en Vercel | Se probó simulando `VERCEL=1` en un build local. En Cloudflare no se carga porque esa variable no está definida |

## Fuentes

Consultadas el 5 de noviembre de 2026.

- Cloudflare: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/), [configuración](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [imagen de build](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/), [límites de builds](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/), [redirecciones](https://developers.cloudflare.com/workers/static-assets/redirects/), [archivos estáticos](https://developers.cloudflare.com/workers/static-assets/), [límites de Workers](https://developers.cloudflare.com/workers/platform/limits/), [dominios propios](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [rollbacks](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/), [aplicaciones de Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/).
- GitHub: [registrar una GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app).
- Keystatic: [modo GitHub](https://keystatic.com/docs/github-mode) y el formulario de `@keystatic/core` 0.6.9.
