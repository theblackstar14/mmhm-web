import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { SERVICIOS, TIPOS, waUrl } from './site';

export type Obra = CollectionEntry<'obras'>;

export const FASES: Record<string, string> = {
  antes: 'Antes', durante: 'Durante la obra', despues: 'Obra terminada', render: 'Render del proyecto',
};

export interface Foto { fase: string; img: ImageMetadata; alt?: string }

/** Fotos de la galería, en el orden de `fotos` en datos.md. Devuelve una copia: la ficha la reordena. */
export const fotosDe = (o: Obra): Foto[] => [...o.data.fotos];

/** Hace fallar el build si un destacado único está en más de una obra. Cuenta también los borradores. */
function validarDestacados(obras: Obra[]) {
  for (const campo of ['destacadaInicio', 'destacadaListado'] as const) {
    const ids = obras.filter((o) => o.data[campo]).map((o) => o.id);
    if (ids.length > 1) {
      throw new Error(`Solo puede haber una obra con ${campo} y hay ${ids.length}: ${ids.join(', ')}. Déjelo en true en una sola (src/content/obras/<obra>/datos.md).`);
    }
  }
}

/** Obras ordenadas. Los borradores se ven en desarrollo y se ocultan en producción. */
export async function getObras(): Promise<Obra[]> {
  const todas = await getCollection('obras');
  validarDestacados(todas);
  return todas
    .filter((o) => import.meta.env.DEV || !o.data.borrador)
    .sort((a, b) => a.data.orden - b.data.orden);
}

export const urlObra = (o: Obra | string) => `/proyectos/${typeof o === 'string' ? o : o.id}/`;
export const serviciosDe = (o: Obra) => SERVICIOS.filter((s) => o.data.servicios.includes(s.id));
/** Obras de un servicio; conserva el orden de la lista recibida (getObras ya ordena y filtra borradores). */
export const obrasDeServicio = (obras: Obra[], id: string) => obras.filter((o) => o.data.servicios.includes(id));
export const tipoNombre = (o: Obra) => TIPOS[o.data.tipo].n;
export const waObra = (o: Obra) => waUrl(`Hola, vi la obra "${o.data.titulo}" en su web y quisiera cotizar un proyecto similar.`);

/** Datos ligeros para los scripts del navegador (listado, mapa, panel rápido). */
export async function datosCliente(obras: Obra[]) {
  return Promise.all(obras.map(async (o) => {
    const d = o.data;
    const card = d.portada ? (await getImage({ src: d.portada, width: 900, format: 'webp' })).src : null;
    const big = d.portada ? (await getImage({ src: d.portada, width: 1600, format: 'webp' })).src : null;
    const antes = d.antes ? (await getImage({ src: d.antes, width: 1600, format: 'webp' })).src : null;
    const desp = d.antes ? (await getImage({ src: d.despuesComparar ?? d.portada!, width: 1600, format: 'webp' })).src : null;
    return {
      id: o.id, t: d.titulo, tipo: d.tipo, d: d.resumen, u: d.ubicacion ?? null, c: d.cliente ?? null, tr: d.tramo ?? null,
      ll: d.coords ?? null, card, big, antes, desp, alineado: d.antesAlineado, nf: fotosDe(o).length, url: urlObra(o), wa: waObra(o),
    };
  }));
}
