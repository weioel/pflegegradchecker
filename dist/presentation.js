import { icon, guideSteps, timeline, escapeHTML as esc } from './ui.js';

// Reorganizes the existing full editorial content without discarding legal text.
export function presentContent(route,markup){
  const template=document.createElement('template');template.innerHTML=markup;
  const root=template.content;
  const header=root.querySelector('.page-header');
  if(route==='/ratgeber'){
    header.querySelector('h1').innerHTML='Gut vorbereitet.<br>Pflegegrad beantragen.';
    header.querySelector('.lead').textContent='Fünf Schritte. Wählen Sie den, bei dem Sie gerade stehen.';
    const steps=[...root.querySelectorAll('.step')];
    const layout=document.createElement('div');layout.className='guide-layout';
    const list=document.createElement('div');list.className='guide-steps';
    let application;
    for(const [i,section] of steps.entries()){
      const data=guideSteps[i];
      const details=document.createElement('details');details.id=section.id;details.className='guide-step';
      section.querySelector(':scope > .eyebrow')?.remove();section.querySelector(':scope > h2')?.remove();
      if(i===1){application=section.querySelector('details');application?.remove();}
      details.innerHTML=`<summary><span class="step-index">0${i+1}</span><span class="step-summary"><strong>${data.title}</strong><span>${data.summary}</span></span></summary><div class="guide-body prose">${section.innerHTML}</div>`;
      list.append(details);
    }
    const side=document.createElement('aside');side.className='guide-tools';side.setAttribute('aria-label','Hilfen zum Antrag');
    side.innerHTML=`<div class="guide-tool"><span class="icon-surface">${icon('document')}</span><h2>Der erste Antrag.<br>Schon formuliert.</h2><p>Kopieren, ergänzen und an Ihre Pflegeversicherung schicken.</p><a class="button dark" href="#application-card">Antragsmuster öffnen ${icon('arrow')}</a></div><div class="guide-note"><span class="icon-surface">${icon('chat')}</span><h3>Sie müssen das nicht allein klären.</h3><p>Ihre Pflegeversicherung oder ein Pflegestützpunkt hilft weiter.</p><a class="text-link" href="#guide-apply">Beratungsmöglichkeiten ${icon('arrow')}</a></div><p class="guide-meta">Recherchestand: 11.11.2026.<br>Allgemeine Information, keine individuelle Rechtsberatung.</p>`;
    layout.append(list,side);
    root.querySelector('.content-grid').replaceWith(layout);
    const nav=document.createElement('div');nav.innerHTML=timeline();header.after(nav.firstElementChild);
    if(application){application.id='application-card';application.className='application-template-panel';application.querySelector('summary').innerHTML=`${icon('document')} <span>Antragsmuster zum Kopieren</span>`;root.append(application);}
  }else if(route==='/faq'){
    header.querySelector('h1').textContent='Ihre Fragen. Klar beantwortet.';
    header.querySelector('.lead').textContent='Wählen Sie ein Thema. Die Details öffnen sich mit einem Klick.';
    const items=[...root.querySelectorAll('.faq-list>details')];
    const categories=[['grundlagen','Pflegegrad verstehen',[0,1,8,9,11]],['rechner','Den Selbstcheck nutzen',[2,3,4,5,6,7,10]],['weiteres','Datenschutz & Aktuelles',[12,13,14]]];
    const block=document.createElement('div');block.className='faq-hub';
    block.innerHTML=`<div class="topic-filters" role="group" aria-label="Fragenthema auswählen">${categories.map(([id,label],i)=>`<button data-faq-filter="${id}" aria-pressed="${i===0}">${label}</button>`).join('')}</div><div class="faq-panels"></div>`;
    for(const [id,label,indices] of categories){const group=document.createElement('section');group.className='faq-panel';group.dataset.faqPanel=id;group.hidden=id!=='grundlagen';group.setAttribute('aria-label',label);for(const index of indices)group.append(items[index]);block.querySelector('.faq-panels').append(group);}
    root.querySelector('.faq-list').replaceWith(block);
  }else if(['/quellen','/reform','/datenschutz','/impressum'].includes(route)){
    header.querySelector('h1').innerHTML=({'/quellen':'So wird Ihr Pflegegrad<br>berechnet.','/reform':'Pflegereform 2027.<br>Heute. Geplant.','/datenschutz':'Ihre Antworten.<br>Auf Ihrem Gerät.','/impressum':'Wer hinter dem<br>Angebot steht.'})[route];
    header.querySelector('.lead').textContent=({'/quellen':'Feste Regeln. Amtliche Quellen. Jeder Rechenschritt nachvollziehbar.','/reform':'Geltendes Recht und Entwurf klar getrennt. Recherchestand: 11.11.2026.','/datenschutz':'Lokale Berechnung. Keine Übertragung Ihrer Gesundheitsantworten.','/impressum':'Caro Alltagsbegleitung in Tübingen. Private Projektvorschau.'})[route];
    const prose=[...root.children].find(el=>el.classList.contains('prose'));
    const hub=document.createElement('div');hub.className=`reference-hub ${route==='/reform'?'reform-hub':''}`;
    const note=prose.querySelector(':scope > .note');if(note){note.classList.add('reference-status');hub.append(note);}
    if(route==='/quellen'){
      const quick=document.createElement('div');quick.className='method-overview';quick.innerHTML=`<span>${icon('chat')} Antworten</span><b aria-hidden="true">→</b><span>${icon('layers')} Modulpunkte</span><b aria-hidden="true">→</b><span>${icon('calculator')} Gesamtwert</span>`;hub.append(quick);
    }
    let body;
    for(const element of [...prose.children]){
      if(element.tagName==='H2'){
        const details=document.createElement('details');details.className='reference-section';details.innerHTML=`<summary>${esc(element.textContent)}</summary><div class="reference-body prose"></div>`;body=details.lastElementChild;hub.append(details);
      }else if(body){body.append(element);}else{hub.append(element);}
    }
    prose.replaceWith(hub);
  }
  return template.innerHTML;
}
