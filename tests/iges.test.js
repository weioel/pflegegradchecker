import test from 'node:test';
import assert from 'node:assert/strict';
import { IGES,igesSection } from '../dist/iges.js';
import { JSDOM } from 'jsdom';
// Independently transcribed original table9, printed page91, variant2.
test('IGES original values, relative changes, totals and exclusions belong to first assessments 2024',()=>{
  const expected=[[237390,453584,91.1],[365938,379800,3.8],[447931,287411,-35.8],[136301,75171,-44.8],[24551,16926,-31.1],[6164,5383,-12.7]];
  assert.deepEqual(IGES.rows.map(r=>[r.before,r.model,r.percent]),expected);assert.equal(IGES.year,2024);assert.equal(IGES.variant,2);
  for(const r of IGES.rows)assert.equal(Math.round((r.model/r.before-1)*1000)/10,r.percent);
  for(const key of ['before','model']){assert.equal(IGES.rows.reduce((sum,r)=>sum+r[key],0),1218275);assert.equal(IGES.rows.slice(1).reduce((sum,r)=>sum+r[key],0),IGES.recognized[key]);}
  assert.equal(Math.round((IGES.recognized.model/IGES.recognized.before-1)*1000)/10,-22);
});
test('All twelve bars use the same zero-based linear scale without minimum-height distortion',()=>{
  const dom=new JSDOM(igesSection());const rows=[...dom.window.document.querySelectorAll('[data-iges-grade]')];assert.equal(rows.length,6);
  for(const [i,button] of rows.entries()){
    for(const [cls,key] of [['.iges-before','before'],['.iges-model','model']]){const bar=button.querySelector(cls);assert.equal(parseFloat(bar.style.height),IGES.rows[i][key]/500000*100);}
    assert.ok(button.querySelector('.iges-row-title strong').textContent.includes('%'));assert.ok(button.getAttribute('aria-label').includes('Fälle'));assert.equal(button.getAttribute('aria-controls'),'iges-detail');
  }
  const text=dom.window.document.body.textContent;for(const phrase of ['keine gesicherte Prognose','nicht der Anteil aller Antragsteller','bereits Anerkannten','1.241','50.243'])assert.ok(text.includes(phrase),phrase);
  dom.window.close();
});
