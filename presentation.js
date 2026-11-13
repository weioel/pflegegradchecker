import { icon, guideSteps, timeline, escapeHTML as esc } from './ui.js';

// Reorganizes the existing full editorial content without discarding legal text.
export function presentContent(route,markup){
  const template=document.createElement('template');template.innerHTML=markup;
  const root=template.content;
  const header=root.querySelector('.page-header');
  if(route==='/ratgeber'){
    header.classList.add('application-header');
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
      const summaries={1:'Bei Ihrer Krankenkasse oder privaten Pflegeversicherung beantragen.',2:'Medizinischer Dienst oder Medicproof prüft den Hilfebedarf.'};
      details.innerHTML=`<summary>${i>0&&i<4?`<span class="step-index">0${i}</span>`:''}<span class="step-summary"><strong>${titles[i]||data.title}</strong>${summaries[i]?`<span>${summaries[i]}</span>`:''}</span></summary><div class="guide-body prose">${section.innerHTML}</div>`;
      mapped.push(details);
    }
    const layout=document.createElement('div');layout.className='simple-guide application-guide';
    const primary=document.createElement('div');primary.className='application-main';
    primary.innerHTML='<div class="application-section-heading"><h2>Ihr Weg zum Pflegegrad</h2><span>3 Schritte</span></div>';
    const list=document.createElement('div');list.className='guide-steps';list.append(mapped[1],mapped[2],mapped[3]);primary.append(list);
    const extras=document.createElement('div');extras.className='guide-extras';extras.innerHTML='<h2>Gut zu wissen</h2>';extras.append(mapped[0],mapped[4]);
    const side=document.createElement('aside');side.className='application-side';side.setAttribute('aria-label','Hilfe für Ihren Antrag');
    const starter=document.createElement('div');starter.className='application-starter';
    starter.innerHTML=`<span class="application-tool-icon">${icon('document')}</span><p class="eyebrow">Ihr erster Schritt</p><h2>Der Anfang?<br>Ein kurzer Antrag.</h2><p>Nutzen Sie die Vorlage für Ihre Pflegeversicherung.</p><a class="button primary" href="#application-card">Musterantrag öffnen ${icon('arrow')}</a>`;
    if(application){application.id='application-card';application.className='application-template-panel';application.querySelector('summary').innerHTML='<span>Vorlage ansehen</span>';const download=document.createElement('button');download.className='button secondary';download.dataset.action='download-application';download.innerHTML=`${icon('download')} Als Textdatei herunterladen`;application.querySelector('[data-action="copy-application"]').after(download);starter.append(application);}
    side.append(starter);
    const next=document.createElement('a');next.className='application-benefits';next.href='#/leistungen';next.innerHTML=`<span class="application-tool-icon">${icon('wallet')}</span><span><strong>Welche Hilfe steht mir zu?</strong><span>Leistungen und Budgets ansehen</span></span>${icon('arrow')}`;side.append(next);
    layout.append(primary,side,extras);
    const tools=document.createElement('div');tools.className='guide-quick-action';tools.innerHTML=`<p>Vom ersten Antrag bis zum Bescheid.</p><a class="text-link" href="#guide-apply">Mit Schritt 1 beginnen ${icon('arrow')}</a>`;header.append(tools);
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
