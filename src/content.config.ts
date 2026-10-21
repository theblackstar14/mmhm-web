import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const obras = defineCollection({
  loader: glob({ pattern: '*/datos.md', base: './src/content/obras', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) => z.object({
    orden: z.number(),
    titulo: z.string(),
    tipo: z.enum(['geo', 'rio', 'pub', 'edif']),
    resumen: z.string(),
    ubicacion: z.string().optional(),
    cliente: z.string().optional(),
    tramo: z.string().optional(),
    alcance: z.string().optional(),
    periodo: z.string().optional(),
    coords: z.tuple([z.number(), z.number()]).optional(),
    portada: image().optional(),
    antes: image().optional(),
    antesAlineado: z.boolean().default(true),
    /** Foto 'después' recortada para calzar con 'antes' en el comparador (si falta se usa la portada). */
    despuesComparar: image().optional(),
    /** Nota de prensa enlazada (solo enlace y título, sin copiar fotos ni texto). */
    prensa: z.object({ t: z.string(), fuente: z.string(), fecha: z.string(), url: z.string().url() }).optional(),
    destacada: z.boolean().default(false),
    destacadaListado: z.boolean().default(false),
    reto: z.string().optional(),
    solucion: z.string().optional(),
    resultado: z.string().optional(),
    /** Plazo contractual, p. ej. "60 días". */
    plazo: z.string().optional(),
    /** Hasta 3 cifras grandes de la cabecera. */
    cifras: z.array(z.object({ v: z.string(), u: z.string().optional(), t: z.string() })).max(3).optional(),
    /** Lista "Lo que hicimos"; si falta se usa el texto de "solucion". */
    hicimos: z.array(z.string()).optional(),
    /** Recorrido de obra por fases. set: rios | bolognesi | generico (por defecto: rios si tipo=rio, si no generico). */
    recorrido: z.object({
      set: z.enum(['rios', 'bolognesi', 'generico']).optional(),
      stat: z.tuple([z.string(), z.string()]).optional(),
      fases: z.array(z.object({
        t: z.string(), s: z.string(), lead: z.string(), inc: z.array(z.string()), out: z.string(),
        foto: image().optional(),
      })).length(5),
    }).optional(),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { obras };
