import { MODULES, QUESTIONS } from './data.js';
import { calculate, isAnswered } from './calculator.js';
import { guidePage, faqPage, sourcesPage, reformPage, privacyPage, imprintPage } from './content.js';
import { homePage } from './home.js';
import { resultPage } from './results.js';

const main=document.querySelector('main');
const state={answers:{},started:false,step:0,adult:null,duration:null};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moduleNames=['Mobilität','Verstehen & Sprechen','Verhalten & Psyche','Selbstversorgung','Krankheit & Therapie','Alltag & Kontakte'];
let route='';
let toastTimer;
let revealObserver;

function radio(name,value,label,description,selected,extra=''){
  return `<label class="option ${extra}"><input type="radio" name="${name}" value="${esc(value)}" ${selected?'checked':''}><span class="option-text"><span class="option-label">${esc(label)}</span>${description?`<span class="option-description">${esc(description)}</span>`:''}</span></label>`;
}
function introPage(){
  return `<div class="page route-enter"><div class="intro-layout"><div><p class="eyebrow"><span class="status-dot"></span> Der Pflegegrad-Selbstcheck</p><h1 style="margin-top:24px">Ein bisschen Zeit.<br>Mehr Orientierung.</h1><p class="lead">64 Fragen zu sechs Lebensbereichen. Antworten Sie so, wie der Alltag tatsächlich ist – auch wenn Sie den Check für jemand anderen ausfüllen.</p><div class="intro-meta"><span>Für Erwachsene</span><span>Ohne Anmeldung</span><span>100 % lokal</span></div><div class="note"><strong>Gut zu wissen</strong><p>Hilfsmittel allein bedeuten keine Unselbstständigkeit. Entscheidend ist, ob Hilfe durch eine andere Person nötig ist. Dazu zählen auch Erinnern, Anleiten und Beaufsichtigen.</p><p>Sie können zurückgehen und Antworten ändern. Bei Unsicherheit berechnen wir einen Bereich. Beim Neuladen der Seite werden Ihre Antworten gelöscht.</p></div><a class="text-link" href="#/quellen">Berechnungsgrundlagen ansehen ↗</a></div>
  <form class="intro-form" id="intro-form"><fieldset><legend>Ist die einzuschätzende Person mindestens 18 Jahre alt?</legend><div class="options">${radio('adult','yes','Ja, mindestens 18 Jahre','Dieser Rechner verwendet die Kriterien für Erwachsene.',state.adult===true)}${radio('adult','no','Nein, unter 18 Jahre','Für Kinder und Jugendliche gilt eine eigene Bewertung.',state.adult===false)}</div></fieldset><div id="child-warning" ${state.adult!==false?'hidden':''} class="note accent">Für Kinder berechnet dieser Selbstcheck keinen Pflegegrad. Wenden Sie sich an Ihre Pflegeversicherung oder eine Pflegeberatungsstelle. <a href="https://www.medizinischerdienst.de/versicherte/pflegebegutachtung" target="_blank" rel="noopener noreferrer">Informationen zur Begutachtung ↗</a></div>
  <fieldset><legend>Besteht der Hilfebedarf voraussichtlich mindestens sechs Monate?</legend><div class="options">${radio('duration','yes','Ja','Auch wenn die sechs Monate noch nicht vergangen sind.',state.duration==='yes')}${radio('duration','unknown','Noch unklar oder eher kürzer','Die Dauer ist eine zusätzliche gesetzliche Voraussetzung.',state.duration==='unknown')}</div></fieldset><p class="field-help">Besondere Bedarfskonstellationen – insbesondere die Gebrauchsunfähigkeit beider Arme und beider Beine – müssen fachlich geprüft werden. Der Check kann diese Ausnahme nicht feststellen.</p><div id="intro-error" class="form-error" role="alert"></div><button type="submit" class="button primary" id="start-button" ${state.adult===false?'disabled':''}>Selbstcheck beginnen <span aria-hidden="true">→</span></button><p class="field-help" style="margin-top:18px">Keine Namen. Keine Gesundheitsantworten auf einem Server. <a href="#/datenschutz">Datenschutzhinweise</a></p></form></div></div>`;
}
function choiceOptions(q){
  const a=state.answers[q.id];const selected=q.type==='continence'?(a?.eligible===true?a.value:undefined):a;
  return q.options.map(o=>`<label class="option"><input type="radio" name="answer" value="${o.value}" ${selected===o.value?'checked':''}><span class="option-text"><span class="option-label">${esc(o.label)}</span><span class="option-description">${esc(o.description)}</span></span><span class="option-points">${o.value} ${o.value===1?'Punkt':'Punkte'}</span></label>`).join('');
}
function uncertain(q){return radio('answer','unknown','Ich bin mir nicht sicher','Diese Angabe bleibt offen und wird als Punktebereich berücksichtigt.',state.answers[q.id]===null,'uncertain');}
function frequencyOptions(q){
  const a=state.answers[q.id];
  const units=q.type==='frequency'?[['day','pro Tag'],['week','pro Woche'],['month','pro Monat']]:[['week','pro Woche'],['month','pro Monat']];
  const period=units.find(([key])=>a?.[key]>0)?.[0]||units[0][0];
  const hasFrequency=a!=null&&!a.daily&&['day','week','month'].some(k=>a[k]>0);
  const isZero=a!=null&&!a.daily&&!['day','week','month'].some(k=>a[k]>0);
  return `<div class="options">${radio('answer','zero','Entfällt oder selbstständig','Keine personelle Hilfe für diese Maßnahme nötig.',isZero)}${q.type==='intensive'?radio('answer','daily','Täglich personelle Hilfe','Zeit- und technikintensive Maßnahme an jedem Tag.',a?.daily===true):''}${radio('answer','frequency','Hilfe ist regelmäßig notwendig','Geben Sie die Häufigkeit der Hilfe für diese Maßnahme an.',hasFrequency)}<div class="frequency-panel" id="frequency-panel" ${!hasFrequency?'hidden':''}><div class="frequency-inputs"><div><label for="frequency-count">Anzahl der Maßnahmen</label><input id="frequency-count" name="frequency-count" type="number" min="1" step="1" inputmode="numeric" value="${hasFrequency?esc(a[period]):''}" placeholder="z. B. 2" aria-describedby="frequency-help"></div><div><label for="frequency-period">Zeitraum</label><select id="frequency-period" name="frequency-period">${units.map(([key,label])=>`<option value="${key}" ${period===key?'selected':''}>${label}</option>`).join('')}</select></div></div><p id="frequency-help" class="field-help">Nur ganze Zahlen und einen Zeitraum verwenden. Jede Maßnahme einmal zählen. ${q.type==='frequency'?'Beispiel: jeden zweiten Tag = 15 pro Monat. Verschiedene Häufigkeiten innerhalb eines Kriteriums zusammenfassen (2 täglich + 2 wöchentlich = 16 pro Woche). Wenn nötig, im selben Kriterium Woche × 4 in Monat umrechnen.':'Bei täglichen Besuchen die tatsächliche Zahl pro Woche angeben. Eine Begleitung muss wegen des Hilfebedarfs erforderlich sein.'}</p></div>${uncertain(q)}</div>`;
}
function continenceOptions(q){
  const a=state.answers[q.id];
  return `<p class="small-label">${esc(q.eligibilityQuestion)}</p><div class="options">${radio('eligible','no','Nein','Diese Voraussetzung ist nicht erfüllt; das Kriterium zählt mit 0 Punkten.',a?.eligible===false)}${radio('eligible','yes','Ja','Überwiegend/vollständig inkontinent oder eine künstliche Ableitung ist vorhanden.',a?.eligible===true)}${radio('eligible','unknown','Ich bin mir nicht sicher','Auch die Voraussetzung bleibt offen.',a===null)}</div><div class="contingent" id="continence-options" ${a?.eligible!==true?'hidden':''}><p class="small-label">Wie selbstständig gelingt der Umgang damit?</p><div class="options">${choiceOptions(q)}${radio('answer','unknown','Ich bin mir nicht sicher','Die Selbstständigkeit bleibt offen.',a?.eligible===true&&a.value===null,'uncertain')}</div></div>`;
}
function overviewMarkup(){
  return `<details class="answer-overview"><summary>Alle Fragen & Antworten ansehen</summary><div class="overview-grid">${MODULES.map(m=>`<div class="overview-group"><h3>${m.id}. ${esc(moduleNames[m.id-1])}</h3>${QUESTIONS.filter(q=>q.module===m.id).map(q=>`<button class="answer-link" data-question="${q.id}"><span>${esc(q.title)}</span><span>${isAnswered(q.id,state.answers[q.id])?'Bearbeiten':'Offen'}</span></button>`).join('')}</div>`).join('')}</div></details>`;
}
function questionPage(){
  const q=QUESTIONS[state.step],mod=MODULES.find(m=>m.id===q.module),qs=QUESTIONS.filter(x=>x.module===q.module),within=qs.findIndex(x=>x.id===q.id)+1;
  const answered=QUESTIONS.filter(x=>isAnswered(x.id,state.answers[x.id])).length;
  return `<div class="page calculator-page route-enter"><div class="calc-topline"><span>Ihr Selbstcheck / ${answered} von ${QUESTIONS.length} beantwortet</span><button class="text-link" style="border:0;background:none;font-size:inherit" data-action="result">Zwischenstand ansehen ↗</button></div><div class="progress-track" role="progressbar" aria-label="Beantwortete Fragen" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${answered}"><div class="progress-fill" style="width:${answered/QUESTIONS.length*100}%"></div></div><div class="calc-layout"><aside class="calc-sidebar"><ol class="module-nav" aria-label="Module">${MODULES.map(m=>`<li><button data-module="${m.id}" ${q.module===m.id?'aria-current="step"':''} aria-label="Modul ${m.id}: ${esc(m.title)}"><span class="module-marker" aria-hidden="true">${m.id}</span><span class="module-text">${esc(moduleNames[m.id-1])}</span></button></li>`).join('')}</ol><p class="sidebar-note">Ihre Antworten bleiben in dieser Sitzung. Sie können jedes Modul jederzeit bearbeiten.</p><button class="sidebar-link" data-action="reset">Selbstcheck zurücksetzen</button></aside><section class="question-area" aria-labelledby="question-title"><div class="question-meta"><span>MODUL 0${q.module} / ${esc(moduleNames[q.module-1])}</span><span>Frage ${within} von ${qs.length}</span></div>${within===1?`<div class="module-intro"><strong>${esc(mod.title)} · ${mod.weight}% ${q.module===2||q.module===3?'gemeinsam':''}</strong>${esc(mod.intro)}</div>`:''}<h1 id="question-title" tabindex="-1">${esc(q.question)}</h1><p class="question-help" id="question-help">${esc(q.help)}</p><form id="question-form" novalidate><fieldset class="question-fieldset" aria-describedby="question-help"><legend>${q.type==='choice'?'Wählen Sie die passende Antwort.':'Angaben zu diesem Kriterium'}</legend>${q.type==='continence'?continenceOptions(q):['frequency','intensive','visits'].includes(q.type)?frequencyOptions(q):`<div class="options">${choiceOptions(q)}${uncertain(q)}</div>`}</fieldset><p id="question-error" class="form-error" role="alert"></p><div class="question-actions"><button type="button" class="button secondary" data-action="back"><span aria-hidden="true">←</span> Zurück</button><button type="submit" class="button primary">${state.step===QUESTIONS.length-1?'Zum Ergebnis':'Weiter'} <span aria-hidden="true">→</span></button></div></form><p class="question-source">Kriterium ${q.id} · <a href="https://www.gesetze-im-internet.de/sgb_11/anlage_1.html" target="_blank" rel="noopener noreferrer">Anlage 1 zu § 15 SGB XI ↗</a> · <a href="#/quellen">Begutachtungs-Richtlinien 2026</a><br>Die Beispiele erklären typische Situationen. Entscheidend ist der tatsächliche, regelmäßig notwendige Hilfebedarf.</p></section></div>${overviewMarkup()}</div>`;
}
function render({focus=true}={}){
  const requested=location.hash.slice(1)||'/';
  if(requested.startsWith('guide-')){if(route!=='/ratgeber'){main.innerHTML='<div class="page route-enter">'+guidePage()+'</div>';route='/ratgeber';document.title='Pflegegrad beantragen · Pflegekompass von Caro';}document.getElementById(requested)?.scrollIntoView();return;}
  route=requested;
  if(route==='/ergebnis'&&(!state.started||state.adult!==true)){location.hash='/rechner';return;}
  let content,title;
  switch(route){
    case '/rechner':content=state.started?questionPage():introPage();title='Pflegegrad-Selbstcheck';break;
    case '/ergebnis':content=resultPage(state)+`<div class="container">${overviewMarkup()}</div>`;title='Ihre Auswertung';break;
    case '/ratgeber':content=guidePage();title='Pflegegrad beantragen';break;
    case '/faq':content=faqPage();title='Fragen & Antworten';break;
    case '/quellen':content=sourcesPage();title='Quellen & Methodik';break;
    case '/reform':content=reformPage();title='Pflegereform 2027';break;
    case '/datenschutz':content=privacyPage();title='Datenschutz';break;
    case '/impressum':content=imprintPage();title='Impressum';break;
    default:content=homePage();title='Pflege verstehen. Klarheit gewinnen.';
  }
  main.innerHTML=['/ratgeber','/faq','/quellen','/reform','/datenschutz','/impressum'].includes(route)?'<div class="page route-enter">'+content+'</div>':content;document.title=`${title} · Pflegekompass von Caro`;
  document.querySelectorAll('#main-nav a').forEach(a=>{if(a.hash===location.hash)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.querySelector('#main-nav').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');
  revealObserver?.disconnect();
  if(window.IntersectionObserver&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){revealObserver=new window.IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section-heading,.editorial-row,.preview-step').forEach(el=>{el.classList.add('reveal-on-scroll');revealObserver.observe(el);});}
  if(focus){window.scrollTo({top:0,behavior:'instant'});(document.querySelector('#question-title')||main).focus({preventScroll:true});}
}
function goQuestion(index){state.step=Math.max(0,Math.min(QUESTIONS.length-1,index));if(route==='/rechner')render();else location.hash='/rechner';}
function announce(message){document.querySelector('#announcement').textContent=message;document.querySelector('.toast')?.remove();clearTimeout(toastTimer);const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.append(el);toastTimer=setTimeout(()=>el.remove(),4000);}
function readQuestion({requireAnswer=false}={}){
  const q=QUESTIONS[state.step],form=document.querySelector('#question-form');if(!form)return true;
  const data=new FormData(form),val=data.get('answer'),error=document.querySelector('#question-error');error.textContent='';
  const fail=msg=>{if(requireAnswer){error.textContent=msg;error.tabIndex=-1;error.focus();}return false;};
  if(q.type==='continence'){
    const eligible=data.get('eligible');
    if(eligible==='no'){state.answers[q.id]={eligible:false,value:0};return true;}
    if(eligible==='unknown'){state.answers[q.id]=null;return true;}
    if(eligible==='yes'&&val==='unknown'){state.answers[q.id]={eligible:true,value:null};return true;}
    if(eligible==='yes'&&val!==null){state.answers[q.id]={eligible:true,value:Number(val)};return true;}
    state.answers[q.id]=null;return fail('Bitte wählen Sie Antworten zur Voraussetzung und zur Selbstständigkeit oder „Ich bin mir nicht sicher“.');
  }
  if(val===null)return fail('Bitte wählen Sie eine Antwort oder „Ich bin mir nicht sicher“.');
  if(val==='unknown'){state.answers[q.id]=null;return true;}
  if(q.type==='choice'){state.answers[q.id]=Number(val);return true;}
  if(val==='zero'){state.answers[q.id]={day:0,week:0,month:0};return true;}
  if(val==='daily'){state.answers[q.id]={daily:true};return true;}
  const count=Number(data.get('frequency-count')),period=data.get('frequency-period');
  if(!Number.isSafeInteger(count)||count<1||count>100000){state.answers[q.id]=null;return fail('Bitte geben Sie eine ganze Zahl zwischen 1 und 100.000 ein. Bei unbekannter Häufigkeit wählen Sie „Ich bin mir nicht sicher“.');}
  state.answers[q.id]={day:0,week:0,month:0,[period]:count};return true;
}
document.addEventListener('submit',event=>{
  if(event.target.id==='intro-form'){
    event.preventDefault();const data=new FormData(event.target),error=document.querySelector('#intro-error');
    if(data.get('adult')!=='yes'){error.textContent=data.get('adult')==='no'?'Für Personen unter 18 Jahren ist hier keine Berechnung möglich.':'Bitte bestätigen Sie zunächst, dass die Person mindestens 18 Jahre alt ist.';return;}
    if(!data.get('duration')){error.textContent='Bitte schätzen Sie die voraussichtliche Dauer ein oder wählen Sie „Noch unklar oder eher kürzer“.';return;}
    state.adult=true;state.duration=data.get('duration');state.started=true;state.step=0;render();
  }
  if(event.target.id==='question-form'){event.preventDefault();if(!readQuestion({requireAnswer:true}))return;if(state.step===QUESTIONS.length-1)location.hash='/ergebnis';else goQuestion(state.step+1);}
});
document.addEventListener('change',event=>{
  if(event.target.name==='adult'){state.adult=event.target.value==='yes';document.querySelector('#child-warning').hidden=state.adult;document.querySelector('#start-button').disabled=!state.adult;document.querySelector('#intro-error').textContent='';}
  if(event.target.name==='duration')state.duration=event.target.value;
  if(event.target.closest('#question-form')){
    if(event.target.name==='answer'&&document.querySelector('#frequency-panel'))document.querySelector('#frequency-panel').hidden=event.target.value!=='frequency';
    if(event.target.name==='eligible')document.querySelector('#continence-options').hidden=event.target.value!=='yes';
    readQuestion();const count=QUESTIONS.filter(q=>isAnswered(q.id,state.answers[q.id])).length;const progress=document.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuenow',count);progress.firstElementChild.style.width=`${count/QUESTIONS.length*100}%`;document.querySelector('.calc-topline>span').textContent=`Ihr Selbstcheck / ${count} von ${QUESTIONS.length} beantwortet`;
  }
});
document.addEventListener('click',async event=>{
  if(event.target.closest('a[href="#main"]')){event.preventDefault();main.focus();main.scrollIntoView();return;}
  const moduleButton=event.target.closest('[data-module]');if(moduleButton){readQuestion();goQuestion(QUESTIONS.findIndex(q=>q.module===Number(moduleButton.dataset.module)));return;}
  const questionButton=event.target.closest('[data-question]');if(questionButton){readQuestion();goQuestion(QUESTIONS.findIndex(q=>q.id===questionButton.dataset.question));return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  switch(button.dataset.action){
    case 'back':readQuestion();if(state.step===0){state.started=false;render();}else goQuestion(state.step-1);break;
    case 'result':readQuestion();location.hash='/ergebnis';break;
    case 'edit':goQuestion(0);break;
    case 'reset':document.querySelector('#reset-dialog').showModal();break;
    case 'cancel-reset':document.querySelector('#reset-dialog').close();break;
    case 'confirm-reset':state.answers={};state.started=false;state.step=0;state.adult=null;state.duration=null;document.querySelector('#reset-dialog').close();if(route==='/rechner')render();else location.hash='/rechner';announce('Ihre Antworten wurden gelöscht.');break;
    case 'print':window.print();break;
    case 'pdf':try{const {exportResultPDF}=await import('./pdf.js');exportResultPDF(calculate(state.answers,{adult:true}),state.answers,{duration:state.duration});announce('Ihr PDF wurde lokal erstellt.');}catch(e){console.error(e);announce('Der PDF-Download konnte nicht erstellt werden. Bitte nutzen Sie die Druckfunktion.');}break;
    case 'copy-application':{const textarea=document.querySelector('#application-template');try{await navigator.clipboard.writeText(textarea.value);announce('Das Antragsmuster wurde kopiert.');}catch{textarea.focus();textarea.select();announce('Bitte kopieren Sie den markierten Text mit Strg+C oder ⌘C.');}break;}
  }
});
document.querySelector('.menu-toggle').addEventListener('click',()=>{const nav=document.querySelector('#main-nav'),open=nav.classList.toggle('open'),button=document.querySelector('.menu-toggle');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Navigation schließen':'Navigation öffnen');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelector('#main-nav').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',()=>{readQuestion();render();});
render({focus:false});
