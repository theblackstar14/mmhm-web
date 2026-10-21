import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { SERVICIOS, TIPOS, waUrl } from './site';

export type Obra = CollectionEntry<'obras'>;

const files = import.meta.glob<{ default: ImageMetadata }>('/src/content/obras/*/*.{jpg,jpeg,png,webp}', { eager: true });

export const FASES: Record<string, string> = {
  antes: 'Antes', durante: 'Durante la obra', despues: 'Obra terminada', render: 'Render del proyecto',
};
const ORDEN_FASE = ['antes', 'durante', 'despues', 'render'];

export interface Foto { fase: string; nombre: string; img: ImageMetadata }

/** Fotos de la galería: todo archivo cuyo nombre empiece con antes-, durante-, despues- o render-. */
export function fotosDe(slug: string): Foto[] {
  const out: Foto[] = [];
  for (const [path, mod] of Object.entries(files)) {
    const m = path.match(/\/obras\/([^/]+)\/((antes|durante|despues|render)-[^/]+)\.\w+$/);
    if (m && m[1] === slug) out.push({ fase: m[3], nombre: m[2], img: mod.default });
  }
  return out.sort((a, b) => ORDEN_FASE.indexOf(a.fase) - ORDEN_FASE.indexOf(b.fase) || a.nombre.localeCompare(b.nombre));
}

export async function getObras(): Promise<Obra[]> {
  return (await getCollection('obras')).sort((a, b) => a.data.orden - b.data.orden);
}

export const urlObra = (o: Obra | string) => `/proyectos/${typeof o === 'string' ? o : o.id}/`;
export const serviciosDe = (slug: string) => SERVICIOS.filter((s) => s.obras.includes(slug));
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
      ll: d.coords ?? null, card, big, antes, desp, alineado: d.antesAlineado, nf: fotosDe(o.id).length, url: urlObra(o), wa: waObra(o),
    };
  }));
}
