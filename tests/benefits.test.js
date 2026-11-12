import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { BENEFIT_RULESET,BENEFIT_CATEGORIES,BENEFITS,BENEFIT_SOURCES,COMBINATION_RULES,benefitAmount } from '../dist/benefits-data.js';
import { benefitsPage,benefitsContent,benefitsPreview } from '../dist/benefits.js';

// Independently transcribed official 2026 benefit table; row order PG1–5.
const official={cash:[null,347,599,800,990],services:[null,796,1497,1859,2299],relief:[131,131,131,131,131],annual:[null,3539,3539,3539,3539],day:[null,721,1357,1685,2085],aids:[42,42,42,42,42],home:[4180,4180,4180,4180,4180],residential:[131,805,1319,1855,2096]};
for(const [id,amounts] of Object.entries(official))test(`Official benefit amounts and eligibility: ${id}`,()=>{
  for(let grade=1;grade<=5;grade++)assert.equal(benefitAmount(id,grade),amounts[grade-1],`Pflegegrad ${grade}`);
});
test('Every benefit has a current version, official primary sources, frequency and payment type; no reform amounts are current',()=>{
  assert.equal(BENEFIT_RULESET.status,'current');assert.equal(BENEFIT_RULESET.checkedAt,'2026-11-12');assert.equal(BENEFIT_RULESET.reformStatus,'draft');
  const units={cash:'month',services:'month',relief:'month',annual:'year',day:'month',aids:'month',home:'measure',residential:'month'};
  for(const b of BENEFITS){assert.equal(b.unit,units[b.id]);assert.ok(b.sources.length);assert.ok(['cash','service','reimbursement','grant'].includes(b.kind));for(const id of b.sources){assert.ok(BENEFIT_SOURCES[id]);assert.ok(['www.gesetze-im-internet.de','www.bundesgesundheitsministerium.de'].includes(new URL(BENEFIT_SOURCES[id].url).hostname));}}
  assert.equal(BENEFITS.filter(b=>b.kind==='cash').length,1);assert.equal(COMBINATION_RULES.conversionMaximumShare,.4);assert.equal(COMBINATION_RULES.bindingMonths,6);
  for(const grade of [0,6,1.5,NaN,'2'])assert.throws(()=>benefitAmount('cash',grade),RangeError);
});
test('All five benefit pages distinguish care settings, periods, cash and earmarked budgets',()=>{
  for(let grade=1;grade<=5;grade++){
    const dom=new JSDOM(benefitsPage(grade));const doc=dom.window.document;
    assert.equal(doc.querySelectorAll('[data-benefit-grade]').length,5);assert.equal(doc.querySelectorAll('[data-benefit-grade][aria-pressed="true"]').length,1);
    assert.match(doc.querySelector('.benefit-eligibility').textContent,/keine Gesamtauszahlung/i);
    assert.equal(doc.querySelector('[data-benefit="residential"]'),null);
    if(grade>1){assert.match(doc.querySelector('[data-benefit="annual"] .amount-unit').textContent,/Kalenderjahr/);assert.match(doc.querySelector('.benefit-combinations').textContent,/kein zusätzliches Budget/);assert.match(doc.querySelector('.benefit-combinations').textContent,/50 Prozent/);}
    assert.match(doc.querySelector('[data-benefit="home"] .amount-unit').textContent,/Maßnahme/);assert.match(doc.querySelector('[data-benefit="relief"] .benefit-tag').textContent,/gegen Belege/);
    const residential=new JSDOM(benefitsContent(grade,'residential'));assert.equal(residential.window.document.querySelectorAll('[data-benefit]').length,1);assert.equal(residential.window.document.querySelector('[data-benefit="cash"]'),null);residential.window.close();dom.window.close();
  }
});
test('Result previews only show applicable benefits and an explicit non-entitlement notice',()=>{
  for(let grade=1;grade<=5;grade++){const dom=new JSDOM(benefitsPreview(grade));const doc=dom.window.document;assert.match(doc.querySelector('.benefit-eligibility').textContent,/keinen Leistungsanspruch/);for(const el of doc.querySelectorAll('[data-benefit]'))assert.notEqual(benefitAmount(el.dataset.benefit,grade),null);assert.equal(doc.querySelector('[data-benefits-link]').getAttribute('href'),'#/leistungen');dom.window.close();}
});

test('Five price-free grade cards expose seven labelled statuses and one shared annual budget',()=>{
  const dom=new JSDOM(benefitsPage(2)),doc=dom.window.document;
  const cards=[...doc.querySelectorAll('.benefit-grade-card')];assert.equal(cards.length,5);
  for(const card of cards){assert.ok(!card.textContent.includes('€'));assert.equal(card.querySelectorAll('[data-category]').length,7);assert.equal(card.querySelectorAll('.benefit-status .sr-only').length,7);}
  const first=cards[0];for(const id of ['cash','services','replacement'])assert.equal(first.querySelector(`[data-category="${id}"]`).dataset.status,'unavailable');
  assert.equal(first.querySelector('[data-category="shortTerm"]').dataset.status,'conditional');assert.match(first.querySelector('[data-category="shortTerm"]').textContent,/Nur über den Entlastungsbetrag/);
  for(const c of BENEFIT_CATEGORIES){assert.equal(c.statuses.length,5);for(const id of c.sources)assert.ok(BENEFIT_SOURCES[id]);}
  assert.equal(BENEFIT_CATEGORIES.find(c=>c.id==='replacement').budgetGroup,BENEFIT_CATEGORIES.find(c=>c.id==='shortTerm').budgetGroup);
  assert.match(doc.querySelector('.shared-budget-hint').textContent,/teilen sich ein Jahresbudget/);
  for(const grade of [1,2,3,4,5]){const page=new JSDOM(benefitsContent(grade));assert.equal(page.window.document.querySelectorAll('.primary-benefits>.benefit-card').length,6);assert.equal(page.window.document.querySelectorAll('.mobile-benefit-matrix [data-category]').length,7);assert.ok(page.window.document.querySelector('.mobile-benefit-matrix').getAttribute('aria-label').includes(`Pflegegrad ${grade}`));page.window.close();}
  dom.window.close();
});
