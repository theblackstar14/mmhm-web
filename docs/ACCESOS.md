# Accesos y seguridad del panel

Este documento define quién entra al panel, dónde viven los secretos y qué hacer ante una rotación o una salida. Está dirigido a quienes administran el repositorio y el hosting.

**Estado:** hoy solo está aplicada la cabecera que oculta el panel a los buscadores. El resto se aplica en T18. Hasta entonces, el panel de la vista previa solo está protegido por el login de GitHub.

## Capas de protección

| Capa | Qué hace | Estado |
|---|---|---|
| `X-Robots-Tag: noindex, nofollow` en `/keystatic*` y `/api/keystatic*` | Pide a los buscadores no indexar. **No impide el acceso** | Aplicada en `src/middleware.ts` |
| Cloudflare Access | Exige un correo autorizado antes de llegar al panel | Pendiente, T18 |
| Login de GitHub | Identifica a la persona | Probado en T12 |
| Permiso de escritura en el repositorio | Decide quién puede guardar | Probado en T12 |

No use `Disallow` en `robots.txt` para el panel: impediría a los buscadores leer la cabecera `noindex`, y además publicaría la ruta.

## Roles

Keystatic exige permiso de **escritura** para guardar, así que quien solo tenga lectura no podrá usar el panel.

| Rol | Permiso en el repositorio | Puede |
|---|---|---|
| Administrador | Admin | Gestionar accesos y secretos, y unir cambios en `main` |
| Editor | Write | Crear ramas, guardar obras y abrir Pull Requests |

[PENDIENTE: lista de editores y administradores, con su correo y cuenta de GitHub. La entrega la empresa.]

**Use una organización de GitHub.** En una cuenta personal solo existen el propietario y los colaboradores, sin roles. Una organización ofrece Read, Triage, Write, Maintain y Admin.

**Limitación del plan gratuito:** GitHub lista las ramas protegidas en repositorios privados entre las funciones de Pro y Team. En una organización Free no se pudo confirmar que estén disponibles. Sin ellas, un editor con Write puede guardar directamente en `main`, y la revisión previa queda solo como norma de trabajo. [PENDIENTE: la empresa decide si la revisión obligatoria justifica pagar GitHub Team.]

## 2FA obligatorio

Todas las cuentas con acceso deben tener la verificación en dos pasos activa.

- **En una organización:** actívelo en la configuración de seguridad. Los miembros sin 2FA pierden acceso a los recursos hasta activarlo. Los colaboradores externos sin 2FA **son retirados** de la organización.
- **Métodos:** prefiera una aplicación autenticadora, una llave de seguridad o una passkey. Se puede exigir que no se use SMS.
- **Antes de activarlo:** avise al equipo, para que nadie pierda el acceso de improviso.
- **En una cuenta personal:** no se puede exigir a los colaboradores. Es otra razón para usar una organización.

La página de planes de GitHub no lo indica de forma explícita para organizaciones Free. Confírmelo al crear la organización.

## Repositorio privado

**El fork actual no puede ser privado.** GitHub no permite cambiar la visibilidad de un fork de un repositorio público. Producción necesita un repositorio privado nuevo de la empresa, que no sea un fork.

Al crearlo:

1. Actualice `storage.repo` en `keystatic.config.ts`, que hoy apunta a `steffano-llo/mmhm-web`.
2. Deje `main` al día, porque el panel crea las ramas desde allí.
3. Instale la GitHub App solo en ese repositorio.

[PENDIENTE: acordar con el líder del proyecto y la empresa dónde vivirá el repositorio definitivo.]

## GitHub App frente a Keystatic Cloud

**Recomendación: GitHub App.** Es la única opción probada en este proyecto, no limita usuarios y mantiene el control de acceso y el 2FA en GitHub. [PENDIENTE: decisión final del responsable del proyecto. Este documento y el manual asumen la GitHub App.]

| | GitHub App | Keystatic Cloud |
|---|---|---|
| Estado en el proyecto | Probada en T12: login y commits funcionan | Sin probar |
| Costo | Gratis | Gratis hasta 3 usuarios por equipo. Pro desde 10 USD al mes, y 5 USD al mes por cada usuario adicional |
| Cuenta de los editores | GitHub, con permiso de escritura | No necesitan cuenta de GitHub |
| Secretos a cargo del equipo | Tres secretos y el slug | Ninguna variable de entorno ni App propia |
| Configuración | `storage: { kind: 'github' }` | `storage: { kind: 'cloud' }` y `cloud: { project }` |
| Dependencia externa | GitHub | GitHub y el servicio de Keystatic Cloud |
| 2FA | Se exige en GitHub | [PENDIENTE: revisar qué control ofrece] |
| Uso comercial del plan gratuito | No aplica | [PENDIENTE: revisar sus términos, que la documentación no aclara] |

Datos de Keystatic Cloud tomados de <https://keystatic.com/docs/cloud> el 3 de noviembre de 2026. Ese día, `keystatic.cloud` respondió error 500 a una consulta automática, así que revise sus precios vigentes antes de decidir.

## Dónde viven los secretos

| Variable | Tipo | Producción | Local |
|---|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Identificador de la App | Secreto del Worker | `.env` |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | **Secreto** | Secreto del Worker | `.env` |
| `KEYSTATIC_SECRET` | **Secreto**, mínimo 32 caracteres. Cifra el token de renovación guardado en una cookie | Secreto del Worker | `.env` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Público, queda incluido en el sitio | Variable **del build** | `.env` |
| `PUBLIC_INDEXABLE` | Público. Solo con el valor `true` los buscadores pueden indexar el sitio; si falta, las páginas llevan `noindex` | Variable **del build**. Actívela solo con el visto bueno de la empresa | No hace falta |
| `SITE_URL` | Público. Dominio para canonical, Open Graph, sitemap y `robots.txt`. Si falta, se usa el dominio de revisión | Variable **del build**: `https://www.mmhighmetrik.com` | No hace falta |

- **Nunca** los escriba en el repositorio, `wrangler.jsonc`, la documentación, correos o chats.
- `.env` y `.dev.vars` están ignorados por git. `.env.example` solo contiene los nombres.
- El build de T12 no incluyó los tres primeros en `dist/`.
- El Worker `mmhm-web-spike` de T12 tiene sus propios secretos. Retírelo en T18.

## Rotar los secretos

Rote si hay sospecha de filtración o sale una persona administradora, y como rutina al menos una vez al año. La frecuencia es una sugerencia que la empresa puede ajustar.

`wrangler secret put` crea una versión del Worker y **la despliega de inmediato**. Haga la rotación fuera del horario de edición. Agregue `--name <worker-de-produccion>` si el `wrangler.jsonc` aún no apunta a producción.

**`KEYSTATIC_GITHUB_CLIENT_SECRET`**

1. En GitHub, abra la configuración de la App y genere un **client secret** nuevo.
2. Cárguelo con `npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET`.
3. Pruebe iniciar sesión y guardar en una rama de prueba.
4. Elimine el secreto anterior en GitHub.

**`KEYSTATIC_SECRET`**

1. Genere un valor nuevo, por ejemplo con `openssl rand -hex 32`.
2. Cárguelo con `npx wrangler secret put KEYSTATIC_SECRET`.
3. Avise a los editores: el token de renovación anterior deja de servir y deberán volver a iniciar sesión cuando venza su sesión.

**`KEYSTATIC_GITHUB_CLIENT_ID`** cambia solo si se crea otra App. En ese caso, actualice también el slug y vuelva a hacer el build.

**Copias locales:** actualice su `.env` o `.dev.vars` si los usa.

## Si alguien deja la empresa

Hágalo el mismo día.

**Para cualquier persona con acceso:**

- [ ] Quítela de la organización o del repositorio. Su token del panel solo tiene los permisos que tengan a la vez ella y la App, así que pierde la escritura.
- [ ] Quite su correo de la política de Cloudflare Access.
- [ ] Revoque sus sesiones en Zero Trust: **Team & Resources > Users**, seleccione a la persona y use **Action > Revoke**.
- [ ] Revise sus ramas y Pull Requests abiertos: asígnelos a otra persona o ciérrelos.
- [ ] Actualice la lista de roles.

**Si además era administradora:**

- [ ] Rote `KEYSTATIC_GITHUB_CLIENT_SECRET` y `KEYSTATIC_SECRET`.
- [ ] Quítela de la cuenta de Cloudflare.
- [ ] Si era dueña de la GitHub App, transfiera la App a la organización. Conviene que siempre pertenezca a la organización, y no a una persona.
- [ ] Confirme que quede al menos otra persona administradora en GitHub y en Cloudflare.

Una revocación de Access no basta por sí sola: mientras la política autorice su correo, la persona puede abrir otra sesión. Por eso primero se quita el correo.

## Pasos para T18

No se ha configurado nada de esto. Hágalo en este orden. El orden de toda la publicación está en `docs/DESPLIEGUE.md`.

### 1. Preparar el Worker

En `wrangler.jsonc`, cambie `name` al Worker definitivo, agregue el dominio y desactive las URL públicas alternas:

```jsonc
"workers_dev": false,
"preview_urls": false
```

Son necesarias ambas claves: desactivar `workers.dev` no desactiva las URL de versión o de vista previa, que son públicas y **saltarían Cloudflare Access** si no se protegen también.

### 2. Configurar GitHub y secretos

1. Cree la organización, el repositorio privado y exija 2FA.
2. Agregue a la GitHub App el callback `https://<dominio>/api/keystatic/github/oauth/callback`.
3. Cargue los tres secretos con `npx wrangler secret put` y el slug como variable del build.

### 3. Configurar Cloudflare Access

1. En **Zero Trust > Access controls > Applications**, elija **Create new application**.
2. Elija **Self-hosted and private** y luego **Add public hostname**.
3. Agregue dos rutas del dominio, ambas con comodín: `keystatic*` y `api/keystatic*`.
4. Cree una política **Allow** con regla **Include**, selector **Emails** y la lista de correos autorizados.
5. Elija el método de identificación y pulse **Create**.

[PENDIENTE: verificar el límite vigente de usuarios del plan gratuito de Zero Trust. Las páginas oficiales consultadas no lo indican.]

### 4. Verificar

- [ ] En una ventana privada, con un correo no autorizado, `/keystatic` y `/api/keystatic/github/login` quedan bloqueados.
- [ ] Con un correo autorizado, el login de GitHub termina bien y regresa al panel. **Aún no se ha probado el callback de GitHub detrás de Access.**
- [ ] Guardar en una rama crea un commit, y unirlo a `main` reconstruye el sitio.
- [ ] El subdominio `workers.dev` y las URL de versión no responden.
- [ ] `/keystatic` y `/api/keystatic/github/login` envían `X-Robots-Tag: noindex, nofollow`.
- [ ] Las páginas públicas siguen abiertas sin Access.
- [ ] Retire el Worker `mmhm-web-spike` de T12 y sus secretos.

### 5. Coordinar con T16

Al agregar `@astrojs/sitemap` y `robots.txt`, compruebe que `/keystatic` y `/api/keystatic` no figuren en el sitemap. No los agregue a `robots.txt`.

## Fuentes

Consultadas el 3 y 4 de noviembre de 2026.

- GitHub: [roles de organización](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization), [permisos de cuentas personales](https://docs.github.com/en/get-started/learning-about-github/access-permissions-on-github), [exigir 2FA](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-two-factor-authentication-for-your-organization/requiring-two-factor-authentication-in-your-organization), [visibilidad de forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-permissions-and-visibility-of-forks), [planes](https://docs.github.com/en/get-started/learning-about-github/githubs-plans), [tokens de una App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app), [transferir una App](https://docs.github.com/en/apps/maintaining-github-apps/transferring-ownership-of-a-github-app).
- Cloudflare: [aplicaciones de Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/), [políticas](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/), [sesiones](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/), [workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [secretos](https://developers.cloudflare.com/workers/configuration/secrets/).
- Keystatic: [modo GitHub](https://keystatic.com/docs/github-mode), [Cloud](https://keystatic.com/docs/cloud).
