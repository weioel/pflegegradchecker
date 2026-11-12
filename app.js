import { MODULES, QUESTIONS } from './data.js';
import { calculate, isAnswered } from './calculator.js';
import { guidePage, faqPage, sourcesPage, reformPage, privacyPage, imprintPage } from './content.js';
import { homePage } from './home.js';
import { benefitsPage, benefitsContent } from './benefits.js';
import { newReformState } from './reform-data.js';
import { reformComparisonPage, handleReformInput, handleReformClick } from './reform.js';
import { questionLabel, optionLabel } from './question-copy.js';
import { presentContent } from './presentation.js';
import { icon } from './ui.js';
import { resultPage } from './results.js';

const main=document.querySelector('main');
const state={answers:{},started:false,step:0,adult:null,duration:null,transition:null,benefitGrade:2,careSetting:'home'};
const reformState=newReformState();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moduleNames=['Mobilität','Verstehen & Sprechen','Verhalten & Psyche','Selbstversorgung','Krankheit & Therapie','Alltag & Kontakte'];
let route='';
let toastTimer;
let revealObserver;

function radio(name,value,label,description,selected,extra=''){
  return `<label class="option ${extra}"><input type="radio" name="${name}" value="${esc(value)}" ${selected?'checked':''}><span class="option-text"><span class="option-label">${esc(label)}</span>${description?`<span class="option-description">${esc(description)}</span>`:''}</span></label>`;
}
function introPage(){
  return `<div class="page check-intro route-enter"><header class="page-header"><h1>Ihr Pflegegrad-Selbstcheck.</h1><p class="lead">Für Sie selbst oder eine erwachsene Person, die Sie begleiten.</p></header>
  <form class="intro-form" id="intro-form"><fieldset><legend>Ist die Person mindestens 18 Jahre alt?</legend><div class="options age-options">${radio('adult','yes','Ja','',state.adult===true)}${radio('adult','no','Nein','',state.adult===false)}</div></fieldset><div id="child-warning" ${state.adult!==false?'hidden':''} class="note accent">Für Kinder berechnet dieser Selbstcheck keinen Pflegegrad. Ihre Pflegeversicherung kann Sie dazu beraten. <a href="https://www.medizinischerdienst.de/versicherte/pflegebegutachtung" target="_blank" rel="noopener noreferrer">Informationen zur Begutachtung ↗</a></div>
  <fieldset><legend>Wird die Hilfe voraussichtlich mindestens sechs Monate benötigt?</legend><div class="options">${radio('duration','yes','Ja','',state.duration==='yes')}${radio('duration','unknown','Noch unklar oder eher kürzer','',state.duration==='unknown')}</div></fieldset><div id="intro-error" class="form-error" role="alert"></div><button type="submit" class="button primary" id="start-button" ${state.adult===false?'disabled':''}>Selbstcheck starten ${icon('arrow')}</button></form>
  <p class="check-boundary">Der Selbstcheck ersetzt keine offizielle Begutachtung.</p><details class="intro-disclosure"><summary>Hinweise zum Ausfüllen</summary><div class="details-body"><p>Sie beantworten 64 Fragen in Ihrem Tempo. Wählen Sie bei Unsicherheit „Ich bin mir nicht sicher“; dann zeigt das Ergebnis einen möglichen Bereich.</p><p>Hilfsmittel allein bedeuten keine Unselbstständigkeit. Entscheidend ist die Hilfe einer anderen Person. Dazu zählen auch Erinnern, Anleiten und Beaufsichtigen.</p><p>Die Einschränkungen müssen voraussichtlich mindestens sechs Monate bestehen. Sie müssen mit dem Antrag keine sechs Monate warten. Besondere Bedarfskonstellationen, insbesondere die Gebrauchsunfähigkeit beider Arme und beider Beine, müssen fachlich geprüft werden.</p><p>Ihre Antworten bleiben im Arbeitsspeicher dieses Browsers. Beim Neuladen oder Schließen gehen sie verloren. Sie können das Ergebnis vorher als PDF herunterladen.</p><a href="#/datenschutz">Datenschutz</a> · <a href="#/quellen">Methodik und Grenzen</a></div></details></div>`;
}
function choiceOptions(q){
  const a=state.answers[q.id];const selected=q.type==='continence'?(a?.eligible===true?a.value:undefined):a;
  return q.options.map((o,i)=>{
    const id=`option-help-${q.id.replace('.','-')}-${i}`;
    return `<div class="answer-choice ${q.module===3?'frequency-choice':''}"><label class="option"><input type="radio" name="answer" value="${o.value}" aria-describedby="${id}" ${selected===o.value?'checked':''}><span class="option-text"><span class="option-label">${esc(optionLabel(q,o))}</span>${q.module===3?`<span class="option-description">${esc(o.description)}</span>`:''}</span></label><button type="button" class="option-help" data-help-toggle="${id}" aria-controls="${id}" aria-expanded="false" aria-label="${esc(o.label)}: Beispiel und Punkte erklären">${icon('info')}<span>${q.module===3?'Punkte':'Beispiel'}</span></button><div class="answer-explanation" id="${id}" hidden><p><strong class="official-option">${esc(o.label)}</strong>${q.module!==3?esc(o.description):''}<span class="answer-value">${o.value} ${o.value===1?'Einzelpunkt':'Einzelpunkte'}</span></p></div></div>`;
  }).join('');
}
function uncertain(q){return radio('answer','unknown','Ich bin mir nicht sicher','',state.answers[q.id]===null,'uncertain');}
function frequencyOptions(q){
  const a=state.answers[q.id];
  const units=q.type==='frequency'?[['day','pro Tag'],['week','pro Woche'],['month','pro Monat']]:[['week','pro Woche'],['month','pro Monat']];
  const period=units.find(([key])=>a?.[key]>0)?.[0]||units[0][0];
  const hasFrequency=a!=null&&!a.daily&&['day','week','month'].some(k=>a[k]>0);
  const isZero=a!=null&&!a.daily&&!['day','week','month'].some(k=>a[k]>0);
  return `<div class="options">${radio('answer','zero','Entfällt oder selbstständig','Keine personelle Hilfe für diese Maßnahme nötig.',isZero)}${q.type==='intensive'?radio('answer','daily','Täglich personelle Hilfe','Zeit- und technikintensive Maßnahme an jedem Tag.',a?.daily===true):''}${radio('answer','frequency','Hilfe ist regelmäßig notwendig','Geben Sie die Häufigkeit der Hilfe für diese Maßnahme an.',hasFrequency)}<div class="frequency-panel" id="frequency-panel" ${!hasFrequency?'hidden':''}><div class="frequency-inputs"><div><label for="frequency-count">Anzahl der Maßnahmen</label><input id="frequency-count" name="frequency-count" type="number" min="1" step="1" inputmode="numeric" value="${hasFrequency?esc(a[period]):''}" placeholder="z. B. 2" aria-describedby="frequency-help"></div><div><label for="frequency-period">Zeitraum</label><select id="frequency-period" name="frequency-period">${units.map(([key,label])=>`<option value="${key}" ${period===key?'selected':''}>${label}</option>`).join('')}</select></div></div><p id="frequency-help" class="field-help">Ganze Anzahl. Ein Zeitraum. Jede Maßnahme nur einmal.</p><details class="frequency-examples"><summary>Häufigkeit richtig angeben</summary><p>${q.type==='frequency'?'Beispiel: jeden zweiten Tag = 15 pro Monat. Verschiedene Häufigkeiten innerhalb eines Kriteriums zusammenfassen (2 täglich + 2 wöchentlich = 16 pro Woche). Wenn nötig, im selben Kriterium Woche × 4 in Monat umrechnen.':'Bei täglichen Besuchen die tatsächliche Zahl pro Woche angeben. Eine Begleitung muss wegen des Hilfebedarfs erforderlich sein.'}</p></details></div>${uncertain(q)}</div>`;
}
function continenceOptions(q){
  const a=state.answers[q.id];
  return `<p class="small-label">${esc(q.eligibilityQuestion)}</p><div class="options">${radio('eligible','no','Nein','Diese Voraussetzung ist nicht erfüllt; das Kriterium zählt mit 0 Punkten.',a?.eligible===false)}${radio('eligible','yes','Ja','Überwiegend/vollständig inkontinent oder eine künstliche Ableitung ist vorhanden.',a?.eligible===true)}${radio('eligible','unknown','Ich bin mir nicht sicher','Auch die Voraussetzung bleibt offen.',a===null)}</div><div class="contingent" id="continence-options" ${a?.eligible!==true?'hidden':''}><p class="small-label">Wie selbstständig gelingt der Umgang damit?</p><div class="options">${choiceOptions(q)}${radio('answer','unknown','Ich bin mir nicht sicher','Die Selbstständigkeit bleibt offen.',a?.eligible===true&&a.value===null,'uncertain')}</div></div>`;
}
function overviewMarkup(){
  return `<details class="answer-overview"><summary>Alle Fragen & Antworten ansehen</summary><div class="overview-grid">${MODULES.map(m=>`<div class="overview-group"><h3>${m.id}. ${esc(moduleNames[m.id-1])}</h3>${QUESTIONS.filter(q=>q.module===m.id).map(q=>`<button class="answer-link" data-question="${q.id}"><span>${esc(q.title)}</span><span>${isAnswered(q.id,state.answers[q.id])?'Bearbeiten':'Offen'}</span></button>`).join('')}</div>`).join('')}</div></details>`;
}
function questionPage(){
  const q=QUESTIONS[state.step],mod=MODULES.find(m=>m.id===q.module);
  const answered=QUESTIONS.filter(x=>isAnswered(x.id,state.answers[x.id])).length;
  const guard=q.module===3?'Häufigkeit der nötigen Unterstützung. Denselben Vorgang nur einmal zählen.':q.module===5?'Nur ärztlich angeordnete Maßnahmen mit personeller Hilfe, voraussichtlich mindestens sechs Monate.':'';
  return `<div class="page calculator-page route-enter"><div class="calc-topline"><span>Frage ${state.step+1} von ${QUESTIONS.length}</span><button class="text-link" data-action="result">Zwischenstand ${icon('diagonal')}</button></div><div class="progress-track" role="progressbar" aria-label="Beantwortete Fragen" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${answered}"><div class="progress-fill" style="width:${answered/QUESTIONS.length*100}%"></div></div>
  <div class="calc-layout">
  <section class="question-area" aria-labelledby="question-title">${state.transition?`<p class="module-milestone" role="status">${icon('check')} ${esc(state.transition)}</p>`:''}<div class="question-meta"><span>${esc(moduleNames[q.module-1])}</span></div><h1 id="question-title" tabindex="-1">${esc(questionLabel(q))}</h1>${guard?`<p class="question-guard">${guard}</p>`:''}
  <details class="question-context"><summary>${icon('info')} Was ist hier gemeint?</summary><div class="details-body"><p class="canonical-question">${esc(q.question)}</p><p id="question-help">${esc(q.help)}</p><p class="module-definition">${esc(mod.intro)}</p><p class="question-source">Kriterium ${q.id} · <a href="https://www.gesetze-im-internet.de/sgb_11/anlage_1.html" target="_blank" rel="noopener noreferrer">Anlage 1 zu § 15 SGB XI ↗</a> · <a href="#/quellen">Begutachtungs-Richtlinien 2026</a></p></div></details>
  <form id="question-form" novalidate><fieldset class="question-fieldset"><legend class="sr-only">Antwort auswählen</legend>${q.type==='continence'?continenceOptions(q):['frequency','intensive','visits'].includes(q.type)?frequencyOptions(q):`<div class="options">${choiceOptions(q)}${uncertain(q)}</div>`}</fieldset><p id="question-error" class="form-error" role="alert"></p><div class="question-actions"><button type="button" class="button secondary" data-action="back"><span aria-hidden="true">←</span> Zurück</button><button type="submit" class="button primary">${state.step===QUESTIONS.length-1?'Zum Ergebnis':'Weiter'} ${icon('arrow')}</button></div></form></section><aside class="calc-sidebar"><details class="module-picker"><summary>Bereich wechseln</summary><ol class="module-nav" aria-label="Module">${MODULES.map(m=>{const count=m.questions.filter(item=>isAnswered(item.id,state.answers[item.id])).length;return `<li><button data-module="${m.id}" ${q.module===m.id?'aria-current="step"':''} aria-label="Modul ${m.id}: ${esc(m.title)}; ${count} von ${m.questions.length} beantwortet"><span class="module-marker ${count===m.questions.length?'done':''}" aria-hidden="true">${count===m.questions.length?icon('check'):m.id}</span><span class="module-text">${esc(moduleNames[m.id-1])}<small>${count} / ${m.questions.length} beantwortet</small></span></button></li>`;}).join('')}</ol></details></aside></div>${overviewMarkup()}</div>`;
}
function render({focus=true}={}){
  const requested=location.hash.slice(1)||'/';
  if(requested.startsWith('guide-')||requested==='application-card'){
    if(route!=='/ratgeber'){main.innerHTML='<div class="page route-enter">'+presentContent('/ratgeber',guidePage())+'</div>';route='/ratgeber';document.title='Pflegegrad beantragen · Pflegegradchecker von Caro';}
    const target=document.getElementById(requested);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView();target?.querySelector('summary')?.focus({preventScroll:true});updateNavigation();return;
  }
  route=requested;
  if(route==='/ergebnis'&&(!state.started||state.adult!==true)){location.hash='/rechner';return;}
  let content,title;
  switch(route){
    case '/rechner':content=state.started?questionPage():introPage();title='Pflegegrad-Selbstcheck';break;
    case '/ergebnis':content=resultPage(state)+`<div class="container">${overviewMarkup()}</div>`;title='Ihre Auswertung';break;
    case '/leistungen':content=benefitsPage(state.benefitGrade,state.careSetting);title='Pflegeleistungen & Budgets';break;
    case '/ratgeber':content=guidePage();title='Pflegegrad beantragen';break;
    case '/faq':content=faqPage();title='Fragen & Antworten';break;
    case '/quellen':content=sourcesPage();title='Quellen & Methodik';break;
    case '/reform':content=reformComparisonPage(reformState);title='Pflegereform 2027 – interaktiver Vergleich';break;
    case '/reform-details':content='<a class="text-link" href="#/reform">← Zum interaktiven Vergleich</a>'+reformPage();title='Pflegereform 2027 – Hintergründe';break;
    case '/datenschutz':content=privacyPage();title='Datenschutz';break;
    case '/impressum':content=imprintPage();title='Impressum';break;
    default:content=homePage();title='Pflege verstehen. Klarheit gewinnen.';
  }
  main.innerHTML=['/ratgeber','/faq','/quellen','/reform-details','/datenschutz','/impressum'].includes(route)?'<div class="page route-enter">'+presentContent(route==='/reform-details'?'/reform':route,content)+'</div>':content;document.title=`${title} · Pflegegradchecker von Caro`;
  updateNavigation();
  revealObserver?.disconnect();
  if(window.IntersectionObserver&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){revealObserver=new window.IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.home-bento>.bento,.knowledge-grid>.bento,.application-path,.iges-panel').forEach(el=>{el.classList.add('reveal-on-scroll');revealObserver.observe(el);});}
  if(focus){window.scrollTo({top:0,behavior:'instant'});(document.querySelector('#question-title')||main).focus({preventScroll:true});}
}
function updateNavigation(){
  document.querySelectorAll('#main-nav a').forEach(a=>{if(a.hash===`#${route}`||(route==='/reform-details'&&a.hash==='#/reform')||(route==='/ergebnis'&&a.hash==='#/rechner'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const cta=document.querySelector('.nav-cta');cta.innerHTML=`${state.started?'Selbstcheck fortsetzen':'Zum Selbstcheck'} ${icon('arrow')}`;
  document.querySelector('#main-nav').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');document.querySelector('.menu-toggle').setAttribute('aria-label','Navigation öffnen');
}
function goQuestion(index,transition=null){state.transition=transition;state.step=Math.max(0,Math.min(QUESTIONS.length-1,index));if(route==='/rechner')render();else location.hash='/rechner';}
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
  if(event.target.id==='question-form'){event.preventDefault();if(!readQuestion({requireAnswer:true}))return;if(state.step===QUESTIONS.length-1)location.hash='/ergebnis';else {const old=QUESTIONS[state.step].module,next=QUESTIONS[state.step+1].module;const count=MODULES[old-1].questions.filter(q=>isAnswered(q.id,state.answers[q.id])).length;goQuestion(state.step+1,old!==next?`${moduleNames[old-1]}: ${count} von ${MODULES[old-1].questions.length} geklärt. Weiter mit Modul ${next}.`:null);}}
});
document.addEventListener('input',event=>handleReformInput(event,reformState));
document.addEventListener('change',event=>{
  if(event.target.name==='adult'){state.adult=event.target.value==='yes';document.querySelector('#child-warning').hidden=state.adult;document.querySelector('#start-button').disabled=!state.adult;document.querySelector('#intro-error').textContent='';}
  if(event.target.name==='duration')state.duration=event.target.value;
  if(event.target.closest('#question-form')){
    if(event.target.name==='answer'&&document.querySelector('#frequency-panel'))document.querySelector('#frequency-panel').hidden=event.target.value!=='frequency';
    if(event.target.name==='eligible')document.querySelector('#continence-options').hidden=event.target.value!=='yes';
    readQuestion();

    const count=QUESTIONS.filter(q=>isAnswered(q.id,state.answers[q.id])).length;const progress=document.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuenow',count);progress.firstElementChild.style.width=`${count/QUESTIONS.length*100}%`;document.querySelector('.calc-topline>span').textContent=`Frage ${state.step+1} von ${QUESTIONS.length}`;
  }
});
document.addEventListener('click',async event=>{
  if(handleReformClick(event,reformState))return;
  if(event.target.closest('a[href="#main"]')){event.preventDefault();main.focus();main.scrollIntoView();return;}
  const helpButton=event.target.closest('[data-help-toggle]');if(helpButton){const panel=document.getElementById(helpButton.dataset.helpToggle);panel.hidden=!panel.hidden;panel.dataset.manual=String(!panel.hidden);helpButton.setAttribute('aria-expanded',String(!panel.hidden));return;}
  const benefitLink=event.target.closest('[data-benefits-link]');if(benefitLink){state.benefitGrade=Number(benefitLink.dataset.benefitsLink);state.careSetting='home';}
  const gradeButton=event.target.closest('[data-benefit-grade]');if(gradeButton){state.benefitGrade=Number(gradeButton.dataset.benefitGrade);document.querySelectorAll('[data-benefit-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b===gradeButton)));document.querySelector('#benefit-content').innerHTML=benefitsContent(state.benefitGrade,state.careSetting);document.querySelector('#announcement').textContent=`Leistungen für Pflegegrad ${state.benefitGrade}, ${state.careSetting==='home'?'zu Hause':'im Pflegeheim'}.`;return;}
  const settingButton=event.target.closest('[data-care-setting]');if(settingButton){state.careSetting=settingButton.dataset.careSetting;document.querySelector('#benefit-content').innerHTML=benefitsContent(state.benefitGrade,state.careSetting);document.querySelector(`[data-care-setting="${state.careSetting}"]`).focus({preventScroll:true});document.querySelector('#announcement').textContent=`Leistungen für Pflegegrad ${state.benefitGrade}, ${state.careSetting==='home'?'zu Hause':'im Pflegeheim'}.`;return;}
  const filter=event.target.closest('[data-faq-filter]');if(filter){document.querySelectorAll('[data-faq-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));document.querySelectorAll('[data-faq-panel]').forEach(p=>p.hidden=p.dataset.faqPanel!==filter.dataset.faqFilter);return;}
  const sectionLink=event.target.closest('a[href^="#guide-"],a[href="#application-card"]');if(sectionLink&&location.hash===sectionLink.hash){event.preventDefault();const target=document.getElementById(sectionLink.hash.slice(1));if(target){target.open=true;target.scrollIntoView();target.querySelector('summary')?.focus({preventScroll:true});}return;}
  const moduleButton=event.target.closest('[data-module]');if(moduleButton){readQuestion();goQuestion(QUESTIONS.findIndex(q=>q.module===Number(moduleButton.dataset.module)));return;}
  const questionButton=event.target.closest('[data-question]');if(questionButton){readQuestion();goQuestion(QUESTIONS.findIndex(q=>q.id===questionButton.dataset.question));return;}
  const button=event.target.closest('[data-action]');if(!button)return;
  switch(button.dataset.action){
    case 'back':readQuestion();if(state.step===0){state.started=false;render();}else goQuestion(state.step-1);break;
    case 'result':readQuestion();location.hash='/ergebnis';break;
    case 'edit':goQuestion(0);break;
    case 'reset':document.querySelector('#reset-dialog').showModal();break;
    case 'cancel-reset':document.querySelector('#reset-dialog').close();break;
    case 'confirm-reset':state.answers={};state.started=false;state.step=0;state.adult=null;state.duration=null;state.transition=null;state.benefitGrade=2;state.careSetting='home';document.querySelector('#reset-dialog').close();if(route==='/rechner')render();else location.hash='/rechner';announce('Ihre Antworten wurden gelöscht.');break;
    case 'print':window.print();break;
    case 'download-application':{const blob=new Blob([document.querySelector('#application-template').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Pflegegrad-Antrag.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
    case 'pdf':try{const {exportResultPDF}=await import('./pdf.js');exportResultPDF(calculate(state.answers,{adult:true}),state.answers,{duration:state.duration});announce('Ihr PDF wurde lokal erstellt.');}catch(e){console.error(e);announce('Der PDF-Download konnte nicht erstellt werden. Bitte nutzen Sie die Druckfunktion.');}break;
    case 'copy-application':{const textarea=document.querySelector('#application-template');try{await navigator.clipboard.writeText(textarea.value);announce('Das Antragsmuster wurde kopiert.');}catch{textarea.focus();textarea.select();announce('Bitte kopieren Sie den markierten Text mit Strg+C oder ⌘C.');}break;}
  }
});
document.querySelector('.menu-toggle').addEventListener('click',()=>{const nav=document.querySelector('#main-nav'),open=nav.classList.toggle('open'),button=document.querySelector('.menu-toggle');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Navigation schließen':'Navigation öffnen');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.querySelector('#main-nav').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',()=>{readQuestion();render();});
render({focus:false});
