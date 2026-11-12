import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { QUESTIONS } from '../dist/data.js';
import { questionLabel,optionLabel } from '../dist/question-copy.js';

const html=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,8));
let generation=0;
async function setup(hash='/'){
  const dom=new JSDOM(html,{url:`http://localhost/#${hash}`,pretendToBeVisual:true,runScripts:'outside-only'});
  for(const key of ['window','document','location','navigator','FormData'])Object.defineProperty(globalThis,key,{value:key==='window'?dom.window:dom.window[key],configurable:true,writable:true});
  dom.window.scrollTo=()=>{};dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
  await import(`../dist/app.js?test=${++generation}`);
  return dom;
}
function choose(name,value){const input=document.querySelector(`input[name="${name}"][value="${value}"]`);assert.ok(input,`${name}=${value} exists`);input.checked=true;input.dispatchEvent(new window.Event('change',{bubbles:true}));}
function click(selector){const element=document.querySelector(selector);assert.ok(element,selector);element.click();}
function submit(id){document.getElementById(id).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));}
async function start(){choose('adult','yes');choose('duration','yes');submit('intro-form');await tick();}
async function navigate(hash){location.hash=hash;await tick();}

test('All content routes render, guide section links preserve guide, skip link preserves route',async()=>{
  const dom=await setup();
  for(const route of ['/','/ratgeber','/faq','/quellen','/reform','/reform-details','/datenschutz','/impressum','/leistungen','/rechner']){
    await navigate(route);assert.ok(document.querySelector('main h1'),route);assert.equal(document.querySelectorAll('main h1').length,1);
    assert.equal(new Set([...document.querySelectorAll('[id]')].map(el=>el.id)).size,document.querySelectorAll('[id]').length,`unique IDs ${route}`);
    click('.skip-link');assert.equal(location.hash,`#${route}`);
  }
  await navigate('/ratgeber');click('a[href="#guide-apply"]');await tick();assert.ok(document.querySelector('#guide-apply'));assert.match(document.querySelector('h1').textContent,/Pflegegrad beantragen/);
  dom.window.close();
});

test('Adult and duration are mandatory; children cannot start or see adult result',async()=>{
  const dom=await setup('/rechner');submit('intro-form');assert.match(document.querySelector('#intro-error').textContent,/mindestens 18/);
  choose('adult','no');assert.equal(document.querySelector('#start-button').disabled,true);assert.equal(document.querySelector('#child-warning').hidden,false);
  await navigate('/ergebnis');await tick();assert.ok(document.querySelector('#intro-form'));
  choose('adult','yes');submit('intro-form');assert.match(document.querySelector('#intro-error').textContent,/Dauer/);
  dom.window.close();
});

test('64-question end-to-end independent case; result, editing, previous answers and reset',async()=>{
  const dom=await setup('/rechner');await start();
  submit('question-form');assert.match(document.querySelector('#question-error').textContent,/Bitte wählen/);
  for(const q of QUESTIONS){
    assert.ok(document.querySelector('#question-title').textContent===questionLabel(q),q.id);
    if(q.type==='choice')choose('answer','0');else if(q.type==='continence')choose('eligible','no');else choose('answer','zero');
    submit('question-form');await tick();
  }
  assert.equal(location.hash,'#/ergebnis');assert.equal(document.querySelector('.result-number').textContent,'0');assert.equal(document.querySelector('.result-grade').textContent,'Kein Pflegegrad');assert.match(document.querySelector('.result-status').textContent,/64 von 64/);
  click('[data-question="4.8"]');await tick();choose('answer','9');click('[data-action="result"]');await tick();
  assert.equal(document.querySelector('.result-number').textContent,'20');assert.equal(document.querySelector('.result-grade').textContent,'Pflegegrad 1');
  click('[data-question="4.11"]');await tick();choose('eligible','yes');assert.equal(document.querySelector('input[name="answer"]:checked'),null,'No implicit 0 for newly applicable continence');choose('answer','unknown');click('[data-action="result"]');await tick();
  assert.match(document.querySelector('.result-status').textContent,/1 Kriterien noch offen/);
  click('[data-action="reset"]');assert.equal(document.querySelector('dialog').open,true);click('[data-action="confirm-reset"]');await tick();
  assert.ok(document.querySelector('#intro-form'));assert.equal(document.querySelector('input[name="adult"]:checked'),null);dom.window.close();
});

test('Uncertain responses remain open; module5 validates whole frequencies, preserves selection and intermediate calculation',async()=>{
  const dom=await setup('/rechner');await start();choose('answer','unknown');submit('question-form');click('[data-module="5"]');
  choose('answer','frequency');const number=document.querySelector('#frequency-count');number.value='1.5';submit('question-form');assert.match(document.querySelector('#question-error').textContent,/ganze Zahl/);
  number.value='3';number.dispatchEvent(new window.Event('change',{bubbles:true}));submit('question-form');click('[data-action="back"]');assert.equal(document.querySelector('#frequency-count').value,'3');assert.equal(document.querySelector('#frequency-panel').hidden,false);
  click('[data-action="result"]');await tick();assert.equal(document.querySelector('.result-number').textContent,'5–100');assert.match(document.querySelector('.note.accent').textContent,/Unvollständige Angaben/);assert.match(document.querySelector('.result-status').textContent,/63 Kriterien/);
  dom.window.close();
});

test('Structural accessibility checks on landing, questionnaire, results and guide',async()=>{
  const dom=await setup();dom.window.eval(axe.source);
  const check=async label=>{
    const results=await dom.window.axe.run(dom.window.document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']},rules:{'color-contrast':{enabled:false}}});
    assert.equal(results.violations.length,0,label+': '+JSON.stringify(results.violations.map(x=>({id:x.id,targets:x.nodes.map(n=>n.target)}))));
  };
  await check('Landing');await navigate('/rechner');await check('Introduction');await start();await check('Question');click('[data-action="result"]');await tick();await check('Incomplete result');await navigate('/ratgeber');await check('Guide');await navigate('/leistungen');await check('Benefits at home');click('[data-care-setting="residential"]');await check('Residential benefits');await navigate('/reform');await check('Reform comparison');click('[data-weight-module="2"]');await check('Shared weight detail');dom.window.close();
});

test('Redesign: care-grade selector and FAQ topics expose all content without changing the calculation',async()=>{
  const dom=await setup('/leistungen');
  for(const [grade,expected] of [[1,'12,5 bis unter 27'],[2,'27 bis unter 47,5'],[3,'47,5 bis unter 70'],[4,'70 bis unter 90'],[5,'90 bis 100']]){
    click(`[data-benefit-grade="${grade}"]`);assert.equal(document.querySelectorAll('[data-benefit-grade][aria-pressed="true"]').length,1);assert.ok(document.querySelector('#grade-display').textContent.includes(expected));
  }
  await navigate('/faq');assert.equal(document.querySelectorAll('[data-faq-panel] details').length,15);
  for(const filter of ['grundlagen','rechner','weiteres']){click(`[data-faq-filter="${filter}"]`);assert.equal(document.querySelectorAll('[data-faq-panel]:not([hidden])').length,1);assert.equal(document.querySelector('[data-faq-panel]:not([hidden])').dataset.faqPanel,filter);}
  dom.window.close();
});

test('Redesign: each guide deep link opens its step; the application template stays copyable',async()=>{
  const dom=await setup();
  for(const id of ['guide-check','guide-apply','guide-prepare','guide-decision','guide-objection','application-card']){
    await navigate(id);assert.equal(document.getElementById(id).open,true,id);assert.ok(document.querySelector('.step-timeline'));assert.match(document.title,/Pflegegrad beantragen/);
  }
  const textarea=document.querySelector('#application-template');assert.ok(textarea.readOnly);assert.match(textarea.value,/hiermit beantrage ich Leistungen/);assert.ok(document.querySelector('[data-action="copy-application"]'));
  dom.window.close();
});

test('Redesign: all 64 criteria retain exact labels, values and explanations; all help stays available on demand',async()=>{
  const dom=await setup('/rechner');await start();
  for(const q of QUESTIONS){
    click(`[data-question="${q.id}"]`);
    assert.equal(document.querySelector('#question-title').textContent,questionLabel(q),q.id);assert.equal(document.querySelector('.canonical-question').textContent,q.question,q.id);
    assert.equal(document.querySelector('#question-help').textContent,q.help,q.id);
    if(q.type==='choice'||q.type==='continence'){
      if(q.type==='continence')choose('eligible','yes');
      const inputs=[...document.querySelectorAll('.answer-choice input')];assert.deepEqual(inputs.map(el=>Number(el.value)),q.options.map(o=>o.value),q.id);
      for(const [i,o] of q.options.entries()){
        const row=inputs[i].closest('.answer-choice');assert.equal(row.querySelector('.option-label').textContent,optionLabel(q,o));assert.equal(row.querySelector('.official-option').textContent,o.label);assert.ok(row.textContent.includes(o.description));
      }
      choose('answer',String(q.options[0].value));const row=inputs[0].closest('.answer-choice');assert.equal(row.querySelector('.answer-explanation').hidden,true,'selection keeps explanation collapsed');row.querySelector('.option-help').click();assert.equal(row.querySelector('.answer-explanation').hidden,false);assert.equal(row.querySelector('.option-help').getAttribute('aria-expanded'),'true');
    }
  }
  dom.window.close();
});

test('Redesign: module transition adds no confirmation click; leaving the calculator preserves its current question',async()=>{
  const dom=await setup('/rechner');await start();
  for(let i=0;i<5;i++){choose('answer','0');submit('question-form');}
  assert.equal(document.querySelector('#question-title').textContent,QUESTIONS[5].question);assert.match(document.querySelector('.module-milestone').textContent,/5 von 5 geklärt/);
  await navigate('/ratgeber');assert.match(document.querySelector('.nav-cta').textContent,/fortsetzen/);await navigate('/rechner');assert.equal(document.querySelector('#question-title').textContent,QUESTIONS[5].question);
  click('[data-question="1.1"]');assert.equal(document.querySelector('input[name="answer"]:checked').value,'0');dom.window.close();
});

test('Benefits selection preserves focus and care setting; unavailable grade1 benefits are not shown as entitlements',async()=>{
  const dom=await setup('/leistungen');
  for(const [grade,cash] of [[2,'347 €'],[3,'599 €'],[4,'800 €'],[5,'990 €']]){
    const button=document.querySelector(`[data-benefit-grade="${grade}"]`);button.focus();button.click();
    assert.equal(document.activeElement,button);assert.ok(document.querySelector('[data-benefit="cash"]').textContent.includes(cash));assert.match(document.querySelector('#announcement').textContent,new RegExp(`Pflegegrad ${grade}`));
  }
  click('[data-benefit-grade="1"]');for(const id of ['cash','services','annual']){const card=document.querySelector(`[data-benefit="${id}"]`);assert.equal(card.dataset.available,'false');assert.equal(card.querySelector('.benefit-amount'),null);assert.match(card.textContent,/Kein eigene[rs] /);}assert.equal(document.querySelector('[data-benefit="day"]'),null);
  assert.match(document.querySelector('[data-benefit="relief"]').textContent,/131 €/);assert.match(document.querySelector('.benefit-context').textContent,/Kein Pflegegeld/);
  click('[data-care-setting="residential"]');assert.equal(document.activeElement.dataset.careSetting,'residential');assert.match(document.querySelector('[data-benefit="residential"]').textContent,/131 €/);assert.equal(document.querySelector('.residential-share'),null);
  click('[data-benefit-grade="5"]');assert.equal(document.querySelector('[data-care-setting="residential"]').getAttribute('aria-pressed'),'true');assert.match(document.querySelector('[data-benefit="residential"]').textContent,/2\.096 €/);assert.ok(document.querySelector('.residential-share'));
  await navigate('/ratgeber');await navigate('/leistungen');assert.equal(document.querySelector('[data-benefit-grade="5"]').getAttribute('aria-pressed'),'true');
  dom.window.close();
});

test('Complete result links to its benefits without putting health data into URLs; incomplete result does not assert an entitlement',async()=>{
  const dom=await setup('/rechner');await start();click('[data-action="result"]');await tick();assert.equal(document.querySelector('.result-benefits'),null);
  for(const q of QUESTIONS){click(`[data-question="${q.id}"]`);await tick();if(q.type==='choice')choose('answer',q.id==='4.8'?'9':'0');else if(q.type==='continence')choose('eligible','no');else choose('answer','zero');}
  click('[data-action="result"]');await tick();assert.equal(document.querySelector('.result-grade').textContent,'Pflegegrad 1');assert.match(document.querySelector('.result-benefits').textContent,/keinen Leistungsanspruch/);assert.equal(document.querySelector('.all-result-details').open,false);assert.equal(document.querySelectorAll('.result-breakdown tbody tr').length,68);
  click('[data-benefits-link="1"]');await tick();assert.equal(location.hash,'#/leistungen');assert.equal(document.querySelector('[data-benefit-grade="1"]').getAttribute('aria-pressed'),'true');
  await navigate('/ergebnis');assert.equal(document.querySelector('.result-number').textContent,'20');assert.ok(document.querySelector('[data-action="pdf"]'));
  dom.window.close();
});

test('Application template is copied exactly and downloads as a local text file',async()=>{
  const dom=await setup('/ratgeber');const copied=[],downloads=[];let blob;
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>copied.push(text)},configurable:true});
  const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;URL.createObjectURL=b=>{blob=b;return 'blob:local-template';};URL.revokeObjectURL=()=>{};
  const oldClick=dom.window.HTMLAnchorElement.prototype.click;dom.window.HTMLAnchorElement.prototype.click=function(){downloads.push({href:this.href,name:this.download});};
  try{click('[data-action="copy-application"]');await tick();assert.equal(copied[0],document.querySelector('#application-template').value);click('[data-action="download-application"]');assert.equal(await blob.text(),copied[0]);assert.deepEqual(downloads,[{href:'blob:local-template',name:'Pflegegrad-Antrag.txt'}]);}finally{URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;dom.window.HTMLAnchorElement.prototype.click=oldClick;dom.window.close();}
});

test('Four homepage tasks and minimal footer retain legal navigation',async()=>{
  const dom=await setup();assert.deepEqual([...document.querySelectorAll('.task-bento>a')].map(a=>a.getAttribute('href')),['#/rechner','#/ratgeber','#/leistungen','#/reform']);
  const footer=document.querySelector('footer');for(const text of ['Ein Informationsservice','Private Vorschau','Caro ist weder'])assert.ok(!footer.textContent.includes(text));
  for(const route of ['/impressum','/datenschutz','/quellen'])assert.ok(footer.querySelector(`a[href="#${route}"]`));
  await navigate('/impressum');assert.match(document.querySelector('main').textContent,/Caro/);dom.window.close();
});
function setValue(selector,value,type='input'){const input=document.querySelector(selector);assert.ok(input);input.value=value;input.dispatchEvent(new window.Event(type,{bubbles:true}));return input;}
test('Reform comparison: range, typed input, validation, rule emphasis and every module work without losing focus',async()=>{
  const dom=await setup('/reform');assert.match(document.querySelector('.reform-status').textContent,/noch nicht beschlossen/);
  assert.match(document.querySelector('[data-scale="current"] .scale-title').textContent,/Pflegegrad 2/);assert.match(document.querySelector('[data-scale="draft"] .scale-title').textContent,/Pflegegrad 1/);
  const number=document.querySelector('#reform-points-number');number.focus();setValue('#reform-points-number','30');assert.equal(document.activeElement,number);assert.equal(document.querySelector('#reform-points').value,'30');assert.match(document.querySelector('[data-scale="draft"] .scale-title').textContent,/Pflegegrad 2/);
  setValue('#reform-points-number','101');assert.equal(number.getAttribute('aria-invalid'),'true');assert.match(document.querySelector('#points-error').textContent,/0 bis 100/);assert.equal(document.querySelector('#reform-points').value,'30');
  setValue('#reform-points','12.49');assert.equal(number.value,'12.49');assert.equal(number.hasAttribute('aria-invalid'),false);assert.match(document.querySelector('[data-scale="current"] .scale-title').textContent,/Kein Pflegegrad/);
  assert.equal(document.querySelectorAll('.threshold-scale').length,2);
  assert.deepEqual([...document.querySelectorAll('.module-value>strong')].map(n=>n.textContent),['20','10']);
  for(const [module,raw,expected] of [[1,6,['7,5','5']],[2,6,['7,5','7,5']],[3,3,['7,5','7,5']],[4,8,['20','10']],[5,3,['10','10']],[6,1,['3,75','0']]]){
    setValue('#reform-module-select',String(module),'change');setValue('#reform-raw',String(raw));assert.deepEqual([...document.querySelectorAll('.module-value>strong')].map(n=>n.textContent),expected);assert.equal(document.querySelectorAll('.reform-table-details tbody tr').length,5);
  }
  const raw=document.querySelector('#reform-raw-number');raw.focus();setValue('#reform-raw-number','1.5');assert.equal(raw.getAttribute('aria-invalid'),'true');assert.equal(document.querySelector('#reform-raw').value,'1');assert.equal(document.activeElement,raw);
  setValue('#reform-raw-number','18');assert.deepEqual([...document.querySelectorAll('.module-value>strong')].map(n=>n.textContent),['15','15']);
  click('[data-weight-module="2"]');assert.match(document.querySelector('#weight-detail').textContent,/höhere gewichtete Wert/);assert.equal(document.querySelector('[data-weight-group="23"]').getAttribute('aria-pressed'),'true');
  click('[data-weight-module="3"]');assert.equal(document.querySelectorAll('.weight-stack [aria-pressed="true"]').length,1);assert.match(document.querySelector('#weight-detail').textContent,/Verhaltensweisen/);
  click('[data-weight-group="4"]');assert.equal(document.querySelector('[data-weight-module="4"]').getAttribute('aria-pressed'),'true');assert.match(document.querySelector('.weight-big').textContent,/40/);
  click('[data-reform-jump="reform-module"]');assert.equal(document.activeElement.id,'module-heading');assert.equal(location.hash,'#/reform');dom.window.close();
});
test('Reform sliders are isolated from existing answers and scoring; legacy reform information remains accessible',async()=>{
  const dom=await setup('/rechner');await start();choose('answer','3');await navigate('/reform');setValue('#reform-points','100');setValue('#reform-raw','54');await navigate('/rechner');assert.equal(document.querySelector('input[name="answer"]:checked').value,'3');
  click('[data-action="result"]');await tick();assert.match(document.querySelector('.result-status').textContent,/offen|beantwortet|vollständig/i);
  await navigate('/reform-details');assert.ok(document.querySelector('.reference-section'));assert.match(document.querySelector('main').textContent,/Widerspruch/);dom.window.close();
});

test('Reform narrative order, three point steps and IGES tap interaction preserve all controls',async()=>{
  const dom=await setup('/reform');
  assert.deepEqual([...document.querySelectorAll('main section[id]')].map(s=>s.id),['reform-gewichtung','reform-grenzen','reform-module','reform-auswirkungen']);
  assert.equal(document.querySelectorAll('.points-journey>li').length,3);assert.match(document.querySelector('.points-journey').textContent,/35/);assert.match(document.querySelector('#weight-heading').textContent,/Wie wird ein Pflegegrad berechnet/);
  for(const [grade,before,model,percent] of [[0,'237.390','453.584','+91,1 %'],[1,'365.938','379.800','+3,8 %'],[2,'447.931','287.411','−35,8 %'],[3,'136.301','75.171','−44,8 %'],[4,'24.551','16.926','−31,1 %'],[5,'6.164','5.383','−12,7 %']]){
    const button=document.querySelector(`[data-iges-grade="${grade}"]`);button.focus();button.click();assert.equal(document.activeElement,button);assert.equal(document.querySelectorAll('.iges-row[aria-pressed="true"]').length,1);const detail=document.querySelector('#iges-detail');assert.ok(detail.textContent.includes(before));assert.ok(detail.textContent.includes(model));assert.ok(detail.textContent.includes(percent));
  }
  click('[data-reform-jump="reform-auswirkungen"]');assert.equal(document.activeElement.id,'iges-heading');
  await navigate('/ratgeber');await navigate('/reform');assert.equal(document.querySelector('[data-iges-grade="5"]').getAttribute('aria-pressed'),'true');
  assert.ok(document.querySelector('#reform-points'));assert.ok(document.querySelector('#reform-raw'));assert.equal(document.querySelectorAll('[data-weight-module]').length,6);dom.window.close();
});
