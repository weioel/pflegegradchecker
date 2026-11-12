// Presentation only: canonical questions and scoring remain in data.js.
const plainQuestions={
  '3.4':'Wie oft muss jemand eingreifen, weil die Person Gegenstände beschädigt?',
  '3.5':'Wie oft ist Hilfe nötig, weil die Person andere körperlich angreift?',
  '3.6':'Wie oft ist Hilfe nötig, weil die Person andere beschimpft oder bedroht?',
  '3.8':'Wie oft ist Unterstützung nötig, weil die Person Pflege oder andere Hilfe abwehrt?',
  '3.10':'Wie oft braucht die Person wegen Ängsten Unterstützung?',
  '5.1':'Wie oft braucht die Person Hilfe mit ihren Medikamenten?',
  '5.2':'Wie oft braucht die Person Hilfe bei Spritzen unter die Haut oder in einen Muskel?',
  '5.6':'Wie oft ist Hilfe beim Messen und Beurteilen von Körperwerten nötig?',
  '5.13':'Wie oft braucht die Person Unterstützung bei Arztbesuchen?'
};
const plainOptions={'Selbstständig':'Ohne Hilfe','Überwiegend selbstständig':'Mit wenig Hilfe','Überwiegend unselbstständig':'Mit viel Hilfe','Unselbstständig':'Vollständige oder fast vollständige Hilfe'};
export const questionLabel=q=>plainQuestions[q.id]??q.question;
export const optionLabel=(q,o)=>[1,4,6].includes(q.module)?plainOptions[o.label]??o.label:o.label;
