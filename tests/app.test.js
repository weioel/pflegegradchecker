import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { QUESTIONS } from '../dist/data.js';

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
  for(const route of ['/','/ratgeber','/faq','/quellen','/reform','/datenschutz','/impressum','/rechner']){
    await navigate(route);assert.ok(document.querySelector('main h1'),route);assert.equal(document.querySelectorAll('main h1').length,1);
    assert.equal(new Set([...document.querySelectorAll('[id]')].map(el=>el.id)).size,document.querySelectorAll('[id]').length,`unique IDs ${route}`);
    click('.skip-link');assert.equal(location.hash,`#${route}`);
  }
  await navigate('/ratgeber');click('a[href="#guide-apply"]');await tick();assert.ok(document.querySelector('#guide-apply'));assert.match(document.querySelector('h1').textContent,/Gut vorbereitet/);
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
    assert.ok(document.querySelector('#question-title').textContent===q.question,q.id);
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
  await check('Landing');await navigate('/rechner');await check('Introduction');await start();await check('Question');click('[data-action="result"]');await tick();await check('Incomplete result');await navigate('/ratgeber');await check('Guide');dom.window.close();
});
