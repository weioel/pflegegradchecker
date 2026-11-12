// Presentation helpers only. No scoring rules or response state.
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function icon(name, className='') {
  const paths={
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    diagonal:'<path d="M6 18 18 6M6 6h12v12"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    document:'<path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 5 2 2 5-5"/>',
    calculator:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1"/>',
    chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V7a4 4 0 0 1 4-4h6a8 8 0 0 1 8 8Z"/><path d="M7 9h10M7 13h7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
    heart:'<path d="M20.5 5.5a5 5 0 0 0-7.1 0L12 7l-1.4-1.5a5 5 0 0 0-7.1 7.1L12 21l8.5-8.4a5 5 0 0 0 0-7.1Z"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.info}</svg>`;
}
export const guideSteps=[
  {id:'guide-check',title:'Voraussetzungen prüfen',short:'Prüfen',summary:'Brauchen Sie voraussichtlich mindestens sechs Monate Hilfe?',icon:'user'},
  {id:'guide-apply',title:'Antrag stellen',short:'Beantragen',summary:'Ein formloser Antrag bei Ihrer Pflegeversicherung genügt zunächst.',icon:'document'},
  {id:'guide-prepare',title:'Begutachtung vorbereiten',short:'Vorbereiten',summary:'Unterlagen bereitlegen. Den Alltag realistisch beschreiben.',icon:'calendar'},
  {id:'guide-decision',title:'Bescheid verstehen',short:'Prüfen lassen',summary:'Gutachten und Entscheidung der Pflegeversicherung prüfen.',icon:'layers'},
  {id:'guide-objection',title:'Nächste Schritte wählen',short:'Weitergehen',summary:'Bei Bedarf: Überprüfung, Widerspruch oder Höherstufung.',icon:'arrow'},
];
export function timeline(){return `<nav class="step-timeline" aria-label="Die fünf Schritte zum Pflegegrad"><ol>${guideSteps.map((s,i)=>`<li><a href="#${s.id}"><span class="timeline-number">0${i+1}</span><span>${s.short}</span>${i<4?icon('arrow'):icon('check')}</a></li>`).join('')}</ol></nav>`;}
