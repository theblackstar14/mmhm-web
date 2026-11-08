// Panel de obras. Cubre el esquema de src/content.config.ts: si cambia uno, hay que revisar el otro.
import { collection, config, fields } from '@keystatic/core';
import { SERVICIOS, TIPOS } from './src/lib/site';

// Por defecto trabaja en local. El modo GitHub se activa con --mode github (npm run dev:panel, build:panel).
const modoGithub = import.meta.env.MODE === 'github';

const texto = (label: string, description?: string) => fields.text({ label, description });
const textoLargo = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const obligatorio = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: true } });

// Las fotos viven junto a datos.md y el frontmatter las nombra como ./foto.jpg. Keystatic no lo soporta
// de fábrica: guarda el "./" dentro del nombre y arma rutas que su propio API rechaza.
const sinPunto = (v: unknown) => (typeof v === 'string' ? v.replace(/^\.\//, '') : v);
// Nombre sin espacios ni tildes y con sufijo único: un nombre repetido sobrescribiría otra foto de la obra sin avisar.
const nombreUnico = (original: string) => {
  const [, base, ext = ''] = original.match(/^(.*?)(\.[^.]*)?$/)!;
  const limpio = base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${limpio || 'foto'}-${Date.now().toString(36)}${ext.toLowerCase()}`;
};
const imagen = (label: string, description?: string, isRequired = false) => {
  const base = fields.image({
    label,
    description,
    directory: 'src/content/obras',
    validation: { isRequired },
    transformFilename: nombreUnico,
  });
  return {
    ...base,
    filename: (v: any, a: any) => base.filename(sinPunto(v), a),
    parse: (v: any, a: any) => base.parse(sinPunto(v), a),
    serialize: (v: any, a: any) => {
      // Sin sugerencia de nombre: Keystatic renombraría la foto a <campo>.jpg y, si otro campo la usa, la duplicaría.
      const r = base.serialize(v, { ...a, suggestedFilenamePrefix: undefined });
      return r.value ? { ...r, value: './' + r.value } : r;
    },
  } as typeof base;
};

// Omite la casilla cuando tiene su valor por defecto, para no agregar claves a obras que no la tienen.
const casilla = (label: string, description?: string, defaultValue = false) => {
  const base = fields.checkbox({ label, description, defaultValue });
  return {
    ...base,
    serialize: (v: boolean) => (v === defaultValue ? { value: undefined } : base.serialize(v)),
  } as typeof base;
};

// Coordenadas en una sola línea: en YAML siguen siendo [lat, lng] y, si quedan vacías, no se escribe la clave.
// Una lista de números permitiría guardar [] o un solo valor, y el build fallaría.
const coordenadas = (label: string, description: string) => {
  const base = fields.text({
    label,
    description,
    validation: {
      pattern: {
        regex: /^$|^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
        message: 'Escriba latitud y longitud separadas por una coma, por ejemplo: -12.0566, -77.0428',
      },
    },
  });
  return {
    ...base,
    parse: (v: any) => (Array.isArray(v) ? v.join(', ') : base.parse(v)),
    serialize: (v: string) => ({ value: v ? v.split(',').map((n) => Number(n.trim())) : undefined }),
  } as unknown as typeof base;
};

export default config({
  locale: 'es-ES',
  storage: modoGithub
    ? { kind: 'github', repo: { owner: 'steffano-llo', name: 'mmhm-web' } }
    : { kind: 'local' },
  collections: {
    obras: collection({
      label: 'Obras',
      path: 'src/content/obras/*/datos',
      slugField: 'titulo',
      format: { data: 'yaml', contentField: 'cuerpo' },
      schema: {
        titulo: fields.slug({
          name: { label: 'Título', description: 'Nombre de la obra, tal como se publica.', validation: { isRequired: true } },
          slug: {
            label: 'Dirección web (slug)',
            description: 'Forma parte de la URL de la obra y debe ser única. Si la cambia, la dirección anterior deja de funcionar.',
          },
        }),
        orden: fields.number({
          label: 'Orden',
          description: 'Posición en los listados: los números menores aparecen primero.',
          validation: { isRequired: true },
        }),
        tipo: fields.select({
          label: 'Tipo',
          options: Object.entries(TIPOS).map(([value, t]) => ({ label: t.n, value })),
          defaultValue: 'geo',
        }),
        servicios: fields.multiselect({
          label: 'Servicios',
          description: 'Servicios aplicados. La obra aparecerá en "Obras relacionadas" de cada uno.',
          options: SERVICIOS.map((s) => ({ label: s.sh, value: s.id })),
        }),
        resumen: fields.text({
          label: 'Resumen',
          description: 'Una o dos frases. Se muestra en el listado y en el mapa.',
          multiline: true,
          validation: { isRequired: true },
        }),
        ubicacion: texto('Ubicación'),
        cliente: texto('Cliente'),
        tramo: texto('Tramo', 'Opcional. Por ejemplo, el tramo de un río o de una vía.'),
        alcance: texto('Alcance', 'Opcional.'),
        periodo: texto('Periodo', 'Por ejemplo: 2023.'),
        plazo: texto('Plazo', 'Plazo contractual. Por ejemplo: 60 días.'),
        coords: coordenadas(
          'Coordenadas',
          'Latitud y longitud separadas por una coma, como las copia de Google Maps: -12.0566, -77.0428. Déjelo vacío si la obra no debe aparecer en el mapa.',
        ),
        portada: imagen('Portada', 'Foto principal de la obra. Sin portada, la obra no puede salir en los destacados del Inicio.'),
        fotos: fields.array(
          fields.object({
            img: imagen('Foto', undefined, true),
            fase: fields.select({
              label: 'Etapa',
              options: [
                { label: 'Antes', value: 'antes' },
                { label: 'Durante la obra', value: 'durante' },
                { label: 'Obra terminada', value: 'despues' },
                { label: 'Render del proyecto', value: 'render' },
              ],
              defaultValue: 'durante',
            }),
            alt: texto('Descripción de la foto', 'Opcional. Describe la foto para quienes no pueden verla.'),
          }),
          {
            label: 'Galería de fotos',
            description: 'Se muestran en este orden, salvo la portada, que va primero. Antes de quitar una foto, revise que el recorrido de la obra no la use: si la usa, el sitio no se podrá publicar.',
            itemLabel: (p) => [p.fields.img.value?.filename, p.fields.fase.value].filter(Boolean).join(' · ') || 'Foto nueva',
          },
        ),
        antes: imagen('Foto de antes', 'Activa el comparador antes/después. Requiere portada o "Foto de después".'),
        antesAlineado: casilla('Antes y después están alineadas', 'Desmárquela si las dos fotos no se tomaron desde el mismo punto.', true),
        despuesComparar: imagen('Foto de después', 'Opcional. Foto recortada para calzar con la de antes; si falta, se usa la portada.'),
        cifras: fields.array(
          fields.object({
            v: obligatorio('Valor', 'Por ejemplo: 1 248.'),
            u: texto('Unidad', 'Opcional. Por ejemplo: m².'),
            t: obligatorio('Texto', 'Por ejemplo: de piso de piedra basalto.'),
          }),
          {
            label: 'Cifras',
            description: 'Máximo 3. Se muestran en grande en la cabecera de la ficha.',
            validation: { length: { max: 3 } },
            itemLabel: (p) => [p.fields.v.value, p.fields.u.value, p.fields.t.value].filter(Boolean).join(' ') || 'Cifra nueva',
          },
        ),
        hicimos: fields.array(texto('Actividad'), {
          label: 'Lo que hicimos',
          description: 'Lista de actividades. Si la deja vacía, la ficha muestra el texto de "Solución".',
          itemLabel: (p) => p.value || 'Actividad nueva',
        }),
        reto: textoLargo('Reto', 'Se muestra en la ficha como "El contexto".'),
        solucion: textoLargo('Solución', 'Se muestra solo si "Lo que hicimos" está vacío.'),
        resultado: textoLargo('Resultado'),
        // Se conservan sin mostrarse: un objeto vacío de Keystatic incumpliría el esquema Zod.
        prensa: fields.ignored(),
        recorrido: fields.ignored(),
        destacada: casilla('Destacada en el Inicio', 'Aparece en la franja "Más obras". Requiere portada.'),
        destacadaListado: casilla('Destacada en Proyectos', 'Obra principal de la página Proyectos. Solo una obra puede tenerla: con dos, el sitio no se podrá publicar.'),
        destacadaInicio: casilla('Obra grande del Inicio', 'Solo una obra puede tenerla: con dos, el sitio no se podrá publicar.'),
        borrador: casilla('Borrador', 'Oculta la obra en el sitio publicado.'),
        // Las obras son Markdown solo con frontmatter: sin cuerpo.
        cuerpo: fields.emptyContent({ extension: 'md' }),
      },
    }),
  },
});
