/* MM High Metrik — página de obra: galería en modal, antes/después, recorrido por fases, mapa y compartir */
(function(){
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);
const json = id => { const el=$(id); try{ return el ? JSON.parse(el.textContent) : null; }catch(_){ return null; } };
const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${d}</svg>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- Antes / después ---------- */
const f = document.querySelector(".obra-ba .ba-frame");
if(f){
  const r=f.querySelector("input"); let stop=false;
  const set=v=>{ f.style.setProperty("--x",v+"%"); r.value=v; };
  r.addEventListener("input",()=>{ stop=true; set(r.value); });
  f.addEventListener("pointerdown",()=>stop=true,{once:true});
  if(!reduce && "IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>{ if(!es[0].isIntersecting) return; io.disconnect();
      const pts=[50,16,84,50], seg=650, ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, t0=performance.now();
      const tick=now=>{ if(stop) return; const t=(now-t0)/seg, k=Math.floor(t);
        if(k>=pts.length-1){ set(50); return; } set(pts[k]+(pts[k+1]-pts[k])*ease(t-k)); requestAnimationFrame(tick); };
      requestAnimationFrame(tick); },{threshold:.5});
    io.observe(f);
  }
}

/* ---------- Galería en modal ---------- */
const FOTOS = json("galData") || [], gal = $("gal");
if(gal && FOTOS.length){
  const img=$("galImg"), cap=$("galCap"), cnt=$("galCount"), th=$("galThumbs");
  let cur=0, last=null;
  const one = FOTOS.length<2;
  function show(i,dir){
    cur=(i+FOTOS.length)%FOTOS.length;
    const apply=()=>{ img.src=FOTOS[cur][0]; img.alt=FOTOS[cur][1]; cap.textContent=FOTOS[cur][1]; cnt.textContent=`${cur+1} / ${FOTOS.length}`;
      if(th){ th.querySelectorAll("button").forEach((b,k)=>b.setAttribute("aria-current",k===cur)); th.children[cur].scrollIntoView({block:"nearest",inline:"center"}); }
      [1,-1].forEach(k=>{ const n=FOTOS[(cur+k+FOTOS.length)%FOTOS.length]; if(n){ const im=new Image(); im.src=n[0]; } }); };
    if(!reduce && dir && !gal.hidden){
      img.animate([{opacity:1,transform:"none"},{opacity:0,transform:`translateX(${-dir*24}px)`}],{duration:140}).finished.then(()=>{
        apply(); img.animate([{opacity:0,transform:`translateX(${dir*24}px)`},{opacity:1,transform:"none"}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"}); });
    } else apply();
  }
  function open(i){
    last=document.activeElement; gal.hidden=false; document.documentElement.style.overflow="hidden"; show(i);
    if(!reduce){ gal.animate([{opacity:0},{opacity:1}],{duration:240});
      gal.querySelector(".gal-box").animate([{opacity:0,transform:"translateY(16px) scale(.98)"},{opacity:1,transform:"none"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"}); }
    $("galClose").focus();
  }
  async function close(){
    if(gal.hidden) return;
    if(!reduce) await gal.animate([{opacity:1},{opacity:0}],{duration:200}).finished.catch(()=>{});
    gal.hidden=true; document.documentElement.style.overflow=""; img.removeAttribute("src"); if(last) last.focus({preventScroll:true});
  }
  document.querySelectorAll(".ob-mosaic figure").forEach(fg=>{
    const i=+fg.dataset.i; fg.addEventListener("click",()=>open(i));
    fg.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(i); } });
  });
  $("galOpen")?.addEventListener("click",()=>open(0));
  $("galClose").addEventListener("click",close);
  $("galPrev")?.addEventListener("click",()=>show(cur-1,-1));
  $("galNext")?.addEventListener("click",()=>show(cur+1,1));
  th?.addEventListener("click",e=>{ const b=e.target.closest("button[data-i]"); if(b){ const k=+b.dataset.i; show(k,k>cur?1:-1); } });
  gal.addEventListener("click",e=>{ if(e.target===gal) close(); });
  gal.addEventListener("keydown",e=>{
    if(e.key==="Escape") close();
    else if(!one && e.key==="ArrowRight") show(cur+1,1);
    else if(!one && e.key==="ArrowLeft") show(cur-1,-1);
    else if(e.key==="Tab"){ const fs=[...gal.querySelectorAll("button")]; const k=fs.indexOf(document.activeElement); e.preventDefault(); fs[(k+(e.shiftKey?-1:1)+fs.length)%fs.length].focus(); }
  });
  let x0=null;
  img.addEventListener("pointerdown",e=>{ x0=e.clientX; });
  img.addEventListener("pointerup",e=>{ if(x0==null||one) return; const dx=e.clientX-x0; x0=null; if(Math.abs(dx)>50) dx<0?show(cur+1,1):show(cur-1,-1); });
}

/* ---------- Recorrido de la obra ---------- */
const R = json("rutaData"), fig=$("procFig");
if(R && fig){
  const stage=$("procStage"), halo=$("gHalo"), core=$("gCore");
  const pieces=[...stage.querySelectorAll(".pz")], N=R.fases.length;
  let openI=-1, busy=false, cur=-1, last=null;
  function glow(k,dur){
    halo.setAttribute("d",R.rutas[k]); core.setAttribute("d",R.rutas[k]);
    const len=Math.max(26,110/(k+1)), tr=[{strokeDasharray:`${len} 300`,strokeDashoffset:len,opacity:1},{strokeDasharray:`${len} 300`,strokeDashoffset:-100+len*.2,opacity:1,offset:.85},{strokeDasharray:`${len} 300`,strokeDashoffset:-100,opacity:0}];
    const o={duration:dur||(420+k*170),easing:"cubic-bezier(.5,0,.3,1)",fill:"forwards"};
    halo.animate(tr,o); return core.animate(tr,o).finished.catch(()=>{});
  }
  const lift=(i,on)=>{ pieces[i].classList.toggle("lift",on||i===openI); stage.querySelector(`.proc-lbl[data-i="${i}"]`)?.classList.toggle("on",on||i===openI); };
  pieces.forEach((p,i)=>{
    p.addEventListener("pointerenter",()=>lift(i,true)); p.addEventListener("pointerleave",()=>lift(i,false));
    p.addEventListener("focus",()=>lift(i,true)); p.addEventListener("blur",()=>lift(i,false));
    p.addEventListener("click",()=>openStep(i));
  });
  $("procList").addEventListener("click",ev=>{ const b=ev.target.closest("button[data-i]"); if(b) openStep(+b.dataset.i); });

  const dlg=$("stepDlg"), bd=$("stepBd"), body=$("stepBody"), heroImg=$("drHeroImg"), heroBox=$("drHero");
  const mobile=()=>matchMedia("(max-width:640px)").matches;
  function content(i){
    const e=R.fases[i];
    return `<div class="dr-content"><span class="dr-n">0${i+1}</span><h3 id="stepTitle">${esc(e.t)}</h3><div class="dr-cota"><i></i></div>
      <p class="dr-lead">${esc(e.lead)}</p><h4>Qué se hizo</h4><ul class="dr-list">${e.inc.map((x,j)=>`<li style="--i:${j}">${esc(x)}</li>`).join("")}</ul>
      <div class="dr-out"><b>Resultado de la fase</b>${esc(e.out)}</div>
      ${e.foto?`<h4>En obra</h4><div class="dr-case"><div class="media"><img src="${e.foto}" alt="${esc(e.t)}: ${esc(R.obra)}"><span class="tag">Foto de la obra</span></div></div>`:""}</div>
      <div class="dr-foot"><div class="dr-nav"><button data-go="${i-1}" ${i===0?"disabled":""} aria-label="Fase anterior">${sv('<path d="m15 6-6 6 6 6"/>')}</button><button data-go="${i+1}" ${i===N-1?"disabled":""} aria-label="Fase siguiente">${sv('<path d="m9 6 6 6-6 6"/>')}</button></div>
      <a class="btn btn-primary" href="${R.wa}" target="_blank" rel="noopener">Cotizar una obra similar</a></div>`;
  }
  function setLift(i){ const o=openI; openI=i; if(o>-1) lift(o,false); lift(i,true); }
  function heroTarget(src){
    const r=heroBox.getBoundingClientRect(), ih=mobile()?128:170, ar=src.naturalWidth/src.naturalHeight||1.3;
    let h2=ih,w2=h2*ar; const mw=r.width*.86; if(w2>mw){w2=mw;h2=w2/ar;}
    return {left:r.left+(r.width-w2)/2,top:r.top+(r.height-h2)/2,width:w2,height:h2};
  }
  async function openStep(i){
    if(busy) return;
    if(!dlg.hidden){ const dir=i>cur?1:-1; cur=i; setLift(i); heroImg.style.opacity=0; setTimeout(()=>{ heroImg.src=R.pz[i]; heroImg.style.opacity=1; },180);
      body.innerHTML=content(i); body.style.setProperty("--sx",(dir*24)+"px"); dlg.classList.remove("swap","reveal"); void dlg.offsetWidth; dlg.classList.add("swap","reveal"); dlg.scrollTop=0; return; }
    busy=true; cur=i; last=document.activeElement; setLift(i);
    const src=pieces[i].querySelector("img"); body.innerHTML=content(i); heroImg.src=R.pz[i]; document.documentElement.style.overflow="hidden";
    if(reduce){ bd.hidden=false; dlg.hidden=false; dlg.classList.add("reveal"); busy=false; $("drClose").focus(); return; }
    await glow(i);
    const from=src.getBoundingClientRect(); bd.hidden=false; dlg.hidden=false; dlg.classList.remove("reveal","swap");
    const to=heroTarget(src); heroImg.style.opacity=0;
    dlg.animate(mobile()?[{transform:"translateY(100%)"},{transform:"none"}]:[{transform:"translateX(100%)"},{transform:"none"}],{duration:480,easing:"cubic-bezier(.2,.8,.2,1)"});
    bd.animate([{opacity:0},{opacity:1}],{duration:380});
    const c=src.cloneNode(); c.className="fly-clone"; Object.assign(c.style,{left:from.left+"px",top:from.top+"px",width:from.width+"px",height:from.height+"px"});
    document.body.appendChild(c); pieces[i].style.visibility="hidden";
    const fly=c.animate([{left:from.left+"px",top:from.top+"px",width:from.width+"px",height:from.height+"px"},
      {left:(from.left+to.left)/2+"px",top:Math.min(from.top,to.top)-40+"px",width:(from.width+to.width)/2+"px",height:(from.height+to.height)/2+"px",offset:.45},
      {left:to.left+"px",top:to.top+"px",width:to.width+"px",height:to.height+"px"}],{duration:640,easing:"cubic-bezier(.3,.7,.2,1)",fill:"forwards"});
    setTimeout(()=>dlg.classList.add("reveal"),260);
    await fly.finished.catch(()=>{});
    heroImg.style.opacity=1; c.remove(); pieces[i].style.visibility=""; busy=false; $("drClose").focus();
  }
  async function closeStep(){
    if(dlg.hidden||busy) return; busy=true;
    if(!reduce){ bd.animate([{opacity:1},{opacity:0}],{duration:280});
      await dlg.animate(mobile()?[{transform:"none"},{transform:"translateY(100%)"}]:[{transform:"none"},{transform:"translateX(100%)"}],{duration:300,easing:"cubic-bezier(.5,0,.8,.3)"}).finished.catch(()=>{}); }
    dlg.hidden=true; bd.hidden=true; dlg.classList.remove("reveal","swap"); document.documentElement.style.overflow="";
    const o=openI; openI=-1; if(o>-1) lift(o,false); busy=false; if(last&&last.focus) last.focus({preventScroll:true});
  }
  $("drClose").addEventListener("click",closeStep); bd.addEventListener("click",closeStep);
  body.addEventListener("click",ev=>{ const g=ev.target.closest("[data-go]"); if(g) openStep(+g.dataset.go); });
  dlg.addEventListener("keydown",ev=>{
    if(ev.key==="Escape") closeStep();
    else if(ev.key==="ArrowRight"&&cur<N-1&&!ev.target.closest("a")) openStep(cur+1);
    else if(ev.key==="ArrowLeft"&&cur>0&&!ev.target.closest("a")) openStep(cur-1);
    else if(ev.key==="Tab"){ const fs=[...dlg.querySelectorAll("button:not([disabled]),a[href]")]; if(!fs.length) return;
      if(ev.shiftKey&&document.activeElement===fs[0]){ ev.preventDefault(); fs[fs.length-1].focus(); }
      else if(!ev.shiftKey&&document.activeElement===fs[fs.length-1]){ ev.preventDefault(); fs[0].focus(); } }
  });
  if(reduce || !("IntersectionObserver" in window)) fig.classList.add("in","done");
  else { const io=new IntersectionObserver(es=>{ if(!es[0].isIntersecting) return; io.disconnect(); fig.classList.add("in");
    setTimeout(()=>glow(N-1,1700),250); setTimeout(()=>fig.classList.add("done"),1400); },{threshold:.3}); io.observe(fig); }
}

/* ---------- Mapa de ubicación ---------- */
const m=$("obraMap");
if(m){
  const start=()=>{
    if(!window.L){ m.innerHTML='<p class="empty" style="margin:30px">No se pudo cargar el mapa.</p>'; return; }
    const ll=[+m.dataset.lat, +m.dataset.lng];
    const map=L.map(m,{scrollWheelZoom:false,zoomControl:true}).setView(ll,15);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imágenes &copy; Esri"}).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,opacity:.85}).addTo(map);
    L.marker(ll,{icon:L.divIcon({className:"",html:'<div class="pin active"></div>',iconSize:[22,22],iconAnchor:[11,11]}),title:m.dataset.t}).addTo(map);
  };
  if("IntersectionObserver" in window){ const io=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ io.disconnect(); start(); } },{rootMargin:"300px"}); io.observe(m); }
  else start();
}

/* ---------- Compartir: siempre la URL de esta obra ---------- */
const sb=$("shareBtn");
if(sb) sb.addEventListener("click", async ()=>{
  const url=location.origin+location.pathname, title=document.title;
  if(navigator.share){ try{ await navigator.share({title, url}); }catch(_){} return; }
  try{ await navigator.clipboard.writeText(url); const s=sb.querySelector("span"), t=s.textContent; s.textContent="Enlace copiado"; setTimeout(()=>s.textContent=t,2000); }
  catch(_){ prompt("Copie el enlace:", url); }
});
})();
