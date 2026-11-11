import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../dist/data.js';
import { calculate } from '../dist/calculator.js';
import { generateResultPDF, exportResultPDF } from '../dist/pdf.js';

const blank=()=>Object.fromEntries(QUESTIONS.map(q=>[q.id,q.type==='choice'?0:q.type==='continence'?{eligible:false}:q.type==='frequency'?{day:0}:{week:0}]));
const date=new Date('2026-11-11T12:00:00Z');
const asText=bytes=>new TextDecoder('ascii').decode(bytes);
const shownText=pdf=>[...pdf.matchAll(/<([0-9a-f]+)> Tj/g)].map(([,hex])=>new TextDecoder('windows-1252').decode(Uint8Array.from(hex.match(/../g),b=>parseInt(b,16)))).join('\n');

test('PDF is a real multi-page document with correct byte offsets and source links',()=>{
  const answers=blank();const bytes=generateResultPDF(calculate(answers),answers,{duration:'yes',createdAt:date});
  const pdf=asText(bytes);
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(pdf.startsWith('%PDF-1.7'));
  assert.ok(pdf.endsWith('%%EOF\n'));
  const start=Number(pdf.match(/startxref\n(\d+)/)[1]);
  assert.equal(pdf.slice(start,start+4),'xref');
  const offsetLines=pdf.slice(start).split('\n');
  const count=Number(offsetLines[1].split(' ')[1]);
  for(let i=1;i<count;i++){
    const offset=Number(offsetLines[2+i].slice(0,10));
    assert.ok(pdf.slice(offset).startsWith(`${i} 0 obj\n`),`Object ${i} offset`);
  }
  const pages=Number(pdf.match(/\/Type \/Pages \/Count (\d+)/)[1]);
  assert.ok(pages>=5&&pages<=12,`Unexpected page count: ${pages}`);
  assert.equal([...pdf.matchAll(/\/Type \/Page \/Parent/g)].length,pages);
  assert.ok(pdf.includes('/Subtype /Link')&&pdf.includes('/S /URI'));
  assert.ok(pdf.includes('/Lang (de-DE)'));
  const shown=shownText(pdf);
  assert.ok(shown.includes('Regelstand: 11.11.2026'));
  assert.ok(shown.includes(`Seite ${pages} von ${pages}`));
});

test('PDF retains German text and explicit Unicode mapping',()=>{
  const answers=blank();answers['4.8']=6;
  const pdf=asText(generateResultPDF(calculate(answers),answers,{createdAt:date}));
  const text=shownText(pdf);
  for(const word of ['Selbsteinschätzung','Mobilität','Höherstufung','über','Einzelpunkte'])assert.ok(text.includes(word),word);
  for(const mapping of ['<e4> <00e4>','<f6> <00f6>','<fc> <00fc>','<df> <00df>'])assert.ok(pdf.includes(mapping),mapping);
  assert.ok(pdf.includes('/ToUnicode '));
  assert.ok(pdf.includes('/Title <feff'));
});

test('Every official criterion appears in the answer report, including nonuniform and frequency answers',()=>{
  const answers=blank();answers['4.8']=6;answers['4.13']=3;answers['5.2']={week:16};answers['5.12']={daily:true};answers['4.11']={eligible:true,value:2};
  const text=shownText(asText(generateResultPDF(calculate(answers),answers,{duration:true,createdAt:date})));
  for(const q of QUESTIONS)assert.ok(text.includes(`${q.id} `),`Missing criterion ${q.id}`);
  assert.ok(text.includes('64 von 64 Kriterien beantwortet.'));
  assert.ok(text.includes('16 pro Woche mit notwendiger personeller Hilfe'));
  assert.ok(text.includes('Täglich: zeit- und technikintensive Maßnahme'));
  assert.ok(text.includes('Vollständig'));
  assert.ok(text.includes('Einzelpunkte: 6'));
  assert.ok(text.includes('Einzelpunkte: 3'));
  assert.ok(text.includes('M2/M3 gemeinsam:'));
  assert.ok(text.includes('nicht die Summe.'));
});

test('Incomplete data remains a range with open answers, even if module bands collapse',()=>{
  const answers=blank();answers['1.1']=null;
  const text=shownText(asText(generateResultPDF(calculate(answers),answers,{duration:'unknown',createdAt:date})));
  assert.ok(text.includes('Möglicher Punktebereich von 100'));
  assert.ok(text.includes('63 von 64 Kriterien beantwortet.'));
  assert.ok(text.includes('Offene Angaben: 1.1.'));
  assert.ok(text.includes('OFFEN / Ich bin mir nicht sicher'));
  assert.ok(text.includes('Dauer der Einschränkungen ist ungeklärt'));
  assert.ok(text.includes('Der tatsächliche Pflegegrad'));
});

test('A short duration and inconsistent results cannot silently imply a valid award',()=>{
  const answers=blank();
  const text=shownText(asText(generateResultPDF(calculate(answers),answers,{duration:false,createdAt:date})));
  assert.ok(text.includes('Dauer-Voraussetzung ist damit nach dieser'));
  const stale=calculate(answers);answers['4.8']=9;
  assert.throws(()=>generateResultPDF(stale,answers,{createdAt:date}),/stimmen nicht überein/);
  assert.throws(()=>generateResultPDF(null,answers,{createdAt:'invalid'}),RangeError);
});

test('Browser export creates a PDF download and releases its local object URL',t=>{
  const answers=blank();let clicked=false,removed=false,revoked=false,appended=false;
  const link={style:{},click(){clicked=true;},remove(){removed=true;}};
  const originalDocument=globalThis.document;
  globalThis.document={createElement(tag){assert.equal(tag,'a');return link;},body:{appendChild(node){assert.equal(node,link);appended=true;}}};
  t.after(()=>{if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;});
  t.mock.method(URL,'createObjectURL',blob=>{assert.equal(blob.type,'application/pdf');assert.ok(blob.size>1000);return 'blob:local-pdf-test';});
  t.mock.method(URL,'revokeObjectURL',url=>{assert.equal(url,'blob:local-pdf-test');revoked=true;});
  t.mock.method(globalThis,'setTimeout',callback=>{callback();return 0;});
  const bytes=exportResultPDF(calculate(answers),answers,{duration:'yes',createdAt:date});
  assert.ok(bytes instanceof Uint8Array);
  assert.equal(link.href,'blob:local-pdf-test');
  assert.equal(link.download,'pflegegrad-selbsteinschaetzung.pdf');
  assert.ok(clicked&&removed&&revoked&&appended);
});
