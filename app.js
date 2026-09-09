const KEY="control_artes_v2";
let records=JSON.parse(localStorage.getItem(KEY)||"[]");
let editingId=null;

const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(records));render();}
function statusClass(s){return ({Aprobado:"approved","En proceso":"process",Pendiente:"pending",Rechazado:"rejected",Vencido:"expired"})[s]||"pending"}
function daysTo(d){if(!d)return null;return Math.ceil((new Date(d+"T23:59:59")-new Date())/86400000)}
function effectiveStatus(r){if(r.status!=="Aprobado" && r.due && daysTo(r.due)<0)return "Vencido";return r.status}
function render(){
  const q=$("search").value.toLowerCase(), sf=$("statusFilter").value, af=$("areaFilter").value;
  const filtered=records.filter(r=>(!q||[r.material,r.code,r.supplier,r.area,r.responsible].join(" ").toLowerCase().includes(q))&&(!sf||effectiveStatus(r)===sf)&&(!af||r.area===af));
  $("total").textContent=records.length;
  $("complete").textContent=records.filter(r=>effectiveStatus(r)==="Aprobado"||+r.progress>=100).length;
  $("process").textContent=records.filter(r=>effectiveStatus(r)==="En proceso").length;
  $("alerts").textContent=records.filter(r=>["Rechazado","Vencido"].includes(effectiveStatus(r))).length;
  $("recordCount").textContent=`${filtered.length} registros`;
  $("updated").textContent="Actualizado: "+(records.length?new Date().toLocaleString("es-EC"):"—");
  const areas=[...new Set(records.map(r=>r.area).filter(Boolean))];
  $("areaFilter").innerHTML='<option value="">Todas las áreas</option>'+areas.map(a=>`<option ${a===af?"selected":""}>${esc(a)}</option>`).join("");
  $("tableBody").innerHTML=filtered.map(r=>row(r)).join("");
  $("empty").classList.toggle("hidden",filtered.length>0);
  analysis();
}
function row(r){
 const s=effectiveStatus(r), d=r.due?new Date(r.due+"T12:00:00").toLocaleDateString("es-EC"):"—";
 return `<tr><td><div class="material">${esc(r.material)}</div><div class="muted">${esc(r.unit||"")}</div></td>
 <td>${esc(r.code)}</td><td>${esc(r.supplier||"—")}</td><td>${esc(r.area||"—")}</td><td>${esc(r.responsible||"—")}</td>
 <td><div>${+r.progress||0}%</div><div class="progress"><i style="width:${Math.max(0,Math.min(100,+r.progress||0))}%"></i></div></td>
 <td><span class="status ${statusClass(s)}">${esc(s)}</span></td><td>${d}</td>
 <td class="row-actions"><button onclick="editRecord('${r.id}')">✎</button> <button onclick="deleteRecord('${r.id}')">🗑</button></td></tr>`;
}
function analysis(){
 const n=records.length, avg=n?Math.round(records.reduce((a,r)=>a+(+r.progress||0),0)/n):0;
 const complete=records.filter(r=>effectiveStatus(r)==="Aprobado"||+r.progress>=100).length;
 const late=records.filter(r=>r.due&&daysTo(r.due)<0&&effectiveStatus(r)!=="Aprobado").length;
 const soon=records.filter(r=>{let d=daysTo(r.due);return d!==null&&d>=0&&d<=2&&effectiveStatus(r)!=="Aprobado"}).length;
 $("aTotal").textContent=n;$("aProgress").textContent=avg+"%";$("aComplete").textContent=complete;$("aLate").textContent=late;$("aSoon").textContent=soon;
 const map={};records.forEach(r=>{const a=r.area||"Sin área";(map[a]??=[]).push(r)});
 $("areaAnalysis").innerHTML=Object.entries(map).map(([a,rs])=>{let p=Math.round(rs.reduce((x,r)=>x+(+r.progress||0),0)/rs.length);return `<div class="area-row"><div class="area-top"><span>${esc(a)}</span><span>${p}% · ${rs.length} registro(s)</span></div><div class="area-bar"><i style="width:${p}%"></i></div></div>`}).join("")||'<div class="bottleneck">Sin datos.</div>';
 const attention=records.filter(r=>["Rechazado","Vencido"].includes(effectiveStatus(r))||(daysTo(r.due)>=0&&daysTo(r.due)<=2));
 $("attention").innerHTML=attention.map(r=>`<div class="attention"><b>${esc(r.material)}</b> · ${esc(effectiveStatus(r))}<br><span class="muted">${esc(r.responsible||"Sin responsable")} · límite: ${r.due||"—"}</span></div>`).join("")||'<div class="bottleneck">No hay registros que requieran atención.</div>';
 const bott=Object.entries(map).sort((a,b)=>(a[1].reduce((x,r)=>x+(+r.progress||0),0)/a[1].length)-(b[1].reduce((x,r)=>x+(+r.progress||0),0)/b[1].length))[0];
 $("bottleneck").textContent=bott?`${bott[0]} — avance promedio ${Math.round(bott[1].reduce((x,r)=>x+(+r.progress||0),0)/bott[1].length)}%`:"Sin datos suficientes.";
}
function openModal(r=null){editingId=r?.id||null;$("modalTitle").textContent=r?"Editar material / arte":"Registrar material / arte";$("recordForm").reset();$("fReception").value=r?.reception||today();$("fCode").value=r?.code||"";$("fMaterial").value=r?.material||"";$("fSupplier").value=r?.supplier||"";$("fUnit").value=r?.unit||"";$("fArea").value=r?.area||"";$("fProgress").value=r?.progress??0;$("fStatus").value=r?.status||"Pendiente";$("fResponsible").value=r?.responsible||"";$("fDue").value=r?.due||"";$("fUpdated").value=r?.updated||today();$("fComment").value=r?.comment||"";$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden")}
function editRecord(id){openModal(records.find(r=>r.id===id))}
function deleteRecord(id){if(confirm("¿Eliminar este registro?")){records=records.filter(r=>r.id!==id);save()}}
$("recordForm").addEventListener("submit",e=>{e.preventDefault();const r={id:editingId||crypto.randomUUID(),reception:$("fReception").value,code:$("fCode").value.trim(),material:$("fMaterial").value.trim(),supplier:$("fSupplier").value.trim(),unit:$("fUnit").value.trim(),area:$("fArea").value.trim(),progress:+$("fProgress").value||0,status:$("fStatus").value,responsible:$("fResponsible").value.trim(),due:$("fDue").value,updated:$("fUpdated").value,comment:$("fComment").value.trim()};if(editingId)records=records.map(x=>x.id===editingId?r:x);else records.push(r);save();closeModal()});
$("newBtn").onclick=()=>openModal();$("closeModal").onclick=closeModal;$("cancelBtn").onclick=closeModal;
["search","statusFilter","areaFilter"].forEach(id=>$(id).addEventListener("input",render));
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");$("trackingView").classList.toggle("hidden",t.dataset.view!=="tracking");$("analysisView").classList.toggle("hidden",t.dataset.view!=="analysis")});
$("exportBtn").onclick=()=>{const data=records.map(({id,...r})=>r);const ws=XLSX.utils.json_to_sheet(data.length?data:[{Código:"",Material:"",Proveedor:"",Área:"",Responsable:"",Porcentaje:0,Estado:"Pendiente",Fecha_limite:"",Comentario:""}]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Control de Artes");XLSX.writeFile(wb,"control_artes_empaque.xlsx")};
$("importBtn").onclick=()=>$("fileInput").click();
$("fileInput").onchange=async e=>{const file=e.target.files[0];if(!file)return;const data=await file.arrayBuffer();const wb=XLSX.read(data,{type:"array",cellDates:true});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});const norm=k=>String(k).normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");records=rows.map(x=>{const m={};Object.entries(x).forEach(([k,v])=>m[norm(k)]=v);return{id:crypto.randomUUID(),reception:dateVal(m.fechaderecepcion||m.recepcion),code:String(m.codigodematerial||m.codigo||"").trim(),material:String(m.nombrematerial||m.material||m.nombre||"").trim(),supplier:String(m.proveedor||"").trim(),unit:String(m.unidad||"").trim(),area:String(m.area||m.etapa||"").trim(),progress:Number(m.porcentajecompletado??m.porcentaje??m.avance??0)||0,status:String(m.estado||"Pendiente"),responsible:String(m.responsable||"").trim(),due:dateVal(m.fechalimite||m.limite),updated:dateVal(m.fechadeactualizacion||m.actualizacion)||today(),comment:String(m.comentario||"").trim()}}).filter(r=>r.material||r.code);save();e.target.value=""};
function dateVal(v){if(!v)return"";if(v instanceof Date)return v.toISOString().slice(0,10);const s=String(v);if(/^\\d{4}-\\d{2}-\\d{2}/.test(s))return s.slice(0,10);const d=new Date(s);return isNaN(d)?"":d.toISOString().slice(0,10)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
render();
