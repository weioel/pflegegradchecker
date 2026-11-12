// Independent, versioned benefits catalogue. Never used by the scoring engine.
// Amount arrays are ordered Pflegegrad 1, 2, 3, 4, 5. null = no separate entitlement.
export const BENEFIT_RULESET={id:'de-sgbxi-benefits-2026-11-12-v2',checkedAt:'2026-11-12',status:'current',label:'Geltendes Recht · geprüft am 12.11.2026',reformStatus:'draft',reformCheckedAt:'2026-11-12'};
const law=(section,title)=>({title:`§ ${section} SGB XI – ${title}`,url:`https://www.gesetze-im-internet.de/sgb_11/__${section}.html`,checkedAt:BENEFIT_RULESET.checkedAt});
export const BENEFIT_SOURCES={
  private:law('23','Private Pflegepflichtversicherung'),
  cash:law('37','Pflegegeld'),services:law('36','Pflegesachleistungen'),combination:law('38','Kombinationsleistung'),relief:law('45b','Entlastungsbetrag'),conversion:law('45a','Umwandlungsanspruch'),replacement:law('39','Verhinderungspflege'),shortTerm:law('42','Kurzzeitpflege'),annual:law('42a','Gemeinsamer Jahresbetrag'),day:law('41','Tages- und Nachtpflege'),aids:law('40','Pflegehilfsmittel und Wohnumfeld'),residential:law('43','Vollstationäre Pflege'),surcharge:law('43c','Zuschlag zum Eigenanteil'),digital:law('40b','Digitale Pflegeanwendungen'),group:law('45f','Ambulant betreute Wohngruppen'),groupStart:law('45g','Gründung einer Wohngruppe'),sharedHome:law('45h','Gemeinschaftliche Wohnformen'),advice:law('7a','Pflegeberatung'),courses:law('45','Pflegekurse'),
  housingGuide:{title:'BMG: Ratgeber Demenz – Wohnraumanpassung',url:'https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/5_Publikationen/Pflege/Broschueren/BMG_Ratgeber_Demenz_bf.pdf',checkedAt:BENEFIT_RULESET.checkedAt},
  overview:{title:'BMG: Leistungsansprüche 2026 (Dokumentstand 04.11.2025)',url:'https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/P/Pflegeversicherung_Leistungsbeitraege/Uebersicht_Leistungsbetraege_2026.pdf',checkedAt:BENEFIT_RULESET.checkedAt},
  reform:{title:'Bundestag: erste Lesung des PNOG am 05.11.2026',url:'https://www.bundestag.de/dokumente/textarchiv/2026/kw45-de-pflegeneuordnungsgesetz-1225076',checkedAt:BENEFIT_RULESET.checkedAt}
};
export const GRADES=[
  {grade:1,short:'Geringe Einschränkungen',description:'Die Selbstständigkeit ist gering beeinträchtigt.'},
  {grade:2,short:'Erhebliche Einschränkungen',description:'Die Selbstständigkeit ist erheblich beeinträchtigt.'},
  {grade:3,short:'Schwere Einschränkungen',description:'Die Selbstständigkeit ist schwer beeinträchtigt.'},
  {grade:4,short:'Schwerste Einschränkungen',description:'Die Selbstständigkeit ist schwerst beeinträchtigt.'},
  {grade:5,short:'Besonders hoher Pflegebedarf',description:'Schwerste Beeinträchtigungen mit besonderen Anforderungen an die pflegerische Versorgung.'}
];
const all=n=>[n,n,n,n,n];
export const BENEFITS=[
  {id:'cash',title:'Pflegegeld',amounts:[null,347,599,800,990],unit:'month',kind:'cash',category:'home',tone:'sage',icon:'user',cap:false,tag:'Auszahlung für selbst organisierte Pflege',sources:['cash','combination'],details:[
    'Für die Pflege zu Hause, zum Beispiel durch Angehörige. Das Geld wird an die pflegebedürftige Person ausgezahlt. Sie entscheidet über die Verwendung zur Sicherstellung ihrer Pflege; Einzelbelege sind dafür grundsätzlich nicht nötig.',
    'Wer daneben Pflegesachleistungen nutzt, erhält nur anteiliges Pflegegeld. Bei Pflegegeldbezug ist in den Pflegegraden 2 bis 5 halbjährlich ein Beratungseinsatz erforderlich; bei Pflegegrad 4 und 5 ist er zusätzlich vierteljährlich möglich. Für Teilmonate und Pflegeunterbrechungen gelten besondere Regeln.'
  ]},
  {id:'services',title:'Ambulanter Pflegedienst',amounts:[null,796,1497,1859,2299],unit:'month',kind:'service',category:'home',tone:'ice',icon:'heart',cap:true,tag:'Pflegesachleistung · keine Auszahlung',sources:['services','combination'],details:[
    'Für körperbezogene Pflege, Betreuung und Hilfe im Haushalt durch zugelassene Dienste zu Hause. Die gesetzliche Pflegekasse rechnet in der Regel direkt mit dem Dienst ab; in der privaten Pflegepflichtversicherung erfolgt die Abrechnung über den Versicherer.',
    'Das ist der monatliche Höchstbetrag. Kosten darüber hinaus tragen Sie grundsätzlich selbst. Pflegegeld und Sachleistung sind anteilig kombinierbar, aber nicht beide in voller Höhe.'
  ]},
  {id:'relief',title:'Unterstützung im Alltag',amounts:all(131),unit:'month',kind:'reimbursement',category:'home',tone:'lavender',icon:'chat',cap:true,tag:'Entlastungsbetrag · gegen Belege',sources:['relief'],details:[
    'Für anerkannte Angebote zur Unterstützung im Alltag, etwa Betreuung oder Haushaltshilfe, sowie bestimmte Kosten für Tages-, Nacht- oder Kurzzeitpflege und ambulante Pflegedienste. Nicht jede privat organisierte Hilfe ist erstattungsfähig: Die Anerkennung des Angebots vorher prüfen.',
    'Bei Pflegegrad 1 sind auch Leistungen ambulanter Pflegedienste zur Selbstversorgung möglich. Bei Pflegegrad 2 bis 5 sind diese Leistungen, etwa Hilfe beim Waschen, vom Entlastungsbetrag ausgenommen.',
    'Die Pflegeversicherung erstattet geeignete Kosten gegen Belege. Nicht verbrauchte Beträge können bis zum Ende des folgenden Kalenderhalbjahres genutzt werden. Der Entlastungsbetrag kürzt das Pflegegeld nicht.'
  ]},
  {id:'annual',title:'Verhinderungs- & Kurzzeitpflege',amounts:[null,3539,3539,3539,3539],unit:'year',kind:'reimbursement',category:'home',tone:'cream',icon:'calendar',cap:true,tag:'Ein gemeinsames Budget für beide',sources:['annual','replacement','shortTerm','cash'],details:[
    'Der gemeinsame Jahresbetrag finanziert Ersatzpflege, wenn die private Pflegeperson verhindert ist, und vorübergehende stationäre Kurzzeitpflege, wenn die Versorgung zu Hause nicht ausreicht. Beide Leistungen teilen sich den Betrag; er steht nicht zweimal zur Verfügung.',
    'Verhinderungspflege und Kurzzeitpflege sind jeweils auf bis zu acht Wochen pro Kalenderjahr begrenzt. Für Verhinderungspflege ist keine sechsmonatige Vorpflegezeit mehr nötig. Bei Kurzzeitpflege sind Unterkunft, Verpflegung und Investitionskosten grundsätzlich selbst zu tragen; geeignete Kosten können gegebenenfalls aus dem Entlastungsbetrag erstattet werden.',
    'Bei nicht erwerbsmäßiger Ersatzpflege durch Angehörige bis zum zweiten Grad oder Haushaltsmitglieder gilt regelmäßig höchstens das Zweifache des monatlichen Pflegegeldes. Nachgewiesene notwendige Zusatzkosten können darüber hinaus erstattet werden, zusammen höchstens bis zum verfügbaren Jahresbetrag.',
    'Während beider Pflegearten wird grundsätzlich die Hälfte des bisherigen Pflegegeldes für jeweils bis zu acht Wochen weitergezahlt. Bei stundenweiser Verhinderung gelten Besonderheiten; die Pflegeversicherung kann den konkreten Fall klären. Ersatzpflegekosten müssen spätestens bis Ende des folgenden Kalenderjahres mit Nachweisen zur Erstattung beantragt werden.'
  ]},
  {id:'day',title:'Tages- & Nachtpflege',amounts:[null,721,1357,1685,2085],unit:'month',kind:'service',category:'extra',tone:'ice',icon:'clock',cap:true,tag:'Pflege in einer Einrichtung',sources:['day','group'],details:[
    'Wenn die häusliche Pflege ergänzt oder gestärkt werden muss: für Pflege, Betreuung, notwendige Behandlungspflege und die erforderliche Beförderung. Unterkunft, Verpflegung und Investitionskosten sind grundsätzlich nicht enthalten.',
    'Zusätzlich zu Pflegegeld oder ambulanter Sachleistung nutzbar, ohne deren Kürzung. In ambulant betreuten Wohngruppen mit Wohngruppenzuschlag ist zusätzlich eine Prüfung des Bedarfs durch den Medizinischen Dienst erforderlich.'
  ]},
  {id:'aids',title:'Pflegehilfsmittel',amounts:all(42),unit:'month',kind:'reimbursement',category:'extra',tone:'sage',icon:'shield',cap:true,tag:'Zum Verbrauch · keine Geldpauschale',sources:['aids'],details:[
    'Für notwendige Verbrauchsprodukte zur Pflege zu Hause, etwa Einmalhandschuhe oder geeignete Desinfektionsmittel. Die Versorgung wird bewilligt und über einen Anbieter abgerechnet oder gegen Belege erstattet. Ein Pflegegrad allein bedeutet nicht, dass alle Produkte benötigt werden.',
    'Technische Pflegehilfsmittel, etwa ein Pflegebett, gehören nicht in dieses 42-Euro-Budget. Sie werden bei Bedarf gesondert geprüft und möglichst leihweise bereitgestellt. Für Erwachsene beträgt die Zuzahlung grundsätzlich 10 Prozent, höchstens 25 Euro je Hilfsmittel; Befreiungen sind möglich. Zuständigkeiten von Kranken- und Pflegeversicherung sind abzugrenzen.'
  ]},
  {id:'home',title:'Wohnung anpassen',amounts:all(4180),unit:'measure',kind:'grant',category:'extra',tone:'cream',icon:'home',cap:true,tag:'Zuschuss je bewilligter Maßnahme',sources:['aids','housingGuide'],details:[
    'Zum Beispiel für einen barrierearmen Badumbau, wenn dadurch die Pflege zu Hause ermöglicht oder erheblich erleichtert oder die Selbstständigkeit wiederhergestellt wird. Vor dem Umbau Antrag und Kostenplanung mit der Pflegeversicherung klären.',
    'Kein jährliches Budget und nicht automatisch je einzelner Baumaßnahme: Bei mehreren Anspruchsberechtigten in einer Wohnung sind insgesamt höchstens 16.720 Euro je gemeinsamer Maßnahme möglich.'
  ]},
  {id:'residential',title:'Vollstationäre Pflege',amounts:[131,805,1319,1855,2096],unit:'month',kind:'service',category:'residential',tone:'lavender',icon:'home',cap:false,tag:'Zuschuss zu den Pflegekosten',sources:['residential','surcharge'],details:[
    'Für die pflegebedingten Kosten einschließlich Betreuung und medizinischer Behandlungspflege in einer zugelassenen vollstationären Pflegeeinrichtung. Bei Pflegegrad 1 handelt es sich um einen Zuschuss von 131 Euro.',
    'Die Pflegeversicherung bezahlt nicht die ganze Heimrechnung. Unterkunft, Verpflegung, Investitionskosten und verbleibende Pflegekosten tragen Sie grundsätzlich selbst. Die häuslichen Monatsleistungen kommen bei dauerhafter vollstationärer Versorgung nicht einfach zusätzlich hinzu.',
    'Ab Pflegegrad 2 gibt es zusätzlich einen Zuschlag zum pflegebedingten Eigenanteil: 15 Prozent bis einschließlich 12 Monate, 30 Prozent nach 12, 50 Prozent nach 24 und 75 Prozent nach 36 Monaten Leistungsbezug. Das gilt nicht für die gesamte Heimrechnung; Unterkunft, Verpflegung und Investitionskosten sind davon ausgenommen.'
  ]}
];
export function benefitById(id){return BENEFITS.find(b=>b.id===id);}
export function benefitAmount(id,grade){if(!Number.isInteger(grade)||grade<1||grade>5)throw new RangeError('Pflegegrad muss zwischen 1 und 5 liegen.');const b=benefitById(id);if(!b)throw new RangeError('Unbekannte Leistung');return b.amounts[grade-1];}
export const COMBINATION_RULES={sourceIds:['combination','conversion','day','relief'],conversionMaximumShare:.4,bindingMonths:6};
export const OTHER_SUPPORT=[
  {title:'Pflegeberatung & Pflegekurse',text:'Die Pflegeversicherung hilft bei der Auswahl und Organisation der Unterstützung. Angehörige können kostenlose Pflegekurse nutzen, auf Wunsch auch zu Hause. Eine Pflegeberatung kann bereits im Antragsverfahren helfen.',sources:['advice','courses']},
  {title:'Digitale Pflegeanwendungen',text:'Nach Bewilligung sind für geeignete digitale Pflegeanwendungen bis zu 40 Euro im Monat und für ergänzende Unterstützung durch ambulante Pflegeeinrichtungen bis zu 30 Euro im Monat vorgesehen. Das sind getrennte zweckgebundene Leistungen, keine Auszahlung zur freien Verwendung.',sources:['digital']},
  {title:'Ambulant betreute Wohngruppen',text:'Unter den Voraussetzungen des § 45f ist ein Wohngruppenzuschlag von 224 Euro im Monat möglich, auch bei Pflegegrad 1. Er dient der gemeinschaftlich beauftragten Unterstützung, nicht der individuellen Pflege. Erforderlich sind unter anderem 3 bis 12 Bewohner, davon mindestens 3 pflegebedürftig, und eine gemeinsam beauftragte Person. Eine heimähnliche Vollversorgung ist ausgeschlossen. Für die Gründung kann zusätzlich eine einmalige Förderung bis zu 2.613 Euro je Person, höchstens 10.452 Euro je Wohngruppe, möglich sein. Sie muss innerhalb eines Jahres beantragt werden und unterliegt dem gesetzlichen Förderhöchstvolumen.',sources:['group','groupStart']},
  {title:'Besondere gemeinschaftliche Wohnformen',text:'Für Wohnformen mit einem Versorgungsvertrag nach § 92c gilt ein eigenes Leistungssystem mit einem Zuschuss von 450 Euro im Monat nach § 45h. Die übrigen Karten dieser Übersicht lassen sich damit nicht pauschal addieren. Welche ergänzenden Leistungen zulässig sind, richtet sich nach § 45h Absatz 2 und 3; bitte den konkreten Vertrag mit der Pflegeversicherung prüfen.',sources:['sharedHome']}
];

export const RESIDENTIAL_SURCHARGES={sourceIds:['surcharge'],bands:[{afterMonths:0,share:.15},{afterMonths:12,share:.3},{afterMonths:24,share:.5},{afterMonths:36,share:.75}]};

// Status matrix for care at home, after recognition and general insurance conditions.
// A conditional status describes a specific need; it is not an automatic payment.
export const BENEFIT_STATUS={available:{symbol:'✓',label:'Grundsätzlich verfügbar'},unavailable:{symbol:'–',label:'Kein eigener Anspruch'},conditional:{symbol:'i',label:'Unter bestimmten Voraussetzungen'}};
export const BENEFIT_CATEGORIES=[
  {id:'relief',label:'Entlastungsbetrag',icon:'chat',statuses:['available','available','available','available','available'],sources:['relief']},
  {id:'cash',label:'Pflegegeld',icon:'wallet',statuses:['unavailable','available','available','available','available'],sources:['cash']},
  {id:'services',label:'Pflegesachleistungen',icon:'heart',statuses:['unavailable','available','available','available','available'],sources:['services']},
  {id:'replacement',label:'Verhinderungspflege',icon:'user',statuses:['unavailable','conditional','conditional','conditional','conditional'],budgetGroup:'annual',sources:['replacement','annual']},
  {id:'shortTerm',label:'Kurzzeitpflege',icon:'calendar',statuses:['conditional','conditional','conditional','conditional','conditional'],budgetGroup:'annual',grade1Note:'Nur über den Entlastungsbetrag; kein eigener Anspruch auf Kurzzeitpflege.',sources:['shortTerm','annual','relief']},
  {id:'aids',label:'Pflegehilfsmittel',icon:'shield',statuses:['conditional','conditional','conditional','conditional','conditional'],sources:['aids']},
  {id:'home',label:'Wohnraumanpassung',icon:'home',statuses:['conditional','conditional','conditional','conditional','conditional'],sources:['aids']}
];
export const BENEFIT_SUMMARIES={
  relief:'Für anerkannte Alltagshilfe. Geeignete Kosten werden gegen Belege erstattet.',
  cash:'Für selbst organisierte Pflege zu Hause, etwa durch Angehörige. Auszahlung an die pflegebedürftige Person.',
  services:'Für einen zugelassenen Pflegedienst zu Hause. Mit Pflegegeld anteilig kombinierbar.',
  annual:'Ersatzpflege bei Ausfall der Pflegeperson oder vorübergehende stationäre Pflege. Beide teilen sich diesen Jahresbetrag.',
  aids:'Für benötigte Verbrauchsprodukte, etwa Einmalhandschuhe. Technische Hilfsmittel werden gesondert geprüft.',
  home:'Etwa für einen Treppenlift oder Badumbau, wenn die Pflege erleichtert oder Selbstständigkeit wiederhergestellt wird.',
  day:'Betreuung und Pflege in einer Einrichtung – ergänzend zur Pflege zu Hause.',
  residential:'Für die Pflegekosten im Heim. Unterkunft und Verpflegung bezahlen Sie grundsätzlich selbst.'
};
