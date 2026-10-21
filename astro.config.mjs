import { defineConfig } from 'astro/config';
export default defineConfig({
  // Dominio de revisión; cambiar a https://www.mmhighmetrik.com al publicar en el dominio oficial
  site: 'https://mmhm-p.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: { responsiveStyles: false },
});
