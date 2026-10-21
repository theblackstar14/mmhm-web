/**
 * Recorrido de obra: geometría de cada base (en px del lienzo original) y piezas por juego.
 * - rios: obras de ríos y defensas (camino en zigzag)
 * - bolognesi: obra destacada Plaza Bolognesi (camino en arco)
 * - generico: resto de obras, con las piezas de Gestión integral (camino en zigzag)
 */
import type { ImageMetadata } from 'astro';
import baseZig from '../assets/recorrido/base-zigzag.jpg';
import baseArc from '../assets/recorrido/base-arco.jpg';

const piezas = import.meta.glob<{ default: ImageMetadata }>('../assets/recorrido/*-[1-5].png', { eager: true });
const pz = (set: string) => [1, 2, 3, 4, 5].map((i) => piezas[`../assets/recorrido/${set}-${i}.png`].default);

export type SetKey = 'rios' | 'bolognesi' | 'generico';
type Rect = [number, number, number, number];
type Lbl = [number, number, number];

export interface Geometria {
  W: number; H: number;
  /** Escala de la pieza respecto al ancho de la plataforma vacía y desfase vertical (px). */
  K: number; off: number;
  plat: Rect[];
  /** Ruta de luz desde la fase 1 hasta la fase k (k = 0..4). */
  rutas: string[];
  /** Etiquetas [izquierda, arriba, ancho]. Impares abajo, pares arriba. */
  lbl: Lbl[];
  /** Posición del título en % y si va centrado dentro del arco. */
  ttl: { x: number; y: number; center: boolean };
}

const zigCen = [[242, 770], [632, 520], [1038, 622], [1381, 362], [1714, 442]];
const ZIG: Omit<Geometria, 'K'> = {
  W: 2000, H: 1126, off: 7,
  plat: [[92, 675, 392, 898], [487, 425, 778, 637], [892, 520, 1185, 742], [1238, 265, 1525, 475], [1572, 343, 1857, 560]],
  rutas: [0, 1, 2, 3, 4].map((k) => 'M' + zigCen.slice(0, k + 1).map((p) => p.join(',')).join(' L')),
  lbl: [[110, 915, 460], [470, 262, 560], [905, 760, 460], [1225, 40, 560], [1590, 580, 400]],
  ttl: { x: 3, y: 3.4, center: false },
};

const arcPt = (t: number) => [831 + 611 * Math.cos((t * Math.PI) / 180), 575 - 363 * Math.sin((t * Math.PI) / 180)];
const arcRuta = (k: number) => {
  const end = [180, 133, 90, 47, 0][k], pts: number[][] = [];
  for (let a = 180; a >= end; a -= 3) pts.push(arcPt(a));
  pts.push(arcPt(end));
  return 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
};
const ARC: Geometria = {
  W: 1672, H: 940, K: 1.1, off: 6,
  plat: [[118, 492, 322, 655], [316, 245, 512, 393], [738, 140, 932, 285], [1153, 245, 1348, 393], [1340, 492, 1545, 655]],
  rutas: [0, 1, 2, 3, 4].map(arcRuta),
  lbl: [[95, 672, 380], [50, 92, 360], [690, 318, 440], [1290, 92, 330], [1320, 672, 350]],
  ttl: { x: 32.5, y: 52, center: true },
};

export const SETS: Record<SetKey, { base: ImageMetadata; geo: Geometria; piezas: ImageMetadata[] }> = {
  rios: { base: baseZig, geo: { ...ZIG, K: 1.1 }, piezas: pz('rios') },
  bolognesi: { base: baseArc, geo: ARC, piezas: pz('bolognesi') },
  generico: { base: baseZig, geo: { ...ZIG, K: 1.18, lbl: ZIG.lbl.map((l, i) => (i === 1 ? [470, 222, 560] : l)) as Lbl[] }, piezas: pz('generico') },
};

import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

/** Datos listos para la plantilla: posiciones en % de piezas y etiquetas, y JSON para el script del navegador. */
export async function recorridoDe(obra: CollectionEntry<'obras'>, wa: string) {
  const d = obra.data;
  if (!d.recorrido) return null;
  const set: SetKey = d.recorrido.set ?? (d.tipo === 'rio' ? 'rios' : 'generico');
  const S = SETS[set], g = S.geo;
  const pzs = await Promise.all(S.piezas.map(async (p) => (await getImage({ src: p, width: 560, format: 'webp' })).src));
  const fases = await Promise.all(d.recorrido.fases.map(async (f) => ({
    t: f.t, s: f.s, lead: f.lead, inc: f.inc, out: f.out,
    foto: f.foto ? (await getImage({ src: f.foto, width: 1000, format: 'webp' })).src : null,
  })));
  return {
    set, W: g.W, H: g.H, ttl: g.ttl, stat: d.recorrido.stat,
    base: (await getImage({ src: S.base, width: 2000, format: 'webp' })).src,
    piezas: g.plat.map(([x0, , x1, y1], i) => {
      const w = (x1 - x0) * g.K, cx = (x0 + x1) / 2;
      return { src: pzs[i], style: `left:${((cx - w / 2) / g.W) * 100}%;bottom:${((g.H - y1 - g.off) / g.H) * 100}%;width:${(w / g.W) * 100}%;--d:${0.25 + i * 0.16}s` };
    }),
    lbl: g.lbl.map(([x, y, w], i) => `left:${(x / g.W) * 100}%;top:${(y / g.H) * 100}%;width:${(w / g.W) * 100}%;--d:${0.35 + i * 0.16}s`),
    data: { rutas: g.rutas, obra: d.titulo, wa, pz: pzs, fases },
  };
}
