/* MM High Metrik — scripts del inicio */
const WA="51955137140";
const OBRAS=JSON.parse(document.getElementById("obrasMin").textContent);
/* ===== Video del hero: se carga después de la página y solo si conviene ===== */
(function(){
  const v=document.getElementById("heroVideo"); if(!v) return;
  const c=navigator.connection||{};
  const ahorro = c.saveData || /(^|-)2g$|3g/.test(c.effectiveType||"");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches || ahorro){ v.remove(); return; }
  const start=()=>{ v.src = v.canPlayType('video/mp4; codecs="avc1.640028"') ? "/assets/hero-video.mp4" : "/assets/hero-video.webm"; v.load();
    v.addEventListener("playing",()=>v.classList.add("on"),{once:true});
    v.play().catch(()=>{});
    if("IntersectionObserver" in window){
      new IntersectionObserver(es=>{ es[0].isIntersecting ? v.play().catch(()=>{}) : v.pause(); },{threshold:.1}).observe(v);
    }
    document.addEventListener("visibilitychange",()=>{ document.hidden ? v.pause() : (v.getBoundingClientRect().bottom>0 && v.play().catch(()=>{})); });
  };
  document.readyState==="complete" ? setTimeout(start,300) : addEventListener("load",()=>setTimeout(start,300),{once:true});
})();

/* ===== Contadores ===== */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function runCount(el){
  const to=+el.dataset.to, suf=el.dataset.suffix||"", t0=performance.now(), dur=1400;
  const tick=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3);
    el.textContent=Math.round(to*e)+suf; if(k<1) requestAnimationFrame(tick); else el.textContent=to+suf; };
  requestAnimationFrame(tick);
}
if(!reduce && "IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ runCount(e.target); io.unobserve(e.target);} }),{threshold:.6});
  document.querySelectorAll(".count").forEach(el=>{ el.textContent="0"+(el.dataset.suffix||""); io.observe(el); });
}

/* ===== Proceso interactivo ===== */
const PGEO = {"p1": {"box": [152, 169, 452, 430], "hull": "365,176 366,177 430,270 445,295 447,299 448,304 449,321 449,337 425,381 424,382 320,422 301,427 298,427 291,424 179,375 173,372 171,370 156,346 155,343 154,339 154,319 155,299 168,258 178,253 349,171"}, "p2": {"box": [291, 463, 642, 745], "hull": "508,465 639,565 639,593 628,643 627,646 626,648 618,656 599,670 486,735 478,739 472,741 466,742 458,742 452,741 421,735 413,731 377,711 334,687 300,668 293,647 293,620 295,611 297,606 306,587 317,573 319,571 385,523 399,515 403,513 505,465"}, "p3": {"box": [826, 73, 1230, 470], "hull": "1106,75 1146,85 1148,86 1151,88 1224,310 1225,314 1227,327 1227,329 1225,355 1223,357 1193,382 1189,385 1178,391 1165,398 1038,466 1036,467 1030,467 1001,462 989,456 954,437 840,375 831,357 828,350 828,304 883,205 884,204 1000,122 1105,75"}, "p4": {"box": [923, 474, 1254, 729], "hull": "1087,477 1157,511 1165,515 1240,575 1241,576 1247,583 1248,586 1251,606 1251,633 1250,637 1249,639 1241,647 1238,649 1228,655 1119,720 1111,724 1108,725 1104,726 1087,726 1062,722 1059,721 1057,720 940,646 937,644 927,634 926,631 925,603 926,571 943,548 1080,476"}, "p5": {"box": [571, 601, 987, 931], "hull": "826,631 881,659 984,723 984,765 976,811 975,814 973,817 971,819 965,824 925,848 803,921 795,925 789,927 784,928 772,928 766,927 736,920 732,918 590,824 584,820 575,811 574,809 573,806 573,773 574,764 577,752 582,746 636,685 637,684 700,633 727,621 770,603"}};
const LABELS = {p1:[468,160,775,295], p2:[20,460,305,595], p3:[1265,160,1550,295], p4:[1275,450,1585,600], p5:[1065,765,1545,900]};
const ETAPAS = [
  {k:"p1", n:"01", t:"Planificación", s:"Presupuesto y cronograma",
   lead:"Definimos alcance, costo y plazo antes de mover una sola piedra, para que el proyecto arranque sin sorpresas.",
   inc:["Visita técnica y levantamiento de información","Diseño de arquitectura e ingeniería y expediente técnico","Metrados, presupuesto y cronograma de obra","Trámites municipales y autorizaciones GTU, SERPAR y MINAM"],
   out:"Expediente técnico, presupuesto y cronograma", ej:"casa-hacienda"},
  {k:"p2", n:"02", t:"Licitación", s:"Costos y oportunidades",
   lead:"Preparamos propuestas técnico-económicas competitivas para entidades públicas y empresas privadas.",
   inc:["Análisis de bases, términos de referencia y requerimientos","Propuesta técnica y metodología de trabajo","Análisis de costos unitarios y propuesta económica","Evaluación de riesgos y oportunidades del proyecto"],
   out:"Propuesta técnico-económica", ej:"osinergmin"},
  {k:"p3", n:"03", t:"Ejecución", s:"Obras y control de avance",
   lead:"Construimos con personal capacitado, maquinaria especializada y dirección técnica permanente en obra.",
   inc:["Movilización de personal, equipos y maquinaria","Dirección técnica y residencia de obra","Seguridad y salud en el trabajo","Disposición de residuos en botaderos autorizados MINAM"],
   out:"Obra ejecutada según expediente y cronograma", ej:"rio-lurin"},
  {k:"p4", n:"04", t:"Gestión y control", s:"Seguimiento de costos y valorizaciones",
   lead:"Medimos el avance físico y económico para que el cliente sepa en todo momento dónde está su obra.",
   inc:["Control de avance físico y económico","Valorizaciones periódicas","Seguimiento de costos y plazos","Informes de avance para el cliente y la supervisión"],
   out:"Valorizaciones e informes de avance", ej:"rio-rimac-ramiro-priale"},
  {k:"p5", n:"05", t:"Cierre y liquidación", s:"Documentación final y entrega",
   lead:"Entregamos la obra con su documentación completa y el cierre económico conciliado.",
   inc:["Control de calidad y pruebas finales","Levantamiento de observaciones","Planos finales y documentación de obra","Liquidación de obra y acta de entrega"],
   out:"Obra entregada, documentada y liquidada", ej:"parque-canepa"}
];
(function(){
  const stage=document.getElementById("procStage"), fig=document.getElementById("procFig"); if(!stage) return;
  const W=1585,H=992, order=["p3","p1","p2","p4","p5"];
  order.forEach((k,i)=>{ const [x0,y0,x1]=PGEO[k].box, im=document.createElement("img");
    im.src=`/assets/proc-${k}.webp`; im.alt=""; im.className="proc-piece"; im.dataset.k=k; im.loading="lazy";
    im.style.cssText=`left:${x0/W*100}%;top:${y0/H*100}%;width:${(x1-x0)/W*100}%;--d:${.12+i*.12}s`;
    stage.appendChild(im); });
  const hit=ETAPAS.map((e,i)=>{ const L=LABELS[e.k];
    return `<g role="button" tabindex="0" data-i="${i}" aria-label="${e.n} ${e.t}: ${e.s}. Ver detalle">
      <polygon points="${PGEO[e.k].hull}"/><rect x="${L[0]}" y="${L[1]}" width="${L[2]-L[0]}" height="${L[3]-L[1]}"/></g>`; }).join("");
  stage.insertAdjacentHTML("beforeend",`<svg class="proc-hit" viewBox="0 0 ${W} ${H}">${hit}</svg>`);
  document.getElementById("procList").innerHTML=ETAPAS.map((e,i)=>`<li><button data-i="${i}"><em>${e.n}</em><span><b>${e.t}</b><small>${e.s}</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg></button></li>`).join("");
  const piece=k=>stage.querySelector(`.proc-piece[data-k="${k}"]`);
  let openK=null;
  const lift=(k,on)=>{ const p=piece(k); if(p) p.classList.toggle("lift", on || k===openK); };
  stage.querySelectorAll(".proc-hit g").forEach(g=>{
    const k=ETAPAS[g.dataset.i].k;
    g.addEventListener("pointerenter",()=>lift(k,true)); g.addEventListener("pointerleave",()=>lift(k,false));
    g.addEventListener("focus",()=>lift(k,true)); g.addEventListener("blur",()=>lift(k,false));
    g.addEventListener("click",()=>openStep(+g.dataset.i));
    g.addEventListener("keydown",ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); openStep(+g.dataset.i);} });
  });
  document.getElementById("procList").addEventListener("click",ev=>{ const b=ev.target.closest("button[data-i]"); if(b) openStep(+b.dataset.i); });

  /* ---- B: capa de brillo sobre los caminos ---- */
  const RUTAS={p1:"M632,442 L418,350", p2:"M660,524 L583,560", p3:"M806,413 L898,377", p4:"M822,524 L948,581", p5:"M822,524 L948,581 M1010,668 L942,716"};
  const glowSvg=`<svg class="proc-glow" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    <radialGradient id="hubG"><stop offset="0" stop-color="#9CC0FF" stop-opacity=".9"/><stop offset="1" stop-color="#1F5EFF" stop-opacity="0"/></radialGradient></defs>
    <circle id="hubFlash" cx="728" cy="468" r="130" fill="url(#hubG)"/><path class="halo" id="glowHalo" pathLength="100"/><path class="core" id="glowCore" pathLength="100"/></svg>`;
  stage.querySelector(".proc-base").insertAdjacentHTML("afterend",glowSvg);
  const gHalo=stage.querySelector("#glowHalo"), gCore=stage.querySelector("#glowCore"), hub=stage.querySelector("#hubFlash");
  function glow(k){
    gHalo.setAttribute("d",RUTAS[k]); gCore.setAttribute("d",RUTAS[k]);
    const opt={duration:620,easing:"cubic-bezier(.5,0,.3,1)",fill:"forwards"};
    hub.style.transformOrigin="728px 468px"; hub.style.transformBox="view-box";
    hub.animate([{opacity:0,transform:"scale(.6)"},{opacity:1,transform:"scale(1)",offset:.35},{opacity:0,transform:"scale(1.15)"}],{duration:620,easing:"ease-out"});
    const trail=[{strokeDasharray:"45 200",strokeDashoffset:45,opacity:1},{strokeDasharray:"45 200",strokeDashoffset:-100,opacity:1,offset:.85},{strokeDasharray:"45 200",strokeDashoffset:-110,opacity:0}];
    gHalo.animate(trail,opt); const a=gCore.animate(trail,opt);
    return a.finished.catch(()=>{});
  }

  /* ---- Panel con foco atrapado ---- */
  const dlg=document.getElementById("stepDlg"), bd=document.getElementById("stepBd"), body=document.getElementById("stepBody");
  const heroImg=document.getElementById("drHeroImg"), heroBox=document.getElementById("drHero");
  const ico={l:'<path d="m15 6-6 6 6 6"/>',r:'<path d="m9 6 6 6-6 6"/>'};
  const sv=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${d}</svg>`;
  const mobile=()=>matchMedia("(max-width:640px)").matches;
  let lastTrigger=null, cur=-1, busy=false;
  function content(i){
    const e=ETAPAS[i], p=OBRAS[e.ej];
    const wa=`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, quisiera información sobre la etapa de ${e.t.toLowerCase()} para un proyecto.`)}`;
    return `<div class="dr-content">
      <span class="dr-n">${e.n}</span>
      <h3 id="stepTitle">${e.t}</h3>
      <div class="dr-cota"><i></i></div>
      <p class="dr-lead">${e.lead}</p>
      <h4>Qué incluye</h4>
      <ul class="dr-list">${e.inc.map((x,j)=>`<li style="--i:${j}">${x}</li>`).join("")}</ul>
      <div class="dr-out"><b>Entregable</b>${e.out}</div>
      ${p?`<h4>En obra</h4><div class="dr-case"><div class="media">${p.img?`<img src="${p.img}" alt="${p.t}">`:""}</div>
        <div class="t"><small>${p.tipo}</small><h5>${p.t}</h5><p>${p.d}</p>
        <a class="linkmap" href="${p.url}">${sv('<path d="M5 12h14m-5-5 5 5-5 5"/>')}Ver la obra</a></div></div>`:""}
      </div>
      <div class="dr-foot">
        <div class="dr-nav"><button data-go="${i-1}" ${i===0?"disabled":""} aria-label="Etapa anterior">${sv(ico.l)}</button><button data-go="${i+1}" ${i===ETAPAS.length-1?"disabled":""} aria-label="Etapa siguiente">${sv(ico.r)}</button></div>
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">Consultar esta etapa</a>
      </div>`;
  }
  function setLift(i){ if(openK){ const o=openK; openK=null; lift(o,false);} openK=ETAPAS[i].k; lift(openK,true); }
  function heroTarget(src){
    const r=heroBox.getBoundingClientRect(), ih=mobile()?128:170, ar=src.naturalWidth/src.naturalHeight||1.5;
    let h2=ih, w2=h2*ar; const maxW=r.width*.86; if(w2>maxW){ w2=maxW; h2=w2/ar; }
    return {left:r.left+(r.width-w2)/2, top:r.top+(r.height-h2)/2, width:w2, height:h2};
  }
  async function openStep(i){
    if(busy) return;
    if(!dlg.hidden){ // navegación dentro del panel: solo cambia el contenido
      const dir=i>cur?1:-1; cur=i; setLift(i);
      heroImg.style.opacity=0; setTimeout(()=>{ heroImg.src=piece(ETAPAS[i].k).src; heroImg.style.opacity=1; },180);
      body.innerHTML=content(i); body.style.setProperty("--sx",(dir*24)+"px");
      dlg.classList.remove("swap","reveal"); void dlg.offsetWidth; dlg.classList.add("swap","reveal");
      dlg.scrollTop=0; return;
    }
    busy=true; cur=i; lastTrigger=document.activeElement; setLift(i);
    const src=piece(ETAPAS[i].k);
    body.innerHTML=content(i); heroImg.src=src.src; heroImg.alt="";
    document.documentElement.style.overflow="hidden";
    if(reduce){ bd.hidden=false; dlg.hidden=false; dlg.classList.add("reveal"); busy=false; document.getElementById("drClose").focus(); return; }
    await glow(ETAPAS[i].k);                                   // B
    const from=src.getBoundingClientRect();
    bd.hidden=false; dlg.hidden=false; dlg.classList.remove("reveal","swap");
    const to=heroTarget(src); heroImg.style.opacity=0;
    const slide=mobile()?[{transform:"translateY(100%)"},{transform:"none"}]:[{transform:"translateX(100%)"},{transform:"none"}];
    dlg.animate(slide,{duration:480,easing:"cubic-bezier(.2,.8,.2,1)"});
    bd.animate([{opacity:0},{opacity:1}],{duration:380});
    const clone=src.cloneNode(); clone.className="fly-clone"; clone.removeAttribute("style");   // A
    Object.assign(clone.style,{left:from.left+"px",top:from.top+"px",width:from.width+"px",height:from.height+"px"});
    document.body.appendChild(clone); src.style.visibility="hidden";
    const fly=clone.animate([
      {left:from.left+"px",top:from.top+"px",width:from.width+"px",height:from.height+"px"},
      {left:(from.left+to.left)/2+"px",top:Math.min(from.top,to.top)-40+"px",width:(from.width+to.width)/2+"px",height:(from.height+to.height)/2+"px",offset:.45},
      {left:to.left+"px",top:to.top+"px",width:to.width+"px",height:to.height+"px"}],
      {duration:640,easing:"cubic-bezier(.3,.7,.2,1)",fill:"forwards"});
    setTimeout(()=>dlg.classList.add("reveal"),260);               // C
    await fly.finished.catch(()=>{});
    heroImg.style.opacity=1; clone.remove(); src.style.visibility="";
    busy=false; document.getElementById("drClose").focus();
  }
  async function closeStep(){
    if(dlg.hidden||busy) return;
    busy=true;
    if(!reduce){
      const slide=mobile()?[{transform:"none"},{transform:"translateY(100%)"}]:[{transform:"none"},{transform:"translateX(100%)"}];
      bd.animate([{opacity:1},{opacity:0}],{duration:280});
      await dlg.animate(slide,{duration:300,easing:"cubic-bezier(.5,0,.8,.3)"}).finished.catch(()=>{});
    }
    dlg.hidden=true; bd.hidden=true; dlg.classList.remove("reveal","swap");
    document.documentElement.style.overflow="";
    const k=openK; openK=null; if(k) lift(k,false);
    busy=false; if(lastTrigger && lastTrigger.focus) lastTrigger.focus({preventScroll:true});
  }
  document.getElementById("drClose").addEventListener("click",closeStep);
  bd.addEventListener("click",closeStep);
  body.addEventListener("click",ev=>{
    const go=ev.target.closest("[data-go]"); if(go){ openStep(+go.dataset.go); return; }
    if(ev.target.closest("[data-close]")) closeStep();
  });
  dlg.addEventListener("keydown",ev=>{
    if(ev.key==="Escape"){ closeStep(); return; }
    if(ev.key==="ArrowRight"&&cur<ETAPAS.length-1&&!ev.target.closest("a,input")) openStep(cur+1);
    if(ev.key==="ArrowLeft"&&cur>0&&!ev.target.closest("a,input")) openStep(cur-1);
    if(ev.key!=="Tab") return;
    const f=[...dlg.querySelectorAll('button:not([disabled]),a[href]')]; if(!f.length) return;
    if(ev.shiftKey&&document.activeElement===f[0]){ ev.preventDefault(); f[f.length-1].focus(); }
    else if(!ev.shiftKey&&document.activeElement===f[f.length-1]){ ev.preventDefault(); f[0].focus(); }
  });

  if(reduce || !("IntersectionObserver" in window)){ fig.classList.add("in"); return; }
  const io=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ fig.classList.add("in"); io.disconnect(); } },{threshold:.3}); io.observe(fig);
})();


/* ===== Formulario -> WhatsApp ===== */
(function(){
  const sel=document.getElementById("fServicio"), q=new URLSearchParams(location.search).get("servicio");
  if(q && [...sel.options].some(o=>o.value===q)) sel.value=q;
  document.getElementById("quoteForm").addEventListener("submit", e=>{
    e.preventDefault();
    const f=e.target, note=document.getElementById("formNote");
    if(!f.nombre.value.trim() || !f.mensaje.value.trim()){ note.textContent="Complete su nombre y la descripción del proyecto."; return; }
    const txt=`Hola, soy ${f.nombre.value.trim()}${f.empresa.value.trim()?` de ${f.empresa.value.trim()}`:""}. Quisiera cotizar: ${f.servicio.value}.\n\n${f.mensaje.value.trim()}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`,"_blank","noopener");
    note.textContent="Se abrió WhatsApp con su mensaje. Solo falta enviarlo.";
  });
})();
