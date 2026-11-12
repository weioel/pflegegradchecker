import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { guidePage,faqPage,sourcesPage,reformPage,privacyPage,imprintPage } from '../dist/content.js';
import { presentContent } from '../dist/presentation.js';
const pages=[['/ratgeber',guidePage],['/faq',faqPage],['/quellen',sourcesPage],['/reform',reformPage],['/datenschutz',privacyPage],['/impressum',imprintPage]];
const normalized=text=>text.replace(/\s+/g,' ').trim();
function visibleText(el){if(el.nodeType===3)return el.textContent;if(el.nodeType!==1&&el.nodeType!==11)return '';if(el.hidden||el.classList?.contains('sr-only'))return '';if(el.tagName==='DETAILS'&&!el.open)return visibleText(el.querySelector('summary'));return [...el.childNodes].map(visibleText).join(' ');}

test('Redesign keeps scoring data, calculation unchanged; PDF changes limited to approved branding',async()=>{
  const expected={data:'be785827fa41493f61735d8e1948ec859cde080cf4ae510efeca576c062b73bb',calculator:'9f297b038400632468700c7188371d0274c3629df2719008fd5fc2dd1bbc303a',pdf:'67c782fc82744645efc0e865a6c58f48e1f759cf6b6994c731cdaac2cad3f7aa'};
  for(const [file,hash] of Object.entries(expected)){const bytes=await fs.readFile(new URL(`../dist/${file}.js`,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,file);}
});
for(const [route,render] of pages)test(`Redesign preserves full body paragraphs, table cells and official links: ${route}`,()=>{
  const dom=new JSDOM();globalThis.document=dom.window.document;
  const original=document.createElement('template');original.innerHTML=render();const after=document.createElement('template');after.innerHTML=presentContent(route,render());
  const originalNodes=[...original.content.querySelectorAll('.prose p,.steps .step p,.faq-list p,td,th,textarea')].filter(el=>!el.classList.contains('eyebrow'));
  const afterText=normalized(after.content.textContent);
  for(const el of originalNodes){assert.ok(afterText.includes(normalized(el.textContent)),`${route}: ${normalized(el.textContent).slice(0,95)}`);}
  const links=[...original.content.querySelectorAll('a[href^="https:"]')].map(a=>a.href).sort();const afterLinks=[...after.content.querySelectorAll('a[href^="https:"]')].map(a=>a.href).sort();assert.deepEqual(afterLinks,links);
  assert.equal(after.content.querySelectorAll('h1').length,1);dom.window.close();
});

test('Guide, methodology and reform show substantially less text before expansion',()=>{
  const dom=new JSDOM();globalThis.document=dom.window.document;
  for(const [route,render] of pages.filter(([route])=>['/ratgeber','/quellen','/reform'].includes(route))){
    const before=document.createElement('template');before.innerHTML=render();const after=document.createElement('template');after.innerHTML=presentContent(route,render());
    const ratio=visibleText(after.content).length/visibleText(before.content).length;assert.ok(ratio<.5,`${route}: ${Math.round(ratio*100)}% of original visible text`);
  }dom.window.close();
});
