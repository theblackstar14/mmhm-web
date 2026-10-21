/* MM High Metrik — listado de obras: filtros, vista lista/mapa y panel de vista rápida */
(function(){
const DATA = JSON.parse(document.getElementById("obrasData").textContent);
const BY = Object.fromEntries(DATA.map(d=>[d.id,d]));
const TIPN = {rio:"Ríos y defensas", geo:"Taludes y geomallas", pub:"Espacios públicos y patrimonio", edif:"Edificaciones"};
const TICO = {
  geo:'<path d="M4 34 20 6l16 28Z"/><path d="M12 20h16M9 26h22M16 13v21M24 13v21"/>',
  rio:'<path d="M4 14c4-4 8 4 12 0s8 4 12 0 6 2 8 0M4 24c4-4 8 4 12 0s8 4 12 0 6 2 8 0"/>',
  pub:'<path d="M4 34h32M8 34V18M16 34V18M24 34V18M32 34V18M4 18h32L20 6Z"/>',
  edif:'<path d="M6 34V14l14-8 14 8v20M6 34h28M15 34V22h10v12"/>'};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = s => document.querySelector(s);
const gridEl = $("#grid"), cards = [...gridEl.querySelectorAll(".card")], feat = $(".feat-obra");
const svgI = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">${d}</svg>`;
const I = {l:'<path d="m15 6-6 6 6 6"/>', r:'<path d="m9 6 6 6-6 6"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  ba:'<path d="m9 6-6 6 6 6M15 6l6 6-6 6"/>', arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>'};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- Filtros ---------- */
let filtro = "todos";
const visibles = () => cards.filter(c => !c.hidden);
const listaActual = () => DATA.filter(p => filtro==="todos" || p.tipo===filtro);
function setFiltro(f, opts={}){
  filtro = BY && (f==="todos" || TIPN[f]) ? f : "todos";
  document.querySelectorAll("#filters .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.f===filtro));
  closeProject(true);
  cards.forEach(c => c.hidden = !(filtro==="todos" || c.dataset.tipo===filtro));
  if(feat) feat.hidden = !(filtro==="todos" || feat.dataset.tipo===filtro);
  $("#emptyMsg").hidden = visibles().length>0;
  syncMap(!opts.silent);
  setParam("tipo", filtro==="todos" ? null : filtro);
}
$("#filters").addEventListener("click", e => { const b=e.target.closest(".chip"); if(b) setFiltro(b.dataset.f); });

function setParam(k, v){
  const u = new URL(location.href);
  v==null ? u.searchParams.delete(k) : u.searchParams.set(k, v);
  history.replaceState(null, "", u.pathname + (u.search ? u.search : "") + u.hash);
}

/* ---------- Vista lista / mapa ---------- */
let vista = "lista";
function setVista(v){
  vista = v==="mapa" ? "mapa" : "lista";
  document.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.view===vista));
  /* El mapa aparece arriba; la lista de obras sigue visible debajo. */
  $("#viewMapa").hidden = vista!=="mapa";
  if(vista==="mapa"){ initMap(); requestAnimationFrame(()=>{ map && map.invalidateSize(); syncMap(false); }); }
  setParam("vista", vista==="mapa" ? "mapa" : null);
}
document.querySelector(".seg").addEventListener("click", e => { const b=e.target.closest("button[data-view]"); if(b) setVista(b.dataset.view); });

/* ---------- Comparadores antes / después ---------- */
function setupSlider(root){
  const f = root.querySelector(".ba-frame"); if(!f) return;
  const r = f.querySelector("input"); let stop=false;
  const set = v => { f.style.setProperty("--x", v+"%"); r.value=v; };
  r.addEventListener("input", ()=>{ stop=true; set(r.value); });
  f.addEventListener("pointerdown", ()=>stop=true, {once:true});
  if(reduce) return;
  const pts=[50,16,84,50], seg=650, ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  setTimeout(()=>{ const t0=performance.now();
    const tick=now=>{ if(stop) return; const t=(now-t0)/seg, k=Math.floor(t);
      if(k>=pts.length-1){ set(50); return; }
      set(pts[k]+(pts[k+1]-pts[k])*ease(t-k)); requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }, 550);
}
if(feat) setupSlider(feat);

/* ---------- Panel de vista rápida bajo la fila ---------- */
const PD = {id:null};
function mediaHTML(p){
  if(p.antes && p.alineado) return `<div class="ba-frame" style="--x:50%">
    <img class="ba-img" src="${p.antes}" alt="${esc(p.t)} antes de la obra">
    <div class="ba-after"><img class="ba-img" src="${p.desp||p.big}" alt="${esc(p.t)} después de la obra"></div>
    <div class="ba-handle" aria-hidden="true"><span>${svgI(I.ba)}</span></div>
    <span class="ba-tag ba-tag-l">Antes</span><span class="ba-tag ba-tag-r">Después</span>
    <input type="range" min="0" max="100" value="50" aria-label="Deslice para comparar el antes y el después de ${esc(p.t)}"></div>`;
  if(p.antes) return `<div class="cmp"><figure><img src="${p.antes}" alt="${esc(p.t)} antes de la obra"><figcaption>Antes</figcaption></figure><figure><img src="${p.big}" alt="${esc(p.t)} después de la obra"><figcaption>Después</figcaption></figure></div>`;
  if(p.big) return `<div class="pd-photo"><img src="${p.big}" alt="${esc(p.t)}"></div>`;
  return `<div class="pd-photo"><div class="ph" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6">${TICO[p.tipo]}</svg></div></div>`;
}
function panelInner(p){
  const L=listaActual(), i=L.findIndex(x=>x.id===p.id);
  const ficha = [p.u&&`<dt>Ubicación</dt><dd>${esc(p.u)}</dd>`, p.c&&`<dt>Cliente</dt><dd>${esc(p.c)}</dd>`, p.tr&&`<dt>Tramo</dt><dd>${esc(p.tr)}</dd>`].filter(Boolean).join("");
  return `<div class="pd-inner"><div class="pd-box">
    <div class="pd-media">${mediaHTML(p)}</div>
    <div class="pd-info">
      <div class="pd-top"><span class="pd-tag">${TIPN[p.tipo]}${p.nf>1?` · ${p.nf} fotos`:""}</span>
        <div class="pd-ctrl">
          <button data-pd="prev" aria-label="Obra anterior" ${i<=0?"disabled":""}>${svgI(I.l)}</button>
          <button data-pd="next" aria-label="Obra siguiente" ${i>=L.length-1?"disabled":""}>${svgI(I.r)}</button>
          <button data-pd="close" aria-label="Cerrar vista rápida">${svgI(I.x)}</button>
        </div></div>
      <h3 id="pd-title" tabindex="-1"><a href="${p.url}">${esc(p.t)}</a></h3>
      <p class="pd-desc">${esc(p.d)}</p>
      ${ficha?`<dl class="ficha">${ficha}</dl>`:""}
      <div class="pd-actions pd-actions-4">
        <a class="btn btn-wa" href="${p.wa}" target="_blank" rel="noopener">Cotizar una similar</a>
        <a class="btn btn-primary" href="${p.url}">Más detalle${svgI(I.r)}</a>
        ${p.ll?`<button class="btn btn-ghost" data-pd="map">${svgI(I.pin)}Ver en mapa</button>`:""}
        <button class="btn btn-ghost" data-pd="share">${svgI(I.share)}<span>Compartir</span></button>
      </div>
    </div></div></div>`;
}
const DUR_OPEN=520, DUR_CLOSE=380;
function expand(el,instant){
  if(instant||reduce) return Promise.resolve();
  const h=el.scrollHeight;
  el.querySelector(".pd-box").animate([{opacity:0,transform:"translateY(-14px)"},{opacity:1,transform:"none"}],{duration:DUR_OPEN,easing:"cubic-bezier(.2,.8,.2,1)",delay:80,fill:"backwards"});
  return el.animate([{height:"0px"},{height:h+"px"}],{duration:DUR_OPEN,easing:"cubic-bezier(.2,.8,.2,1)"}).finished.catch(()=>{});
}
function collapse(el,instant){
  el.classList.add("closing");
  if(instant||reduce){ el.remove(); return Promise.resolve(); }
  const h=el.offsetHeight;
  return el.animate([{height:h+"px",opacity:1},{height:"0px",opacity:0}],{duration:DUR_CLOSE,easing:"cubic-bezier(.4,0,.2,1)",fill:"forwards"}).finished.catch(()=>{}).then(()=>el.remove());
}
function markCards(id){
  cards.forEach(c=>{ const on=c.dataset.id===id; c.classList.toggle("is-open",on); c.querySelector(".card-open")?.setAttribute("aria-expanded",on); });
}
const nxFor = card => (card.offsetLeft + card.offsetWidth/2) + "px";
function topSafe(){ const bar=document.querySelector(".obras-bar"); return (bar? bar.getBoundingClientRect().bottom : 90) + 12; }
function ensureVisible(card){
  const panel=gridEl.querySelector(".pd:not(.closing)");
  const ts=topSafe(), ct=card.getBoundingClientRect().top, pb=panel?panel.getBoundingClientRect().bottom:card.getBoundingClientRect().bottom;
  const bottomSafe=innerHeight-(matchMedia("(max-width:820px)").matches?96:24);
  if(ct>=ts && pb<=bottomSafe) return;
  let y=scrollY+ct-ts;
  if(ct>=ts && pb-ct < bottomSafe-ts) y=Math.min(y, scrollY+pb-bottomSafe);
  else if(panel && pb-ct >= bottomSafe-ts) y=scrollY+panel.getBoundingClientRect().top-ts;
  window.scrollTo({top:Math.max(0,y),behavior:reduce?"auto":"smooth"});
}
async function openProject(id,opt={}){
  const card=gridEl.querySelector(`.card[data-id="${id}"]`); if(!card || card.hidden) return;
  if(PD.id===id && !opt.force) return closeProject();
  const p=BY[id];
  const vc=visibles(), idx=vc.indexOf(card);
  const cols=getComputedStyle(gridEl).gridTemplateColumns.split(" ").length;
  const row=Math.floor(idx/cols), rowEnd=vc[Math.min(vc.length-1,row*cols+cols-1)];
  const old=gridEl.querySelector(".pd:not(.closing)");
  PD.id=id; markCards(id);
  let done;
  if(old && old.dataset.row===String(row)){
    const h0=old.offsetHeight; old.innerHTML=panelInner(p); old.style.setProperty("--nx",nxFor(card));
    const h1=old.scrollHeight;
    if(!reduce){
      old.querySelector(".pd-info").animate([{opacity:0,transform:"translateX(18px)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
      old.querySelector(".pd-media").animate([{opacity:0},{opacity:1}],{duration:380});
      done=old.animate([{height:h0+"px"},{height:h1+"px"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"}).finished.catch(()=>{});
    } else done=Promise.resolve();
    setupSlider(old);
  } else {
    const el=document.createElement("div");
    el.className="pd"; el.id="pd"; el.dataset.row=row; el.setAttribute("role","region"); el.setAttribute("aria-labelledby","pd-title");
    el.innerHTML=panelInner(p);
    if(old){ old.removeAttribute("id"); old.querySelector("#pd-title")?.removeAttribute("id"); }
    const closing = old ? collapse(old,opt.instant) : Promise.resolve();
    rowEnd.after(el);
    el.style.setProperty("--nx",nxFor(card));
    done=Promise.all([closing,expand(el,opt.instant)]);
    setupSlider(el);
  }
  await done;
  ensureVisible(card);
  document.getElementById("pd-title")?.focus({preventScroll:true});
}
async function closeProject(instant){
  const el=gridEl.querySelector(".pd:not(.closing)"); if(!el) { PD.id=null; markCards(null); return; }
  const id=PD.id; PD.id=null; markCards(null);
  await collapse(el, instant===true);
  if(instant!==true) gridEl.querySelector(`.card[data-id="${id}"] .card-open`)?.focus({preventScroll:true});
}
gridEl.addEventListener("click", async e=>{
  const ob=e.target.closest(".card-open"); if(ob){ openProject(ob.dataset.open); return; }
  const b=e.target.closest("[data-pd]"); if(!b) return;
  const L=listaActual(), i=L.findIndex(x=>x.id===PD.id), a=b.dataset.pd;
  if(a==="close") closeProject();
  else if(a==="prev"&&i>0) openProject(L[i-1].id);
  else if(a==="next"&&i<L.length-1) openProject(L[i+1].id);
  else if(a==="map"){ const id=PD.id; setVista("mapa"); setTimeout(()=>focusProject(id),250); }
  else if(a==="share"){
    const p=BY[PD.id], url=location.origin+p.url;
    if(navigator.share){ try{ await navigator.share({title:`${p.t} · MM High Metrik`, text:p.d, url}); }catch(_){} }
    else { try{ await navigator.clipboard.writeText(url); const s=b.querySelector("span"), t=s.textContent; s.textContent="Enlace copiado"; setTimeout(()=>s.textContent=t,2000);}catch(_){ prompt("Copie el enlace:",url); } }
  }
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && PD.id) closeProject(); });
let rzT; addEventListener("resize",()=>{ clearTimeout(rzT); rzT=setTimeout(()=>{ if(PD.id){ const id=PD.id; gridEl.querySelector(".pd")?.remove(); PD.id=null; openProject(id,{instant:true}); } },250); });

/* ---------- Mapa ---------- */
let map, markers={};
const OFICINA={t:"Oficina MM High Metrik", ll:[-12.0942,-77.0392], u:"Av. República de Colombia 625, San Isidro"};
function popHtml(p){
  const media = p.card ? `<img src="${p.card}" alt="">` : `<div class="pop-ph ph"></div>`;
  return `<div class="pop">${media}<div class="t"><small>${TIPN[p.tipo]}</small><h4>${esc(p.t)}</h4><p>${esc(p.u||"")}</p><a class="pop-open" href="${p.url}">Ver obra</a></div></div>`;
}
function initMap(){
  if(map) return;
  if(!window.L){ $("#obrasMap").innerHTML='<p class="empty" style="margin:40px">No se pudo cargar el mapa. Revise su conexión.</p>'; return; }
  map=L.map("obrasMap",{scrollWheelZoom:false});
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imágenes &copy; Esri"}).addTo(map);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,opacity:.85}).addTo(map);
  DATA.filter(p=>p.ll).forEach(p=>{
    markers[p.id]=L.marker(p.ll,{icon:L.divIcon({className:"",html:'<div class="pin"></div>',iconSize:[22,22],iconAnchor:[11,11]}),title:p.t,keyboard:true})
      .bindPopup(popHtml(p),{maxWidth:260,minWidth:260});
  });
  L.marker(OFICINA.ll,{icon:L.divIcon({className:"",html:'<div class="pin office"></div>',iconSize:[22,22],iconAnchor:[11,11]}),title:OFICINA.t})
    .bindPopup(`<div class="pop"><div class="t"><small>Oficina</small><h4>${OFICINA.t}</h4><p>${OFICINA.u}</p></div></div>`).addTo(map);
  syncMap(false);
}
const enMapa = () => DATA.filter(p=>p.ll&&(filtro==="todos"||p.tipo===filtro));
function syncMap(animate,all=false){
  if(!map || vista!=="mapa") { if(map){ const vis=new Set(enMapa().map(p=>p.id)); Object.entries(markers).forEach(([id,m])=>vis.has(id)?m.addTo(map):m.remove()); } return; }
  const vs=enMapa(), vis=new Set(vs.map(p=>p.id));
  Object.entries(markers).forEach(([id,m])=>vis.has(id)?m.addTo(map):m.remove());
  const lima=vs.filter(p=>p.ll[1]<-76), target=(all||!lima.length)?vs:lima;
  if(!target.length) return;
  const b=L.latLngBounds(target.map(p=>p.ll)), fit=b.pad(target.length>1?.2:.5);
  animate&&!reduce ? map.flyToBounds(fit,{duration:1.1}) : map.fitBounds(fit);
}
function focusProject(id){
  const m=markers[id]; if(!m) return;
  if(!map.hasLayer(m)) m.addTo(map);
  $("#obrasMap").scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"});
  document.querySelectorAll(".pin.active").forEach(e=>e.classList.remove("active"));
  const go=()=>{ m.openPopup(); m.getElement()?.querySelector(".pin")?.classList.add("active"); };
  reduce ? (map.setView(m.getLatLng(),16), go()) : (map.flyTo(m.getLatLng(),16,{duration:1.6}), map.once("moveend",go));
}
document.querySelector(".map-jump").addEventListener("click",e=>{
  const b=e.target.closest("[data-jump]"); if(!b||!map) return;
  const v=b.dataset.jump, fly=(c,z)=>reduce?map.setView(c,z):map.flyTo(c,z,{duration:1.2});
  if(v==="lima") fly([-12.09,-77.0],11); else if(v==="puno") fly([-14.628,-69.443],14); else syncMap(true,true);
});

/* ---------- Estado inicial desde la URL (?tipo=, ?vista=mapa, ?obra=) ---------- */
const q=new URLSearchParams(location.search);
if(q.get("tipo")) setFiltro(q.get("tipo"),{silent:true});
if(q.get("vista")==="mapa"){ setVista("mapa"); const o=q.get("obra"); if(o && BY[o]) setTimeout(()=>focusProject(o),400); }
})();
