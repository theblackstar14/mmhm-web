/* Formulario -> WhatsApp (admite ?servicio= para preseleccionar) */
(function(){
  const form=document.getElementById("quoteForm");
  const sel=document.getElementById("fServicio"), q=new URLSearchParams(location.search).get("servicio");
  if(q && [...sel.options].some(o=>o.value===q)) sel.value=q;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const f=e.target, note=document.getElementById("formNote");
    if(!f.nombre.value.trim() || !f.mensaje.value.trim()){ note.textContent="Complete su nombre y la descripción del proyecto."; return; }
    const txt=`Hola, soy ${f.nombre.value.trim()}${f.empresa.value.trim()?` de ${f.empresa.value.trim()}`:""}. Quisiera cotizar: ${f.servicio.value}.\n\n${f.mensaje.value.trim()}`;
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(txt)}`,"_blank","noopener");
    note.textContent="Se abrió WhatsApp con su mensaje. Solo falta enviarlo.";
  });
})();
