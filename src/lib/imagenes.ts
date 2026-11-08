import type { ImageMetadata } from 'astro';

/* Imágenes fijas del sitio (src/assets/sitio/), para optimizarlas con astro:assets. */
const archivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/sitio/**/*.{jpg,jpeg,png,webp}', { eager: true });

/** Recibe la ruta relativa a src/assets/sitio/; una imagen que falta hace fallar el build. */
export function imagenSitio(ruta: string): ImageMetadata {
  const archivo = archivos[`/src/assets/sitio/${ruta}`];
  if (!archivo) throw new Error(`Falta la imagen src/assets/sitio/${ruta}`);
  return archivo.default;
}
