# Manual del panel de obras

Este manual le permite crear y editar las obras del sitio sin tocar código. Cada vez que usted guarda, el cambio queda registrado con su nombre y la fecha, y se puede recuperar.

> **Marcadores `[PENDIENTE: ...]`:** indican un dato que aún no está definido. Se completarán antes de la capacitación con el equipo.

## Lo esencial

1. Inicie sesión en el panel.
2. Cree una **rama de trabajo**, que es una copia donde sus cambios todavía no se publican.
3. Cree o edite la obra y pulse **Guardar**.
4. Pulse **Crear Pull Request** para pedir que se publique.
5. La persona administradora revisa y publica el cambio.

Si duda, consulte antes a la persona administradora: [PENDIENTE: nombre y contacto de la persona administradora].

## Antes de empezar

- Necesita una cuenta de GitHub con verificación en dos pasos (2FA) y permiso de escritura en el repositorio. La persona administradora se lo otorga.
- Parte del panel está en inglés, porque la herramienta no lo traduce por completo. Este manual indica esos textos tal como aparecen.

## Iniciar sesión

1. Abra [PENDIENTE: dirección definitiva del panel, se define en la salida a producción].
2. Pulse **Log in with GitHub**.
3. Ingrese su usuario, contraseña y código de verificación de GitHub.
4. La primera vez, GitHub le pedirá autorizar la aplicación del panel. Acéptelo.

Si usa una computadora compartida, trabaje en una ventana privada del navegador y ciérrela al terminar.

## Crear una rama de trabajo

Trabaje siempre en una rama propia. Así, nada llega al sitio publicado hasta que se revise.

1. Abra el menú de ramas del panel, donde se muestra la **Rama actual**.
2. Elija **Nueva rama**.
3. En **Branch name**, escriba un nombre corto y sin espacios que describa el trabajo, por ejemplo `fotos-rio-lurin`.
4. En **Basado en**, elija **Rama predeterminada**, salvo que vaya a continuar un trabajo de la rama actual.
5. Confirme la creación.

Compruebe en **Rama actual** que está en su rama antes de editar. Para continuar otro día, selecciónela en **Otras ramas**.

## Crear una obra

1. Entre en **Obras** y pulse **Agregar**.
2. Complete los campos. Solo son obligatorios **Título**, **Orden** y **Resumen**.
3. Revise la **Dirección web (slug)**, que se propone a partir del título.
4. Agregue las fotos (vea [Subir fotos](#subir-fotos)).
5. Pulse **Crear**.

| Campo | Qué debe saber |
|---|---|
| Orden | Los números menores aparecen primero en los listados |
| Resumen | Una o dos frases, para el listado y el mapa |
| Coordenadas | Latitud y longitud separadas por una coma: `-12.0566, -77.0428`. Vacío: la obra no sale en el mapa |
| Servicios | La obra aparecerá en "Obras relacionadas" de cada servicio marcado |
| Cifras | Máximo 3 |
| Lo que hicimos | Si queda vacío, la ficha muestra el texto de **Solución** |

Use solo datos confirmados por la empresa. Si falta alguno, deje el campo vacío y consúltelo.

## Editar una obra

1. Entre en **Obras** y abra la obra.
2. Haga los cambios. Aparecerá la marca **Unsaved** mientras haya cambios sin guardar.
3. Pulse **Guardar**.

El botón **Guardar** solo se activa si hubo cambios. Para descartarlos antes de guardar, use **Reset changes** en el menú de la obra.

## Enviar sus cambios a publicación

1. Con su rama seleccionada, pulse **Crear Pull Request**. Se abrirá GitHub.
2. Describa brevemente el cambio y confirme la creación.
3. La persona administradora lo revisa y lo une a la rama principal.

[PENDIENTE: confirmar en la vista previa que el sitio se reconstruye solo después de unir el cambio, y cuánto tarda. Aún no se ha probado.]

## Subir fotos

| Aspecto | Recomendación |
|---|---|
| Tamaño | De 2000 a 2400 px en el lado mayor. Máximo 3000 px |
| Peso | Hasta unos 2 MB por foto |
| Formato | JPG. Convierta a JPG las fotos HEIC de los celulares |
| Nombre | Descriptivo, por ejemplo `muro-contencion-avance.jpg` |
| Descripción | Complete **Descripción de la foto**: la usan quienes no pueden ver la imagen |

El sitio genera por sí solo las versiones optimizadas. El panel limpia el nombre y le agrega un sufijo, de modo que dos fotos con el mismo nombre no se sobrescriben.

Los botones para elegir y quitar archivos están en inglés: **Choose file**, **Remove** y **Done**.

### Portada frente a galería

Son dos campos distintos y cada uno se ve en lugares diferentes:

| | Portada | Galería de fotos |
|---|---|---|
| Dónde se ve | Listado, mapa, destacados y vista previa al compartir la obra | Ficha de la obra y contador "N fotos" |
| Cantidad | Una | Varias, en el orden de la lista |
| Etapa | No lleva | Antes, Durante la obra, Obra terminada o Render del proyecto |

**La portada no aparece en la ficha por sí sola.** Si quiere que esa foto también se vea allí, súbala además a la galería y déjela en el primer lugar de la lista.

Sin portada, la obra no puede salir en los destacados. Si usa **Foto de antes**, cargue también la portada.

## Destacar una obra

| Casilla | Dónde aparece | Límite |
|---|---|---|
| Obra grande del Inicio | Obra principal del Inicio | **Una sola obra** |
| Destacada en Proyectos | Obra principal de la página Proyectos | **Una sola obra** |
| Destacada en el Inicio | Franja "Más obras" | Se muestran hasta 4 |

Todas requieren portada para mostrarse.

Para cambiar la obra grande del Inicio o la destacada en Proyectos, primero desmarque la obra actual y luego marque la nueva, y guarde ambas en la misma rama.

## Ocultar una obra (borrador)

Marque **Borrador** y guarde. La obra desaparece del sitio publicado, incluidos el listado, el mapa, los filtros y los contadores, pero se conserva en el panel. Para volver a mostrarla, desmarque la casilla.

Prefiera **Borrador** antes que eliminar si la obra puede volver a publicarse.

## Advertencias

| Si usted... | Ocurre que... | Qué hacer |
|---|---|---|
| Cambia el **slug** | Cambia la URL y la dirección anterior deja de funcionar | Cámbielo solo si es indispensable y avise a la persona administradora |
| Marca **Obra grande del Inicio** o **Destacada en Proyectos** en dos obras | **El sitio no se podrá publicar**, aunque una de ellas sea borrador | Deje la casilla en una sola obra |
| Quita de la **galería** una foto que usa el recorrido | Se borra el archivo y **el sitio no se podrá publicar** | Consulte antes de quitar fotos en las obras de la lista siguiente |
| Copia una foto a mano en la carpeta de la obra, sin agregarla a la **galería** | La foto **no aparece** en el sitio y no se muestra ningún error | Súbala siempre desde el panel |

**Obras con recorrido animado.** El panel no muestra qué fotos usa el recorrido, así que consulte antes de quitar una foto de estas obras:

- `crematorio-surco`
- `osinergmin`
- `pantanos-de-villa`
- `plaza-bolognesi`
- `plaza-dos-de-mayo`
- `rio-rimac-ramiro-priale`

**Obras con bloques fijos.** No cambie el slug de estas obras sin avisar: el Inicio o la página Proyectos las buscan por ese nombre y sus bloques cambiarían o dejarían de mostrarse.

- `costa-verde`
- `rio-rimac-ramiro-priale`
- `casa-hacienda`
- `osinergmin`
- `rio-lurin`
- `parque-canepa`

## Recuperar un cambio

**El historial conserva lo guardado.** Al eliminar una obra, el panel muestra el mensaje *"This action cannot be undone"*, pero la obra sigue en el historial y se puede recuperar.

| Situación | Cómo recuperarlo |
|---|---|
| Aún no guardó | **Reset changes**, en el menú de la obra |
| Guardó en su rama y todavía no se publicó | Corrija y vuelva a guardar. Si quiere abandonar todo, pida eliminar la rama |
| Ya se publicó | Abra el Pull Request en GitHub y pulse **Revert**. Se crea otro Pull Request que deshace el cambio y que también debe unirse |
| Necesita solo un texto anterior | Use **View on GitHub** en el menú de la obra, abra **History**, elija la fecha, copie el texto y péguelo en el panel |
| Se eliminó una obra o una foto | Avise a la persona administradora con la obra y la fecha aproximada |

En el historial, los cambios del panel aparecen con un mensaje genérico, como `Update src/content/obras/rio-lurin/datos`. Búsquelos por obra, persona y fecha.

## Qué no se puede editar aún

Pida estos cambios a la persona administradora:

- El **recorrido animado** de las obras.
- La **nota de prensa** de las obras.
- Los servicios, los textos legales, Nosotros, Contacto y demás páginas: el panel administra solo obras.
- Las obras y los textos fijos del Inicio descritos en [Advertencias](#advertencias).

## Si algo falla

| Mensaje o síntoma | Qué hacer |
|---|---|
| `Resource not accessible by integration` | Avise a la persona administradora: debe revisar la instalación de la GitHub App |
| *"Changes must be made via pull request..."* | La rama está protegida. Cree una [rama de trabajo](#crear-una-rama-de-trabajo) |
| *"This entry has been updated since it was opened"* | Otra persona modificó la obra. Cree una rama para guardar y avise a la persona administradora |
| No puede guardar o iniciar sesión | Confirme que tiene permiso de escritura y 2FA activo |
