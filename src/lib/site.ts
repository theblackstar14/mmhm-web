export const WA = '51955137140';
export const TEL = '+51955137140';
export const TEL_TXT = '(+51) 955 137 140';
export const MAIL = 'mmhighmetrik@gmail.com';
export const BROCHURE = 'https://www.mmhighmetrik.com/brochure.pdf';

export const waUrl = (txt: string) => `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;

export type TipoKey = 'geo' | 'rio' | 'pub' | 'edif';
export const TIPOS: Record<TipoKey, { n: string; i: string }> = {
  rio: { n: 'Ríos y defensas', i: '<path d="M4 14c4-4 8 4 12 0s8 4 12 0 6 2 8 0M4 24c4-4 8 4 12 0s8 4 12 0 6 2 8 0"/>' },
  geo: { n: 'Taludes y geomallas', i: '<path d="M4 34 20 6l16 28Z"/><path d="M12 20h16M9 26h22M16 13v21M24 13v21"/>' },
  pub: { n: 'Espacios públicos y patrimonio', i: '<path d="M4 34h32M8 34V18M16 34V18M24 34V18M32 34V18M4 18h32L20 6Z"/>' },
  edif: { n: 'Edificaciones', i: '<path d="M6 34V14l14-8 14 8v20M6 34h28M15 34V22h10v12"/>' },
};

export const FAMILIAS: Record<string, string> = { inf: 'Infraestructura', edi: 'Edificación', ins: 'Instalaciones y especialidades', ing: 'Ingeniería' };
export const SICO: Record<string, string> = {
  tierras: '<path d="M3 20h18M5 20l3-6h7l2 4M15 14l4-8 3 1.5-3 6"/>',
  civiles: '<path d="M4 21V9l8-5 8 5v12M4 21h16M9 21v-7h6v7"/>',
  metal: '<path d="M2 7h20M2 18h20M4 7v11M20 7v11M4 7l5 11M9 7l5 11M14 7l5 11"/>',
  fuego: '<path d="M12 3c3 4 6 6.5 6 11a6 6 0 0 1-12 0c0-2.5 1.2-4.4 2.5-5.6 0 2.5 1.3 3.8 2.5 3.8 0-3.6.5-6.2 1-9.2Z"/>',
  rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  rio: '<path d="M2 9c3-3 5 3 8 0s5 3 8 0 3 1 4 0M2 16c3-3 5 3 8 0s5 3 8 0 3 1 4 0"/>',
  fabrica: '<path d="M3 21V11l5 3V11l5 3V7l4 2v12M3 21h18M17 21V4h3v17"/>',
  columnas: '<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M3 10h18L12 4Z"/>',
  plaza: '<circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="2.5"/><path d="M12 2v8.5M4 13h5.5M14.5 13H20"/>',
  talud: '<path d="M3 20h18L9 6H3Z"/><path d="M5 10h5M5 14h8M5 18h11M7 6v14M11 10v10"/>',
  plano: '<path d="M4 4h12l4 4v12H4Z"/><path d="M16 4v4h4M8 12h8M8 16h5"/>',
  escuela: '<path d="M3 10 12 5l9 5-9 5Z"/><path d="M7 12.5V17c3 2 7 2 10 0v-4.5M21 10v5"/>',
  demoler: '<path d="M4 21h16M6 21v-6h4v6M14 21v-9h4v9"/><path d="M14 4l3 3-6 6-3-3Z"/>',
  polvorin: '<path d="M3 21V10l9-5 9 5v11M3 21h18"/><path d="M12 11l1.5 3.5H17l-2.8 2 1 3.5-3.2-2-3.2 2 1-3.5-2.8-2h3.5Z"/>',
};
export const sico = (k: string, w = 1.7) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SICO[k]}</svg>`;

export interface Servicio { id: string; sh: string; f: string; ic: string; t: string; c: string; d: string; a: string[]; img: string; obras: string[] }
const _SERVICIOS: Servicio[] = [
  { id: 'movimiento-de-tierras', sh: 'Movimiento de tierras', f: 'inf', ic: 'tierras', t: 'Movimiento de tierras', c: 'Excavación, relleno, nivelación y transporte con maquinaria pesada.',
    d: 'Ejecutamos trabajos de movimiento de tierras con maquinaria pesada, garantizando eficiencia, seguridad y cumplimiento de las especificaciones técnicas en cada proyecto.',
    a: ['Excavación y corte de terrenos', 'Relleno y compactación de suelos', 'Nivelación y perfilado de terrenos', 'Control de volúmenes y rendimientos', 'Transporte y disposición de material'],
    img: '/assets/servicios/movimiento-tierras.jpg', obras: ['rio-lurin', 'rio-rimac-faja', 'rio-osomayo'] },
  { id: 'defensas-riberenas', sh: 'Defensas ribereñas', f: 'inf', ic: 'rio', t: 'Mantenimiento de defensas ribereñas', c: 'Descolmatación, taludes y enrocado para proteger riberas y cauces.',
    d: 'Realizamos trabajos de mantenimiento y protección de defensas ribereñas, incluyendo descolmataciones, conformación de taludes y enrocado para salvaguardar riberas y cauces fluviales.',
    a: ['Descolmatación de cauces y ríos', 'Conformación y perfilado de taludes', 'Enrocado y protección de riberas', 'Gaviones y muros de protección fluvial', 'Monitoreo y mantenimiento preventivo'],
    img: '/assets/servicios/defensas-riberenas.jpg', obras: ['rio-rimac-ramiro-priale', 'rio-lurin', 'pantanos-de-villa', 'rio-osomayo', 'rio-rimac-faja'] },
  { id: 'obras-civiles', sh: 'Obras civiles', f: 'edi', ic: 'civiles', t: 'Obras civiles', c: 'Concreto, pavimentos, saneamiento y habilitación urbana.',
    d: 'Desarrollamos obras civiles de diversa envergadura con altos estándares de calidad, desde cimentaciones y estructuras de concreto hasta habilitaciones urbanas y vías de acceso.',
    a: ['Cimentaciones y estructuras de concreto', 'Construcción de pavimentos y veredas', 'Obras de saneamiento y drenaje', 'Habilitaciones urbanas', 'Muros de contención y sostenimiento'],
    img: '/assets/proyectos/plaza-bolognesi.jpg', obras: ['plaza-bolognesi', 'plaza-dos-de-mayo', 'almacenes', 'crematorio-surco'] },
  { id: 'ambientes-industriales', sh: 'Ambientes industriales', f: 'edi', ic: 'fabrica', t: 'Construcción de ambientes industriales', c: 'Naves, galpones, crematorios y ambientes técnicos especiales.',
    d: 'Construimos ambientes industriales especializados como crematorios, naves industriales y ambientes técnicos, cumpliendo las normativas técnicas, de seguridad y ambientales vigentes.',
    a: ['Crematorios y ambientes especiales', 'Naves industriales y galpones', 'Salas técnicas y cuartos de equipos', 'Ambientes con requerimientos técnicos especiales', 'Cumplimiento de normativas de seguridad'],
    img: '/assets/servicios/ambientes-industriales.jpg', obras: ['almacenes', 'crematorio-surco'] },
  { id: 'patrimonio-cultural', sh: 'Patrimonio cultural', f: 'edi', ic: 'columnas', t: 'Remodelación y reconstrucción de patrimonio cultural', c: 'Intervención en edificios y espacios de valor histórico.',
    d: 'Intervenimos edificios y espacios de valor histórico y cultural con respeto por los materiales y técnicas constructivas originales, coordinando con el Ministerio de Cultura y las entidades competentes.',
    a: ['Restauración de edificios históricos', 'Reconstrucción de fachadas patrimoniales', 'Rehabilitación de estructuras antiguas', 'Trabajos con materiales tradicionales', 'Coordinación con entidades culturales'],
    img: '/assets/servicios/patrimonio.jpg', obras: ['plaza-bolognesi', 'plaza-dos-de-mayo', 'casa-hacienda'] },
  { id: 'estructuras-metalicas', sh: 'Estructuras metálicas', f: 'ins', ic: 'metal', t: 'Estructuras metálicas', c: 'Naves, escaleras, pasarelas y cerramientos a medida.',
    d: 'Diseñamos y construimos estructuras metálicas para uso industrial, comercial y residencial, con soldadura certificada y acabados de alta calidad.',
    a: ['Naves industriales y almacenes', 'Estructuras metálicas a medida', 'Cercos y cerramientos metálicos', 'Escaleras, pasarelas y plataformas', 'Soldadura y habilitación metálica'],
    img: '/assets/servicios/estructuras-metalicas.jpg', obras: ['osinergmin', 'almacenes'] },
  { id: 'contraincendios', sh: 'Contraincendios', f: 'ins', ic: 'fuego', t: 'Sistemas contraincendios', c: 'Redes, rociadores, gabinetes y señalización para ITSE.',
    d: 'Instalamos y acondicionamos sistemas de protección contra incendios según la normativa vigente y los reglamentos técnicos peruanos, garantizando la seguridad de personas e instalaciones.',
    a: ['Redes de tuberías contra incendios', 'Sistemas de rociadores automáticos', 'Gabinetes y extintores', 'Bombas y sistemas de presurización', 'Señalización y rutas de evacuación'],
    img: '/assets/servicios/contraincendios.jpg', obras: ['parque-canepa', 'crematorio-surco', 'osinergmin'] },
  { id: 'instalaciones-electricas', sh: 'Instalaciones eléctricas', f: 'ins', ic: 'rayo', t: 'Instalaciones eléctricas de media y baja tensión', c: 'Subestaciones, tableros, cableado y puesta a tierra.',
    d: 'Ejecutamos instalaciones eléctricas industriales y comerciales en media y baja tensión, con personal técnico calificado y materiales certificados.',
    a: ['Subestaciones eléctricas de media tensión', 'Tableros de distribución y control', 'Cableado y tendido eléctrico', 'Sistemas de puesta a tierra', 'Iluminación industrial y comercial'],
    img: '/assets/servicios/electricas.jpg', obras: ['crematorio-surco'] },
  { id: 'polvorines', sh: 'Polvorines', f: 'edi', ic: 'polvorin', t: 'Polvorines y almacenes de explosivos', c: 'Almacenes para explosivos y materiales peligrosos según normativa.',
    d: 'Construimos polvorines y almacenes de explosivos para minería y obras de infraestructura, cumpliendo las condiciones de seguridad, distancias y especificaciones exigidas por la normativa vigente.',
    a: ['Polvorines para minería y construcción', 'Almacenes de explosivos y accesorios', 'Muros y cerramientos de seguridad', 'Pararrayos, puesta a tierra y señalización', 'Cumplimiento de la normativa de seguridad'],
    img: '/assets/servicios/polvorines.jpg', obras: ['almacenes'] },
  { id: 'plazas-publicas', sh: 'Plazas públicas', f: 'edi', ic: 'plaza', t: 'Mantenimiento y remodelación de plazas públicas', c: 'Pisos, sardineles, áreas verdes y mobiliario urbano.',
    d: 'Mantenemos y remodelamos plazas emblemáticas preservando su valor histórico y mejorando su funcionalidad para el ciudadano.',
    a: ['Renovación de pisos y pavimentos de piedra', 'Sardineles y bordes de granito', 'Áreas verdes y jardinería', 'Mobiliario urbano', 'Iluminación y sistemas eléctricos'],
    img: '/assets/servicios/plazas.jpg', obras: ['plaza-bolognesi', 'plaza-dos-de-mayo'] },
  { id: 'demoliciones', sh: 'Demoliciones', f: 'inf', ic: 'demoler', t: 'Demoliciones y desmontajes', c: 'Demolición de estructuras, desmontaje y eliminación de residuos.',
    d: 'Ejecutamos demoliciones y desmontajes controlados de losas, muros, estructuras y elementos existentes, con eliminación de residuos en rellenos autorizados.',
    a: ['Demolición de losas, muros y sardineles', 'Desmontaje de estructuras y carpintería', 'Desmontaje de instalaciones existentes', 'Acarreo y eliminación de desmonte', 'Disposición en rellenos sanitarios autorizados'],
    img: '/assets/servicios/demoliciones.jpg', obras: ['rio-rimac-faja', 'plaza-bolognesi', 'plaza-dos-de-mayo', 'osinergmin', 'crematorio-surco'] },
  { id: 'geomallas', sh: 'Geomallas', f: 'inf', ic: 'talud', t: 'Instalación y mantenimiento de geomallas', c: 'Estabilización de taludes, acantilados y terraplenes.',
    d: 'Instalamos y mantenemos geomallas de refuerzo para estabilizar taludes, acantilados y terraplenes, con personal especializado en trabajos en altura.',
    a: ['Geomallas de refuerzo para taludes', 'Estabilización de suelos y terraplenes', 'Protección de acantilados y laderas', 'Mantenimiento de geosintéticos instalados', 'Ensayos y control de calidad'],
    img: '/assets/servicios/geomallas.jpg', obras: ['costa-verde', 'malecon-castagnola'] },
  { id: 'instituciones-educativas', sh: 'Instituciones educativas', f: 'edi', ic: 'escuela', t: 'Construcción y acondicionamiento de instituciones educativas', c: 'Aulas, laboratorios y servicios según normas del MINEDU.',
    d: 'Construimos y acondicionamos centros educativos conforme a las normas técnicas del sector, con espacios seguros, funcionales y adecuados para el aprendizaje.',
    a: ['Aulas y ambientes pedagógicos', 'Laboratorios, bibliotecas y talleres', 'Infraestructura sanitaria y eléctrica', 'Cercos perimétricos y losas deportivas', 'Cumplimiento de las normas del MINEDU'],
    img: '/assets/servicios/educativas.jpg', obras: [] },
  { id: 'expedientes-tecnicos', sh: 'Expedientes técnicos', f: 'ing', ic: 'plano', t: 'Elaboración de expedientes técnicos', c: 'Memorias, planos, metrados, presupuestos y cronogramas.',
    d: 'Elaboramos expedientes técnicos completos para obras públicas y privadas: memoria descriptiva, planos, especificaciones, metrados, presupuesto y cronograma.',
    a: ['Memorias descriptivas y cálculos', 'Planos de arquitectura e ingeniería', 'Especificaciones técnicas y metrados', 'Presupuestos y análisis de costos unitarios', 'Cronogramas y programación de obra'],
    img: '/assets/servicios/expedientes.jpg', obras: ['casa-hacienda'] },
];
const _ORD = Object.keys(FAMILIAS);
/** Ordenados por especialidad para que la numeración coincida con el índice. */
export const SERVICIOS: Servicio[] = [..._SERVICIOS].sort((a, b) => _ORD.indexOf(a.f) - _ORD.indexOf(b.f));
export const nn = (i: number) => String(i + 1).padStart(2, '0');
export const fmtLL = ([a, b]: [number, number]) => `${Math.abs(a).toFixed(2)}° S, ${Math.abs(b).toFixed(2)}° O`;
