import { RULESET, MODULES, QUESTIONS } from './data.js';

const range = (min,max=min)=>({min,max});
const questionById = new Map(QUESTIONS.map(q=>[q.id,q]));
export const round4 = value => Math.round((value + Number.EPSILON) * 10000) / 10000;

export function gradeForPoints(points) {
  if (!Number.isFinite(points) || points < 0 || points > 100) throw new RangeError('Gesamtpunkte müssen zwischen 0 und 100 liegen.');
  for (let grade=5;grade>=0;grade--) if (points >= RULESET.gradeThresholds[grade]) return grade;
}

export function weightedPoints(moduleId,raw) {
  const table=RULESET.tables[moduleId];
  if (!table || !Number.isInteger(raw) || raw<0 || raw>table.maxRaw) throw new RangeError('Ungültige Einzelpunktsumme.');
  return table.bands.find(([min,max])=>raw>=min && raw<=max)[2];
}

function countsFor(question,answer) {
  if (!answer || typeof answer!=='object' || Array.isArray(answer)) throw new TypeError(`${question.id}: Häufigkeit als Objekt erforderlich.`);
  const keys=question.type==='frequency'?['day','week','month']:['week','month'];
  if (question.type==='intensive' && answer.daily===true) {
    if (['day','week','month'].some(k=>(answer[k]??0)!==0)) throw new RangeError(`${question.id}: Täglich nicht zusätzlich zu anderen Einheiten eingeben.`);
    return {daily:true,day:0,week:0,month:0};
  }
  if (!keys.some(key=>Object.hasOwn(answer,key))) throw new TypeError(`${question.id}: Eine Häufigkeit fehlt.`);
  if (question.type!=='frequency' && (answer.day??0)!==0) throw new RangeError(`${question.id}: Keine Tagesanzahl vorgesehen.`);
  if (answer.daily!==undefined && answer.daily!==false) throw new RangeError(`${question.id}: Ungültige tägliche Häufigkeit.`);
  const counts={day:0,week:0,month:0};
  for (const key of keys) {
    const value=answer[key]??0;
    if (!Number.isSafeInteger(value) || value<0) throw new RangeError(`${question.id}: Nur nichtnegative ganze Häufigkeiten sind zulässig.`);
    counts[key]=value;
  }
  if(keys.filter(key=>counts[key]>0).length>1) throw new RangeError(`${question.id}: Genau eine Zeiteinheit verwenden (BRi S. 83).`);
  return counts;
}

export function isAnswered(id,answer) {
  const q=questionById.get(id);
  if(!q) throw new RangeError('Unbekanntes Kriterium.');
  if(answer===null || answer===undefined) return false;
  if(q.type==='choice') {
    if(!q.options.some(option=>option.value===answer)) throw new RangeError(`${id}: Ungültige Antwort.`);
    return true;
  }
  if(q.type==='continence') {
    if(typeof answer!=='object' || Array.isArray(answer)) throw new TypeError(`${id}: Anwendbarkeit muss angegeben werden.`);
    if(answer.eligible===false) return true;
    if(answer.eligible!==true && answer.eligible!==null && answer.eligible!==undefined) throw new TypeError(`${id}: Ungültige Anwendbarkeit.`);
    if(answer.value!==undefined && answer.value!==null && !q.options.some(option=>option.value===answer.value)) throw new RangeError(`${id}: Ungültige Antwort.`);
    return answer.eligible===true && answer.value!==undefined && answer.value!==null;
  }
  countsFor(q,answer);
  return true;
}

export function criterionRange(id,answer) {
  const q=questionById.get(id);
  if(!q || !['choice','continence'].includes(q.type)) throw new RangeError('Für Häufigkeitskriterien werden Gruppenpunkte berechnet.');
  const answered=isAnswered(id,answer);
  if(q.type==='choice') return answered?range(answer):range(0,Math.max(...q.options.map(o=>o.value)));
  if(answer?.eligible===false) return range(0);
  if(answer?.eligible===true && answered) return range(answer.value);
  return range(0,answer?.value??3);
}

function totalCounts(ids,answers) {
  const sum={day:0,week:0,month:0};
  let complete=true;
  for(const id of ids) {
    if(!isAnswered(id,answers[id])) {complete=false;continue;}
    const counts=countsFor(questionById.get(id),answers[id]);
    for(const unit of ['day','week','month']) {
      sum[unit]+=counts[unit];
      if(!Number.isSafeInteger(sum[unit])) throw new RangeError('Häufigkeitssumme ist zu groß.');
    }
  }
  // BRi 2026 p.108 fn.13: each calculation step rounded to four places.
  const dayAverage=round4(round4(sum.day+round4(sum.week/RULESET.module5.weekDivisor))+round4(sum.month/RULESET.module5.monthDivisor));
  return {sum,dayAverage,complete};
}

export function groupAPoints(average) {
  if(!Number.isFinite(average)||average<0) throw new RangeError('Ungültige Tageshäufigkeit.');
  const [one,three,eight]=RULESET.module5.groupA.thresholds;
  return average<one?0:average<=three?1:average<=eight?2:3;
}
export function groupBPoints(average) {
  if(!Number.isFinite(average)||average<0) throw new RangeError('Ungültige Tageshäufigkeit.');
  const [weekly,daily,three]=RULESET.module5.groupB.thresholds;
  return average<weekly?0:average<daily?1:average<three?2:3;
}
export function groupCPoints(value) {
  if(!Number.isFinite(value)||value<0) throw new RangeError('Ungültige Häufigkeitspunkte.');
  const config=RULESET.module5.groupC;
  const index=config.thresholds.findIndex(threshold=>value<threshold);
  return config.points[index===-1?config.points.length-1:index];
}

export function calculateModule5(answers={}) {
  const conf=RULESET.module5;
  const a=totalCounts(conf.groupA.ids,answers);
  const b=totalCounts(conf.groupB.ids,answers);
  const aPoints=range(groupAPoints(a.dayAverage),a.complete?groupAPoints(a.dayAverage):conf.groupA.max);
  const bPoints=range(groupBPoints(b.dayAverage),b.complete?groupBPoints(b.dayAverage):conf.groupB.max);
  let cValue=0,cComplete=true;
  const visits=[];
  for(const id of conf.groupC.ids) {
    if(!isAnswered(id,answers[id])) {cComplete=false;visits.push({id,known:false,value:null});continue;}
    const counts=countsFor(questionById.get(id),answers[id]), factors=conf.factors[id];
    const value=counts.daily?factors.day:round4(round4(counts.week*factors.week)+round4(counts.month*factors.month));
    cValue=round4(cValue+value);
    visits.push({id,known:true,value});
  }
  const cPoints=range(groupCPoints(cValue),cComplete?groupCPoints(cValue):conf.groupC.max);
  const diet=criterionRange('5.16',answers['5.16']);
  const groups=[
    {id:'5.1–5.7',title:'Medikation und körpernahe Maßnahmen',raw:aPoints,dayAverage:a.dayAverage,complete:a.complete,counts:a.sum},
    {id:'5.8–5.11',title:'Wundversorgung und häusliche Therapie',raw:bPoints,dayAverage:b.dayAverage,complete:b.complete,counts:b.sum},
    {id:'5.12–5.15',title:'Intensive Maßnahmen und begleitete Besuche',raw:cPoints,frequencyPoints:cValue,complete:cComplete,criteria:visits},
    {id:'5.16',title:'Diät und Verhaltensvorschriften',raw:diet,complete:isAnswered('5.16',answers['5.16'])},
  ];
  return {raw:range(groups.reduce((s,g)=>s+g.raw.min,0),groups.reduce((s,g)=>s+g.raw.max,0)),groups,sourceIds:conf.sourceIds};
}

export function calculate(answers={}, {adult=true}={}) {
  if(adult!==true) throw new RangeError('Dieser Rechner ist ausschließlich für Erwachsene ab 18 Jahren geeignet.');
  if(!answers || typeof answers!=='object' || Array.isArray(answers)) throw new TypeError('Antworten müssen als Objekt vorliegen.');
  const missingIds=QUESTIONS.filter(q=>!isAnswered(q.id,answers[q.id])).map(q=>q.id);
  const module5=calculateModule5(answers);
  const modules=MODULES.map(module=>{
    const raw=module.id===5?module5.raw:module.questions.reduce((sum,q)=>{
      const r=criterionRange(q.id,answers[q.id]);return range(sum.min+r.min,sum.max+r.max);
    },range(0));
    return {id:module.id,title:module.title,raw,weighted:range(weightedPoints(module.id,raw.min),weightedPoints(module.id,raw.max)),maxWeight:module.weight,maxRaw:RULESET.tables[module.id].maxRaw,complete:module.questions.every(q=>!missingIds.includes(q.id)),sourceIds:module.sourceIds};
  });
  const combined23=range(Math.max(modules[1].weighted.min,modules[2].weighted.min),Math.max(modules[1].weighted.max,modules[2].weighted.max));
  const total=[modules[0],modules[3],modules[4],modules[5]].reduce((sum,m)=>range(sum.min+m.weighted.min,sum.max+m.weighted.max),{...combined23});
  return {
    rulesetId:RULESET.id,complete:missingIds.length===0,answeredCount:QUESTIONS.length-missingIds.length,questionCount:QUESTIONS.length,missingIds,total,
    grade:range(gradeForPoints(total.min),gradeForPoints(total.max)),modules,combined23,
    details:{module5,criteria:QUESTIONS.filter(q=>q.type==='choice'||q.type==='continence').map(q=>({id:q.id,title:q.title,range:criterionRange(q.id,answers[q.id]),answered:isAnswered(q.id,answers[q.id])}))},
    exceptionNotice:'Besondere Bedarfskonstellationen können fachlich Pflegegrad 5 auch unter 90 Punkten begründen. Dieser Rechner entscheidet darüber nicht.',
  };
}
