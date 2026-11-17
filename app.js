const STORAGE_KEY="insight-flyer-marketing-lab-v1";
const totalSteps=5; let currentStep=1;
const state={
  contextFindings:["","",""],
  goals:["","",""],
  barriers:["","",""],
  motivations:["","",""],
  decision:["","",""],
  proofs:["","",""]
};

const ids=[
"projectName","apparentOffer","contextSummary","businessObjective","marketingObjective",
"personaName","personaContext","channels","personaQuote",
"whatBuys","whatReallySeeks","whatWants","whatStops","triggerMoment","finalInsight",
"think","emotion","emotionCustom","doAction","mainPromise","centralMessage",
"route1Name","route1Headline","route1Visual","route1Cta",
"route2Name","route2Headline","route2Visual","route2Cta",
"route3Name","route3Headline","route3Visual","route3Cta","selectedRouteReason"
];
function el(id){return document.getElementById(id)}
const steps=[...document.querySelectorAll(".step")];

function renderDots(){
  const w=el("stepDots");w.innerHTML="";
  for(let i=1;i<=totalSteps;i++){const d=document.createElement("span");d.className="step-dot"+(i<currentStep?" done":i===currentStep?" current":"");w.appendChild(d)}
}
function updateStep(){
  steps.forEach(s=>s.classList.toggle("active",Number(s.dataset.step)===currentStep));
  el("prevBtn").disabled=currentStep===1;
  el("nextBtn").style.display=currentStep===totalSteps?"none":"";
  const pct=Math.round(currentStep/totalSteps*100);
  el("progressBar").style.width=pct+"%";el("progressPct").textContent=pct+"%";el("stepLabel").textContent=`Paso ${currentStep} de ${totalSteps}`;
  renderDots();window.scrollTo({top:0,behavior:"smooth"});
}
function markInvalid(node,msg){node.classList.add("invalid");let n=node.parentElement.querySelector(".error-note");if(!n){n=document.createElement("div");n.className="error-note";node.parentElement.appendChild(n)}n.textContent=msg}
function clearErrors(){document.querySelectorAll(".invalid").forEach(n=>n.classList.remove("invalid"));document.querySelectorAll(".error-note").forEach(n=>n.remove())}
function listFilled(a){return a.filter(v=>(v||"").trim())}

function validate(step){
  clearErrors(); syncRepeats();
  if(step===1){
    if(!el("contextSummary").value.trim()){markInvalid(el("contextSummary"),"Resume el contexto.");return false}
    if(!el("businessObjective").value.trim()){markInvalid(el("businessObjective"),"Define el objetivo del negocio.");return false}
    if(!el("marketingObjective").value.trim()){markInvalid(el("marketingObjective"),"Define el objetivo de marketing.");return false}
  }
  if(step===2){
    if(!el("personaName").value.trim()){markInvalid(el("personaName"),"Identifica brevemente al Buyer Persona.");return false}
    if(listFilled(state.barriers).length<2){markInvalid(document.querySelector('[data-kind="barriers"]'),"Incluye al menos 2 barreras.");return false}
    if(listFilled(state.motivations).length<2){markInvalid(document.querySelector('[data-kind="motivations"]'),"Incluye al menos 2 motivaciones.");return false}
  }
  if(step===3){
    if(!el("whatReallySeeks").value.trim()){markInvalid(el("whatReallySeeks"),"Define qué podría estar buscando realmente.");return false}
    if(!el("whatStops").value.trim()){markInvalid(el("whatStops"),"Define la principal tensión o barrera.");return false}
    if(!el("finalInsight").value.trim()){buildInsight(); if(!el("finalInsight").value.trim()){markInvalid(el("finalInsight"),"Construye o escribe una hipótesis de insight.");return false}}
  }
  if(step===4){
    if(!el("think").value.trim()){markInvalid(el("think"),"Define qué debe pensar.");return false}
    if(!(el("emotion").value||el("emotionCustom").value.trim())){markInvalid(el("emotionCustom"),"Elige o escribe una emoción.");return false}
    if(!el("doAction").value.trim()){markInvalid(el("doAction"),"Define qué debe hacer.");return false}
    if(!el("centralMessage").value.trim()){markInvalid(el("centralMessage"),"Escribe un mensaje central.");return false}
  }
  return true;
}
el("prevBtn").onclick=()=>{if(currentStep>1){currentStep--;updateStep()}};
el("nextBtn").onclick=()=>{if(validate(currentStep)&&currentStep<totalSteps){currentStep++;save();updateStep()}};

const defs=[
 ["contextFindings","contextFindingsList","Hallazgo contextual"],
 ["goals","goalsList","Qué busca / necesita lograr"],
 ["barriers","barriersList","Barrera o fricción"],
 ["motivations","motivationsList","Motivación"],
 ["decision","decisionList","Criterio o comportamiento"],
 ["proofs","proofsList","Razón para creer / beneficio real"]
];
function renderRepeats(){
  defs.forEach(([key,id,ph])=>{
    const wrap=el(id);wrap.innerHTML="";
    state[key].forEach((v,i)=>{
      const row=document.createElement("div");row.className="repeat-row";
      const input=document.createElement("input");input.value=v||"";input.placeholder=ph;input.dataset.kind=key;input.dataset.index=i;
      input.addEventListener("input",()=>{state[key][i]=input.value;save()});
      row.appendChild(input);wrap.appendChild(row);
    })
  })
}
function syncRepeats(){document.querySelectorAll("[data-kind]").forEach(i=>state[i.dataset.kind][Number(i.dataset.index)]=i.value)}

function collect(){
  const fields={};ids.forEach(id=>fields[id]=el(id).value);
  return {currentStep,fields,...state}
}
function save(){
  syncRepeats();localStorage.setItem(STORAGE_KEY,JSON.stringify(collect()));
  el("saveStatus").textContent="Guardado";clearTimeout(save.t);save.t=setTimeout(()=>el("saveStatus").textContent="Guardado automático",900)
}
function load(){
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
  try{
    const p=JSON.parse(raw);currentStep=Math.min(Math.max(Number(p.currentStep)||1,1),5);
    if(p.fields)Object.entries(p.fields).forEach(([id,v])=>{if(el(id))el(id).value=v||""});
    defs.forEach(([key])=>{if(Array.isArray(p[key])&&p[key].length)state[key]=p[key]})
  }catch(e){}
}
document.getElementById("insightForm").addEventListener("input",save);
document.getElementById("insightForm").addEventListener("change",save);

function clean(s){return (s||"").trim().replace(/\s+/g," ")}
function buildInsight(){
  const persona=clean(el("personaName").value)||"Esta persona";
  const seeks=clean(el("whatReallySeeks").value)||clean(el("whatWants").value);
  const stops=clean(el("whatStops").value);
  const trigger=clean(el("triggerMoment").value)||clean(el("personaContext").value);
  if(!seeks||!stops)return;
  let insight=`${persona} no busca solamente ${clean(el("whatBuys").value)||clean(el("apparentOffer").value)||"lo que ofrecemos"}; busca ${seeks}, pero ${stops}`;
  if(trigger) insight+=`. Esto se vuelve especialmente relevante cuando ${trigger.charAt(0).toLowerCase()+trigger.slice(1)}`;
  insight+=".";
  el("generatedInsight").textContent=insight;
  el("finalInsight").value=insight;save()
}
el("buildInsightBtn").onclick=buildInsight;

function getEmotion(){return clean(el("emotionCustom").value)||el("emotion").value||"emoción"}
function generateIdeas(){
  const emotion=getEmotion();
  const project=clean(el("projectName").value)||"la propuesta";
  const promise=clean(el("mainPromise").value)||clean(el("whatReallySeeks").value)||"una experiencia que valga la pena";
  const message=clean(el("centralMessage").value)||promise;
  const barrier=clean(el("whatStops").value)||"su principal barrera";
  const persona=clean(el("personaName").value)||"tu público";
  const proofs=listFilled(state.proofs);
  const proof=proofs[0]||"un beneficio concreto";
  const action=clean(el("doAction").value)||"dar el siguiente paso";

  const routes=[
    {
      name:`Ruta emocional · ${emotion}`,
      headline: message,
      visual:`Diseño centrado en la sensación de ${emotion.toLowerCase()}. Mostrar una escena o símbolo que represente ${promise.toLowerCase()} y haga que ${persona} se vea dentro de la experiencia.`,
      cta:`${action.charAt(0).toUpperCase()+action.slice(1)} ahora.`
    },
    {
      name:"Ruta beneficio · Quitar la barrera",
      headline:`${promise}. Sin que ${barrier.toLowerCase()} te detenga.`,
      visual:`Jerarquizar el beneficio real y demostrarlo con elementos concretos como “${proof}”. El flyer debe resolver la objeción antes de pedir la acción.`,
      cta:`Descubre por qué ${project} sí vale la pena.`
    },
    {
      name:"Ruta identidad · Esto es para ti",
      headline:`${persona}: esto fue pensado para ti.`,
      visual:`Usar códigos visuales, lenguaje y referencias que el perfil reconozca como propios. El objetivo es generar pertenencia y la sensación de “esto habla de mi situación”.`,
      cta:`Hazlo parte de tu experiencia.`
    }
  ];
  routes.forEach((r,i)=>{
    el(`route${i+1}Name`).value=r.name;
    el(`route${i+1}Headline`).value=r.headline;
    el(`route${i+1}Visual`).value=r.visual;
    el(`route${i+1}Cta`).value=r.cta;
  });
  save()
}
el("generateIdeasBtn").onclick=generateIdeas;

el("exampleBtn").onclick=()=>{
  if(!confirm("¿Cargar el ejemplo Reset Night? Reemplazará la información actual."))return;
  const ex={
    projectName:"Reset Night",
    apparentOffer:"Una fiesta universitaria de fin de semestre",
    contextSummary:"Cierre de semestre con exámenes, entregas, cansancio, presupuesto limitado y muchas alternativas de entretenimiento en diciembre.",
    businessObjective:"Vender al menos 280 accesos.",
    marketingObjective:"Lograr que Reset Night sea percibida como una recompensa relevante para cerrar el semestre y motivar la compra anticipada.",
    personaName:"Carlos, universitario de 21 años",
    personaContext:"Está en finales, cansado, con poco dinero disponible y decide muchas salidas en función de su grupo.",
    channels:"Instagram, TikTok, WhatsApp y recomendaciones de amigos",
    personaQuote:"Quiero desconectarme y celebrar, pero necesito sentir que la salida realmente vale mi tiempo y dinero.",
    whatBuys:"Una entrada para una fiesta universitaria",
    whatReallySeeks:"una recompensa, liberarse del estrés y cerrar el semestre con sus amigos",
    whatWants:"pasarla bien, sentirse libre y crear un recuerdo con su grupo",
    whatStops:"tiene poco presupuesto, duda si el evento valdrá la pena y tiene otros planes posibles",
    triggerMoment:"termina exámenes y entregas después de varias semanas de presión",
    think:"Esto sí es para nosotros y sí vale lo que cuesta.",
    emotion:"Recompensa",
    emotionCustom:"",
    doAction:"Comprar su acceso y armar el plan con sus amigos",
    mainPromise:"Celebrar el cierre del semestre sin gastar de más.",
    centralMessage:"Sobreviviste al semestre. Ahora celébralo sin gastar de más.",
    selectedRouteReason:"Elegiría la ruta emocional porque conecta directamente con el momento de cierre, recompensa y alivio del Buyer Persona."
  };
  Object.entries(ex).forEach(([id,v])=>{if(el(id))el(id).value=v});
  state.contextFindings=["Necesidad de desconexión y recompensa","La decisión se vive en grupo","El presupuesto y la competencia con otros planes importan"];
  state.goals=["Cerrar el semestre con una experiencia memorable","Pasarla bien con sus amigos","Desconectarse del estrés"];
  state.barriers=["Presupuesto limitado","Temor a que sea una fiesta más","Dudas sobre si realmente valdrá la pena"];
  state.motivations=["Celebrar que terminó el semestre","Convivir con su grupo","Sentirse libre por una noche"];
  state.decision=["Pregunta quién más irá","Compara precio y beneficios","Revisa redes antes de decidir"];
  state.proofs=["Se permiten hieleras y bebidas","Tragos gratis de 9 a 10 p. m.","Beneficio de cortesía por kardex limpio"];
  currentStep=1;renderRepeats();buildInsight();generateIdeas();save();updateStep()
};
el("resetBtn").onclick=()=>{if(confirm("¿Borrar toda la actividad?")){localStorage.removeItem(STORAGE_KEY);location.reload()}};

function addWrappedText(doc,text,x,y,width,lineHeight=5,fontSize=9.5){
  doc.setFontSize(fontSize);const lines=doc.splitTextToSize(text||"—",width);doc.text(lines,x,y);return y+lines.length*lineHeight
}
function ensure(doc,y,need=25){if(y+need>282){doc.addPage();return 20}return y}
function section(doc,title,y){y=ensure(doc,y,18);doc.setFillColor(240,232,255);doc.roundedRect(15,y-5,180,10,3,3,"F");doc.setTextColor(89,35,145);doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text(title,20,y+1.5);doc.setTextColor(20,22,42);return y+13}
function bullets(doc,arr,x,y,w){
  doc.setFont("helvetica","normal");doc.setTextColor(20,22,42);
  (listFilled(arr).length?listFilled(arr):["—"]).forEach(v=>{y=ensure(doc,y,10);y=addWrappedText(doc,"• "+v,x,y,w,4.8,9.2)+1});return y
}
el("downloadPdfBtn").onclick=()=>{
  syncRepeats();save();const status=el("pdfStatus");
  if(!window.jspdf||!window.jspdf.jsPDF){status.textContent="No se pudo cargar el generador. Usa Imprimir → Guardar como PDF.";window.print();return}
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});let y=20;
  doc.setFillColor(109,40,217);doc.rect(0,0,210,36,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(19);doc.text("Insight creativo para flyer",15,16);
  doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text(el("projectName").value||"Marketing Lab",15,24);y=48;

  y=section(doc,"1. Contexto y objetivo",y);
  doc.setFont("helvetica","bold");doc.setFontSize(9.5);doc.text("Oferta aparente",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el("apparentOffer").value,20,y,170)+4;
  doc.setFont("helvetica","bold");doc.text("Contexto",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el("contextSummary").value,20,y,170)+4;
  doc.setFont("helvetica","bold");doc.text("Objetivo del negocio",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el("businessObjective").value,20,y,170)+4;
  doc.setFont("helvetica","bold");doc.text("Objetivo de marketing",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el("marketingObjective").value,20,y,170)+4;
  doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text("Hallazgos clave",20,y);y+=5;doc.setTextColor(20,22,42);y=bullets(doc,state.contextFindings,22,y,168)+5;

  y=section(doc,"2. Buyer Persona",y);
  doc.setFont("helvetica","bold");doc.text(el("personaName").value||"Buyer Persona",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el("personaContext").value,20,y,170)+5;
  doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text("Motivaciones",20,y);y+=5;doc.setTextColor(20,22,42);y=bullets(doc,state.motivations,22,y,168)+3;
  y=ensure(doc,y,20);doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text("Barreras",20,y);y+=5;doc.setTextColor(20,22,42);y=bullets(doc,state.barriers,22,y,168)+5;

  y=section(doc,"3. Hipótesis de insight",y);
  doc.setFont("helvetica","italic");doc.setFontSize(11);y=addWrappedText(doc,el("finalInsight").value,20,y,170,5.3,11)+6;

  y=section(doc,"4. Mensaje y emoción",y);
  const emotion=getEmotion();
  const blocks=[["PIENSE",el("think").value],["SIENTA",emotion],["HAGA",el("doAction").value],["Promesa",el("mainPromise").value],["Mensaje central",el("centralMessage").value]];
  blocks.forEach(([t,v])=>{y=ensure(doc,y,14);doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text(t,20,y);y+=5;doc.setFont("helvetica","normal");doc.setTextColor(20,22,42);y=addWrappedText(doc,v,20,y,170)+3});
  doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text("Razones para creer",20,y);y+=5;doc.setTextColor(20,22,42);y=bullets(doc,state.proofs,22,y,168)+5;

  y=section(doc,"5. Rutas creativas",y);
  for(let i=1;i<=3;i++){
    y=ensure(doc,y,40);doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.setFontSize(11);doc.text(`Ruta ${i}: ${el(`route${i}Name`).value||"—"}`,20,y);y+=6;
    doc.setFont("helvetica","bold");doc.setTextColor(20,22,42);doc.setFontSize(9.5);doc.text("Gancho",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el(`route${i}Headline`).value,20,y,170)+3;
    doc.setFont("helvetica","bold");doc.text("Dirección visual",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el(`route${i}Visual`).value,20,y,170)+3;
    doc.setFont("helvetica","bold");doc.text("CTA",20,y);y+=5;doc.setFont("helvetica","normal");y=addWrappedText(doc,el(`route${i}Cta`).value,20,y,170)+6;
  }
  y=ensure(doc,y,25);doc.setFont("helvetica","bold");doc.setTextColor(89,35,145);doc.text("Ruta elegida / justificación",20,y);y+=5;doc.setFont("helvetica","normal");doc.setTextColor(20,22,42);y=addWrappedText(doc,el("selectedRouteReason").value,20,y,170);

  const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(130,130,145);doc.text(`Marketing Lab · Página ${i} de ${pages}`,15,290)}
  const safe=(el("projectName").value||"insight-flyer").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-_]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase();
  doc.save(`${safe||"insight-flyer"}-brief.pdf`);status.textContent="PDF generado correctamente."
};

load();renderRepeats();updateStep();
