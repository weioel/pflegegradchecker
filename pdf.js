import { MODULES, RULESET, SOURCES } from './data.js';
import { calculate, criterionRange } from './calculator.js';

// Small, dependency-free PDF writer. All text comes from local, versioned data.
// PDF standard Helvetica fonts use WinAnsi; an explicit ToUnicode CMap preserves
// German umlauts and other Windows-1252 characters when copying/searching text.
const WIDTHS = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,556,222,556,333,1000,556,556,333,1000,667,333,1000,556,611,556,556,222,222,333,333,350,556,1000,333,1000,500,333,944,556,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const BOLD_WIDTHS = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,611,278,556,500,1000,556,556,333,1000,667,333,1000,611,611,611,611,278,278,500,500,350,556,1000,333,1000,556,333,944,611,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];
const SPECIAL = {128:0x20ac,130:0x201a,131:0x0192,132:0x201e,133:0x2026,134:0x2020,135:0x2021,136:0x02c6,137:0x2030,138:0x0160,139:0x2039,140:0x0152,142:0x017d,145:0x2018,146:0x2019,147:0x201c,148:0x201d,149:0x2022,150:0x2013,151:0x2014,152:0x02dc,153:0x2122,154:0x0161,155:0x203a,156:0x0153,158:0x017e,159:0x0178};
const REVERSE_SPECIAL = new Map(Object.entries(SPECIAL).map(([byte,unicode])=>[unicode,Number(byte)]));
const W=595.28, H=841.89, M=48, CONTENT=W-2*M, BOTTOM=H-62;
const BLACK='0.067 0.067 0.067', GRAY='0.35 0.35 0.35', BLUE='0 0.7255 0.9686';
const DISCLAIMER='Dies ist eine unverbindliche Selbsteinschätzung. Der tatsächliche Pflegegrad wird durch die zuständige Pflegeversicherung auf Grundlage der Begutachtung festgestellt. Das Ergebnis kann von diesem Rechner abweichen.';
const number=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:4}).format(n);
const points=r=>r.min===r.max?number(r.min):`${number(r.min)} - ${number(r.max)}`;
const normalized=s=>String(s).normalize('NFC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u00a0\u202f]/g,' ').replace(/→/g,'->').replace(/↗/g,'').replace(/\r/g,'');
const byteFor=c=>{const u=c.codePointAt(0);return REVERSE_SPECIAL.get(u)??(u>=32&&u<=255?u:63);};
const hex=s=>[...normalized(s)].map(c=>byteFor(c).toString(16).padStart(2,'0')).join('');
const utf16=s=>'feff'+Array.from({length:s.length},(_,i)=>s.charCodeAt(i).toString(16).padStart(4,'0')).join('');
const metric=(text,size=10,bold=false)=>[...normalized(text)].reduce((sum,c)=>sum+((bold?BOLD_WIDTHS:WIDTHS)[byteFor(c)-32]??556),0)*size/1000;
const fixed=n=>Number(n.toFixed(3));

function linesFor(value,width=CONTENT,size=10,bold=false) {
  const lines=[];
  for(const paragraph of normalized(value).split('\n')) {
    let line='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)) {
      if(metric(word,size,bold)>width) {
        if(line){lines.push(line);line='';}
        for(const char of word) {
          if(metric(line+char,size,bold)>width){lines.push(line);line='';}
          line+=char;
        }
      } else if(line&&metric(`${line} ${word}`,size,bold)>width) {
        lines.push(line);line=word;
      } else line+=(line?' ':'')+word;
    }
    lines.push(line);
  }
  return lines;
}

function makeCMap() {
  const mappings=[];
  for(let n=32;n<=255;n++) mappings.push(`<${n.toString(16).padStart(2,'0')}> <${(SPECIAL[n]??n).toString(16).padStart(4,'0')}>`);
  let map='/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /CaroWinAnsiUnicode def\n/CMapType 2 def\n1 begincodespacerange\n<00> <ff>\nendcodespacerange\n';
  for(let n=0;n<mappings.length;n+=100){const block=mappings.slice(n,n+100);map+=`${block.length} beginbfchar\n${block.join('\n')}\nendbfchar\n`;}
  return map+'endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend';
}

class Report {
  constructor(date){this.pages=[];this.date=date;this.newPage();}
  newPage(){this.page={commands:[],links:[]};this.pages.push(this.page);this.y=78;this.text('caro / Pflegegradchecker',M,31,10,true);this.text('PERSÖNLICHE SELBSTEINSCHÄTZUNG',M,48,7,false,GRAY);this.rule(61);}
  ensure(height){if(this.y+height>BOTTOM)this.newPage();}
  text(text,x,y,size=10,bold=false,color=BLACK){this.page.commands.push(`BT /${bold?'F2':'F1'} ${size} Tf ${color} rg 1 0 0 1 ${fixed(x)} ${fixed(H-y-size)} Tm <${hex(text)}> Tj ET`);}
  rule(y=this.y){this.page.commands.push(`0.88 0.88 0.88 RG 0.5 w ${M} ${fixed(H-y)} m ${fixed(W-M)} ${fixed(H-y)} l S`);}
  rect(x,y,w,h,color){this.page.commands.push(`${color} rg ${fixed(x)} ${fixed(H-y-h)} ${fixed(w)} ${fixed(h)} re f`);}
  para(text,{size=10,bold=false,color=BLACK,width=CONTENT,x=M,leading=size*1.45,gap=8}={}){
    const lines=linesFor(text,width,size,bold);this.ensure(Math.min(lines.length*leading+gap,60));
    for(const line of lines){this.ensure(leading);this.text(line,x,this.y,size,bold,color);this.y+=leading;}
    this.y+=gap;return lines;
  }
  heading(text){const height=linesFor(text,CONTENT,16,true).length*22+14;this.ensure(height+40);this.y+=8;this.para(text,{size:16,bold:true,leading:22,gap:12});}
  source(title,url){this.ensure(60);this.para(title,{size:10,bold:true,gap:3});const lines=linesFor(url,CONTENT,8);for(const line of lines){this.ensure(13);this.text(line,M,this.y,8,false,GRAY);this.page.links.push({x:M,y:this.y,width:metric(line,8),height:12,url});this.y+=12;}this.y+=10;}
  finish(){for(let i=0;i<this.pages.length;i++){this.page=this.pages[i];this.rule(H-45);this.text(`Regelstand: 11.11.2026 | ${RULESET.version}`,M,H-34,8,false,GRAY);const label=`Seite ${i+1} von ${this.pages.length}`;this.text(label,W-M-metric(label,8),H-34,8,false,GRAY);}return this.pages;}
}

function durationText(value) {
  if(value===true||['yes','ja','long','six-months','6months'].includes(value))return 'Die Einschränkungen bestehen voraussichtlich mindestens sechs Monate (eigene Angabe).';
  if(value===false||['no','nein','short'].includes(value))return 'Die Dauer wurde mit unter sechs Monaten angegeben. Die gesetzliche Dauer-Voraussetzung ist damit nach dieser Angabe nicht erfüllt; die Punktzahl allein begründet keinen Pflegegradanspruch.';
  return 'Die voraussichtliche Dauer der Einschränkungen ist ungeklärt. Für Pflegebedürftigkeit müssen die gesetzlichen Voraussetzungen einschließlich der voraussichtlich mindestens sechsmonatigen Dauer geprüft werden.';
}

function answerText(q,answer) {
  if(answer===undefined||answer===null)return 'OFFEN / Ich bin mir nicht sicher';
  if(q.type==='choice')return q.options.find(o=>o.value===answer).label;
  if(q.type==='continence') {
    if(answer.eligible===false)return 'Nicht anwendbar: keine überwiegende/vollständige Inkontinenz oder künstliche Ableitung.';
    const label=q.options.find(o=>o.value===answer.value)?.label??'Hilfebedarf offen';
    return `${answer.eligible===true?'Voraussetzung trifft zu':'OFFEN: Anwendbarkeit ungeklärt'}; ${label}`;
  }
  if(answer.daily===true)return 'Täglich: zeit- und technikintensive Maßnahme mit personeller Unterstützung';
  const units={day:'pro Tag',week:'pro Woche',month:'pro Monat'};
  const nonzero=Object.entries(units).filter(([key])=>(answer[key]??0)>0);
  if(!nonzero.length)return 'Keine zu berücksichtigende personelle Hilfe: entfällt oder selbstständig (Häufigkeit 0).';
  return nonzero.map(([key,label])=>`${number(answer[key])} ${label} mit notwendiger personeller Hilfe`).join('; ');
}

function writePDF(pages,date) {
  const objects=[null];
  const add=value=>{objects.push(value);return objects.length-1;};
  const catalog=add(''),rootPages=add('');
  const cmap=makeCMap(),cmapId=add(`<< /Length ${cmap.length} >>\nstream\n${cmap}\nendstream`);
  const font1=add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /ToUnicode ${cmapId} 0 R >>`);
  const font2=add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding /ToUnicode ${cmapId} 0 R >>`);
  const kids=[];
  for(const page of pages){
    const stream=page.commands.join('\n');
    const contents=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const annotations=page.links.map(link=>add(`<< /Type /Annot /Subtype /Link /Rect [${fixed(link.x)} ${fixed(H-link.y-link.height)} ${fixed(link.x+link.width)} ${fixed(H-link.y)}] /Border [0 0 0] /A << /S /URI /URI <${hex(link.url)}> >> >>`));
    kids.push(add(`<< /Type /Page /Parent ${rootPages} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contents} 0 R${annotations.length?` /Annots [${annotations.map(n=>`${n} 0 R`).join(' ')}]`:''} >>`));
  }
  objects[rootPages]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(n=>`${n} 0 R`).join(' ')}] >>`;
  objects[catalog]=`<< /Type /Catalog /Pages ${rootPages} 0 R /Lang (de-DE) >>`;
  const timestamp=date.toISOString().replace(/[-:T]/g,'').slice(0,14);
  const info=add(`<< /Title <${utf16('Pflegegrad-Selbsteinschätzung')}> /Author (Caro Pflegegradchecker) /Subject <${utf16('Unverbindliches Ergebnis, Modulwerte und vollständige Antworten')}> /Creator (Caro Pflegegradchecker - lokale PDF-Erstellung) /CreationDate (D:${timestamp}Z) >>`);
  let pdf='%PDF-1.7\n% Caro local report\n';
  const offsets=[0];
  for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}
  const xref=pdf.length;
  pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('');
  pdf+=`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

/** Return a complete PDF as bytes. Pure and safe to call in Node or a browser. */
export function generateResultPDF(result,answers={},options={}) {
  const current=calculate(answers);
  if(result && (result.rulesetId!==current.rulesetId || result.total.min!==current.total.min || result.total.max!==current.total.max || result.answeredCount!==current.answeredCount))throw new Error('Ergebnis und Antworten stimmen nicht überein. Bitte Ergebnis neu berechnen.');
  result=current;
  const date=options.createdAt instanceof Date?options.createdAt:new Date(options.createdAt??Date.now());
  if(Number.isNaN(date.getTime()))throw new RangeError('Ungültiges Erstellungsdatum.');
  const report=new Report(date);
  report.para('Ihr Ergebnis im Überblick',{size:25,bold:true,leading:32,gap:8});
  report.para(`Erstellt am ${new Intl.DateTimeFormat('de-DE',{dateStyle:'long'}).format(date)} | Für Erwachsene ab 18 Jahren`,{size:9,color:GRAY,gap:20});
  const score=result.complete?points(result.total):`${number(result.total.min)} - ${number(result.total.max)}`;
  report.para(score,{size:44,bold:true,leading:52,gap:0});
  report.para(`${result.complete?'Gesamtpunkte':'Möglicher Punktebereich'} von 100`,{size:11,color:GRAY,gap:14});
  const gradeLabel=g=>g===0?'Kein Pflegegrad nach Punkten':`Pflegegrad ${g}`;
  const grade=result.grade.min===result.grade.max?gradeLabel(result.grade.min):`${gradeLabel(result.grade.min)} bis Pflegegrad ${result.grade.max}`;
  report.para(`${result.complete?'Rechnerisches Ergebnis':'Rechnerischer Bereich'}: ${grade}`,{size:14,bold:true,leading:19,gap:12});
  report.para(`${result.answeredCount} von ${result.questionCount} Kriterien beantwortet.${result.complete?'':' Offene Angaben: '+result.missingIds.join(', ')+'. Der Bereich ist keine Wahrscheinlichkeit.'}`,{size:9,color:GRAY,gap:12});
  report.para(durationText(options.duration),{size:9,gap:14});
  report.heading('Die sechs Module');
  report.text('Modul',M,report.y,8,true,GRAY);report.text('Einzelpunkte',358,report.y,8,true,GRAY);report.text('Gewichtet / max.',445,report.y,8,true,GRAY);report.y+=20;
  for(const m of result.modules){
    report.ensure(44);
    const name=MODULES.find(item=>item.id===m.id).shortTitle;
    report.text(`${m.id}  ${name}`,M,report.y,10,true);
    report.text(`${points(m.raw)} / ${m.maxRaw}`,358,report.y,9);
    report.text(`${points(m.weighted)} / ${m.maxWeight}`,445,report.y,9);
    report.y+=19;report.rect(M,report.y,270,3,'0.93 0.93 0.93');
    if(m.weighted.max>0)report.rect(M,report.y,270*m.weighted.max/m.maxWeight,3,'0.76 0.91 0.97');
    if(m.weighted.min>0)report.rect(M,report.y,270*m.weighted.min/m.maxWeight,3,BLUE);
    report.y+=19;
  }
  report.para(`M2/M3 gemeinsam: ${points(result.combined23)} von maximal 15 Punkten. Es zählt ausschließlich der höhere gewichtete Wert, nicht die Summe.`,{size:9,gap:7});
  report.para('Balken: kräftig = Untergrenze, hell = möglicher zusätzlicher Bereich. Jeder Balken zeigt den Anteil am Maximum seines Moduls.',{size:8,color:GRAY,gap:14});
  report.rule();report.y+=12;report.para(DISCLAIMER,{size:9,leading:13,gap:7});

  report.newPage();report.heading('Einordnung und nächste Schritte');
  report.para(result.total.max<12.5?'Die angegebenen Einschränkungen erreichen nach der regulären Punkteberechnung derzeit keine Pflegegradgrenze. Wenn im Alltag dennoch Hilfe nötig ist, kann eine Pflegeberatung die Situation und weitere Unterstützungsmöglichkeiten klären.':'Die Angaben zeigen Einschränkungen, bei denen ein Antrag oder eine fachliche Prüfung sinnvoll sein kann. Die Pflegeversicherung entscheidet über die Anerkennung und die konkreten Leistungen.');
  if(!result.complete)report.para('Der Selbstcheck ist nicht vollständig. Klären Sie insbesondere die als offen markierten Kriterien. Die unteren und oberen Werte ergeben sich aus den jeweils kleinsten und größten zulässigen Bewertungen der fehlenden Angaben. Auch bei identischen Grenzen bleibt eine unvollständige Erfassung unvollständig.');
  report.para('1. Antrag bei der Pflegekasse Ihrer Krankenkasse beziehungsweise bei Ihrer privaten Pflegepflichtversicherung stellen und Eingang bestätigen lassen.');
  report.para('2. Begutachtung vorbereiten: typische Alltagssituationen notieren, Medikamentenplan und vorhandene Arztberichte bereitlegen, eine vertraute Person hinzuziehen.');
  report.para('3. Pflegeberatung nutzen. Bei bestehendem Pflegegrad und dauerhaft zunehmendem Hilfebedarf eine Höherstufung prüfen.');
  report.para(result.exceptionNotice,{bold:true});
  report.para('Der Rechner prüft keine Versicherungszeiten oder individuellen Leistungsansprüche. Die Angaben zur Dauer ersetzen keine fachliche Prognose. Dieser Bericht kann als Gesprächsgrundlage dienen.');
  report.heading('Rechenweg für Krankheiten und Therapien');
  for(const group of result.details.module5.groups){
    const detail=group.dayAverage!==undefined?`Bekannte Tageshäufigkeit: ${number(group.dayAverage)}.`:group.frequencyPoints!==undefined?`Bekannte Häufigkeits-Zwischensumme: ${number(group.frequencyPoints)}.`:'Bewertung der Diät- und Verhaltensvorgaben.';
    report.para(`${group.id}: ${group.title}`,{size:10,bold:true,gap:3});
    report.para(`${detail} Gruppenpunkte: ${points(group.raw)}.${group.complete?'':' Mindestens eine Angabe ist offen.'}`,{size:9,color:GRAY,gap:10});
  }
  report.para(`Summe der Gruppen: ${points(result.details.module5.raw)} Einzelpunkte. Daraus folgen ${points(result.modules[4].weighted)} gewichtete Punkte gemäß Anlage 2.`,{size:10,bold:true});
  report.para('Bei Häufigkeitskriterien gibt es keine pauschalen Punkte je Antwort. Die Gruppenbildung verhindert eine falsche Addition. Der vollständige Rechenweg steht in den Begutachtungs-Richtlinien, Abschnitt 5.10.1.',{size:9,color:GRAY});

  report.newPage();report.para('Ihre Antworten',{size:25,bold:true,leading:32,gap:8});
  report.para('Alle 64 Kriterien. OFFEN kennzeichnet Unsicherheit oder fehlende Informationen. Die folgenden Punkte sind Rohpunkte vor der Modulgewichtung.',{size:10,color:GRAY,gap:14});
  for(const module of MODULES){
    report.heading(`Modul ${module.id}: ${module.title}`);
    const moduleResult=result.modules.find(item=>item.id===module.id);
    report.para(`${points(moduleResult.raw)} Einzelpunkte | ${points(moduleResult.weighted)} von ${module.weight} gewichteten Punkten`,{size:9,color:GRAY,gap:12});
    for(const q of module.questions){
      const answer=answerText(q,answers[q.id]);
      const scoreText=['choice','continence'].includes(q.type)?`Einzelpunkte: ${points(criterionRange(q.id,answers[q.id]))}`:'Häufigkeitsangabe; Punkte über die Modul-5-Gruppe.';
      const title=`${q.id}  ${q.title}`;
      const titleHeight=linesFor(title,CONTENT,10,true).length*14;
      const answerHeight=linesFor(answer,CONTENT,9).length*13;
      report.ensure(titleHeight+answerHeight+30);
      report.para(title,{size:10,bold:true,leading:14,gap:3});
      report.para(answer,{size:9,leading:13,gap:3});
      report.para(scoreText,{size:8,color:GRAY,leading:11,gap:10});
    }
  }
  report.newPage();report.heading('Quellen und Methodik');
  report.para(`Regelversion: ${RULESET.id}. Recherchestand: 11. November 2026. Begutachtungs-Richtlinien vom 26. August 2026, genehmigt am 28. September 2026, gültig seit 1. Oktober 2026.`);
  report.para('Berechnung: M1 + max(M2, M3) + M4 + M5 + M6. Die Rohpunktsummen werden über die gesetzlichen Tabellen in gewichtete Punkte umgerechnet. Außerhäusliche Aktivitäten und Haushaltsführung erhalten keine zusätzlichen Punkte.');
  report.para('Geltende Grenzen: unter 12,5 = kein Pflegegrad nach Punkten; ab 12,5 = Pflegegrad 1; ab 27 = Pflegegrad 2; ab 47,5 = Pflegegrad 3; ab 70 = Pflegegrad 4; ab 90 = Pflegegrad 5. Jede Stufe reicht bis unter die nächste Grenze; maximal sind 100 Punkte möglich.');
  report.para('Das Pflegeneuordnungsgesetz (PNOG) ist zum Recherchestand noch ein Gesetzentwurf. Geplante Reformwerte sind in diesem Bericht nicht enthalten.');
  for(const id of ['sgb14','sgb15','annex1','annex2','bri2026'])report.source(SOURCES[id].title,SOURCES[id].url);
  report.source('Bundesgesundheitsministerium: Antragstellung und Begutachtung','https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/pflegebeduerftig-was-nun');
  report.para('Datenschutz: Dieser Bericht wurde lokal im Browser erstellt. Die Gesundheitsantworten wurden für den Export nicht an einen Server übertragen. Bewahren Sie die Datei sicher auf und entscheiden Sie selbst, mit wem Sie sie teilen.',{size:9,color:GRAY,gap:14});
  report.para(DISCLAIMER,{size:9,leading:13});
  return writePDF(report.finish(),date);
}

/** Create a local download. No fetch, analytics, API, or server upload is involved. */
export function exportResultPDF(result,answers,options={}) {
  const bytes=generateResultPDF(result,answers,options);
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download='pflegegrad-selbsteinschaetzung.pdf';link.style.display='none';
  document.body.appendChild(link);
  try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return bytes;
}
