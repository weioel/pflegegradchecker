// Informational comparison only. Nothing in this file feeds the adult self-check.
import { RULESET } from './data.js';
export const REFORM_VERSION={id:'pnog-bt21-8869-2026-11-12-v1',checkedAt:'2026-11-12',draftDate:'2026-11-02',status:'draft',plannedStart:'2027-01-01',currentLawVersion:'Art. 2c G vom 24.07.2026, BGBl. I Nr. 228; Bek. vom 16.09.2026 berücksichtigt'};
export const REFORM_SOURCES={
  current:{title:'§ 15 SGB XI: geltende Grenzen und Gewichtungen',url:'https://www.gesetze-im-internet.de/sgb_11/__15.html'},
  tables:{title:'Anlage 2 zu § 15 SGB XI: geltende Umrechnung',url:'https://www.gesetze-im-internet.de/sgb_11/anlage_2.html'},
  consolidated:{title:'Amtliche Gesamtfassung SGB XI, § 15 und Anlage 2 (S. 29–30, 177–178)',url:'https://www.gesetze-im-internet.de/sgb_11/SGB_11.pdf'},
  criteria:{title:'Anlage 1 zu § 15 SGB XI: Einzelkriterien',url:'https://www.gesetze-im-internet.de/sgb_11/anlage_1.html'},
  guideline:{title:'Begutachtungs-Richtlinien vom 26.08.2026, gültig seit 01.10.2026',url:'https://www.medizinischerdienst.de/fileadmin/MD-zentraler-Ordner/Downloads/01_Pflegebegutachtung/261016_MDB_48_002_RICHTLINIE_PFLEGE_2026_16.pdf'},
  draft:{title:'Regierungsentwurf BT-Drs. 21/8869: Grenzen S. 28, Übergang S. 52–53, Anlage 2 S. 54, Inkrafttreten S. 61',url:'https://dserver.bundestag.de/btd/21/088/2108869.pdf'},
  debate:{title:'Bundestag: erste Lesung und Ausschussüberweisung am 05.11.2026',url:'https://www.bundestag.de/dokumente/textarchiv/2026/kw45-de-pflegeneuordnungsgesetz-1225076'},
  hearing:{title:'Bundestag: Anhörung für den 25.11.2026 angekündigt',url:'https://www.bundestag.de/presse/hib/kurzmeldungen-1231090'},
  bmg:{title:'BMG: Fragen zum PNOG-Entwurf',url:'https://www.bundesgesundheitsministerium.de/service/gesetze-und-verordnungen/guv-21-lp/pnog'}
};
export const SCENARIOS={
  current:{id:'current',label:'2026 · geltendes Recht',short:'Heute',thresholds:RULESET.gradeThresholds,tables:RULESET.tables,sourceIds:['current','tables','consolidated']},
  draft:{id:'draft',label:'2027 · Gesetzentwurf',short:'Im Entwurf',thresholds:[0,15,30,50,70,90],sourceIds:['draft'],tables:{
    1:{maxRaw:15,bands:[[0,1,0],[2,3,2.5],[4,6,5],[7,9,7.5],[10,15,10]],source:'draft',page:54},
    2:{maxRaw:33,bands:[[0,1,0],[2,5,3.75],[6,10,7.5],[11,16,11.25],[17,33,15]],source:'draft',page:54},
    3:{maxRaw:65,bands:[[0,0,0],[1,2,3.75],[3,4,7.5],[5,6,11.25],[7,65,15]],source:'draft',page:54},
    4:{maxRaw:54,bands:[[0,3,0],[4,9,10],[10,24,20],[25,39,30],[40,54,40]],source:'draft',page:54},
    5:{maxRaw:15,bands:[[0,0,0],[1,1,5],[2,3,10],[4,5,15],[6,15,20]],source:'draft',page:54},
    6:{maxRaw:18,bands:[[0,1,0],[2,3,3.75],[4,6,7.5],[7,11,11.25],[12,18,15]],source:'draft',page:54}
  }}
};
export const WEIGHT_GROUPS=[
  {id:'1',modules:[1],weight:10,draftWeight:10,tone:'ice',label:'Mobilität'},
  {id:'23',modules:[2,3],weight:15,draftWeight:15,tone:'lavender',label:'Verstehen & Verhalten'},
  {id:'4',modules:[4],weight:40,draftWeight:40,tone:'sage',label:'Selbstversorgung'},
  {id:'5',modules:[5],weight:20,draftWeight:20,tone:'cream',label:'Krankheit & Therapie'},
  {id:'6',modules:[6],weight:15,draftWeight:15,tone:'stone',label:'Alltag & Kontakte'}
];
export const REFORM_MODULES=[
  {id:1,label:'Mobilität',title:'Mobilität',description:'Die eigene Lage verändern, aufstehen, sich fortbewegen und Treppen steigen.'},
  {id:2,label:'Verstehen & Sprechen',title:'Kognitive und kommunikative Fähigkeiten',description:'Sich orientieren, erinnern, Entscheidungen treffen und sich verständigen.'},
  {id:3,label:'Verhalten & Psyche',title:'Verhaltensweisen und psychische Problemlagen',description:'Wie häufig Unterstützung wegen bestimmter Verhaltensweisen oder psychischer Problemlagen nötig ist.'},
  {id:4,label:'Selbstversorgung',title:'Selbstversorgung',description:'Waschen, anziehen, essen, trinken und die Toilette nutzen. Dieser Bereich hat den größten Anteil.'},
  {id:5,label:'Krankheit & Therapie',title:'Umgang mit krankheits- und therapiebedingten Anforderungen',description:'Unterstützung bei ärztlich angeordneten Maßnahmen, Medikamenten, Behandlungen und notwendigen Besuchen.'},
  {id:6,label:'Alltag & Kontakte',title:'Alltagsgestaltung und soziale Kontakte',description:'Den Tag gestalten, sich beschäftigen, ruhen, planen und Kontakte pflegen.'}
];
function scenario(id){const value=SCENARIOS[id];if(!value)throw new RangeError('Unbekannter Regelstand');return value;}
export function comparisonGrade(points,id){
  if(!Number.isFinite(points)||points<0||points>100)throw new RangeError('Punkte müssen zwischen 0 und 100 liegen.');
  const thresholds=scenario(id).thresholds;let grade=0;for(let i=1;i<thresholds.length;i++)if(points>=thresholds[i])grade=i;return grade;
}
export function compareThresholds(points){return {points,current:comparisonGrade(points,'current'),draft:comparisonGrade(points,'draft')};}
export function comparisonModulePoints(module,raw,id){
  const table=scenario(id).tables[module];if(!table||!Number.isInteger(raw)||raw<0||raw>table.maxRaw)throw new RangeError('Ungültige Einzelpunktsumme.');
  return table.bands.find(([low,high])=>raw>=low&&raw<=high)[2];
}
export function compareModule(module,raw){const current=comparisonModulePoints(module,raw,'current'),draft=comparisonModulePoints(module,raw,'draft');return {module,raw,current,draft,difference:Math.round((draft-current)*100)/100};}
export function newReformState(){return {points:28,highlight:'current',module:4,raw:{1:6,2:6,3:3,4:8,5:3,6:1},weightModule:4};}
