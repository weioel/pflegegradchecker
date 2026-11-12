import { icon, guideSteps, timeline, escapeHTML as esc } from './ui.js';

// Reorganizes the existing full editorial content without discarding legal text.
export function presentContent(route,markup){
  const template=document.createElement('template');template.innerHTML=markup;
  const root=template.content;
  const header=root.querySelector('.page-header');
  if(route==='/ratgeber'){
    header.querySelector('h1').textContent='Pflegegrad beantragen.';
    header.querySelector('.lead').remove();
    header.querySelector('.eyebrow')?.remove();
    const steps=[...root.querySelectorAll('.step')], mapped=[];
    let application;
    for(const [i,section] of steps.entries()){
      const data=guideSteps[i];
      const details=document.createElement('details');details.id=section.id;details.className='guide-step';
      section.querySelector(':scope > .eyebrow')?.remove();section.querySelector(':scope > h2')?.remove();
      if(i===1){application=section.querySelector('details');application?.remove();}
      const titles={1:'Pflegekasse kontaktieren',2:'Begutachtung vorbereiten',3:'Bescheid erhalten'};
      const summaries={1:'Bei Ihrer Krankenkasse oder privaten Pflegeversicherung beantragen.',2:'Medizinischer Dienst oder Medicproof prüft den Hilfebedarf.',3:'Die Pflegeversicherung entscheidet. Prüfen Sie das Gutachten.'};
      details.innerHTML=`<summary>${i>0&&i<4?`<span class="step-index">${i}</span>`:''}<span class="step-summary"><strong>${titles[i]||data.title}</strong>${summaries[i]?`<span>${summaries[i]}</span>`:''}</span></summary><div class="guide-body prose">${section.innerHTML}</div>`;
      mapped.push(details);
    }
    const layout=document.createElement('div');layout.className='simple-guide';
    const nav=document.createElement('nav');nav.className='step-timeline compact-timeline';nav.setAttribute('aria-label','Drei Schritte zum Pflegegrad');nav.innerHTML='<ol><li><a href="#guide-apply"><span class="timeline-number">1</span>Beantragen</a></li><li><a href="#guide-prepare"><span class="timeline-number">2</span>Begutachtung</a></li><li><a href="#guide-decision"><span class="timeline-number">3</span>Bescheid</a></li></ol>';layout.append(nav);
    const list=document.createElement('div');list.className='guide-steps';list.append(mapped[1],mapped[2],mapped[3]);layout.append(list);
    if(application){application.id='application-card';application.className='application-template-panel';application.querySelector('summary').innerHTML=`${icon('document')} <span>Musterantrag kopieren oder herunterladen</span>`;const download=document.createElement('button');download.className='button secondary';download.dataset.action='download-application';download.textContent='Als Textdatei herunterladen';application.querySelector('[data-action="copy-application"]').after(download);layout.append(application);}
    const extras=document.createElement('div');extras.className='guide-extras';extras.append(mapped[0],mapped[4]);layout.append(extras);
    const tools=document.createElement('div');tools.className='guide-quick-action';tools.innerHTML=`<a class="button primary" href="#application-card">Musterantrag öffnen ${icon('arrow')}</a><a class="text-link" href="#/leistungen">Leistungen ansehen ${icon('arrow')}</a>`;header.append(tools);
    root.querySelector('.content-grid').replaceWith(layout);
  }else if(route==='/faq'){
    header.querySelector('h1').textContent='Ihre Fragen. Klar beantwortet.';
    header.querySelector('.lead').remove();
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
    if(route==='/quellen'){
      const benefits=document.createElement('details');benefits.className='reference-section';benefits.innerHTML='<summary>Pflegeleistungen: Beträge und Quellen</summary><div class="reference-body prose"><p>Die Leistungsübersicht verwendet einen eigenen Datenstand vom 12.11.2026. Jede Leistung nennt in ihren aufklappbaren Details die amtliche Grundlage.</p><a class="text-link" href="#/leistungen">Leistungsübersicht öffnen →</a></div>';hub.append(benefits);
    }
    prose.replaceWith(hub);
  }
  return template.innerHTML;
}
