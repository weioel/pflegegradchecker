# Pflegekompass: Informationsarchitektur und Datenfluss

Recherche vor Implementierung: §§ 14/15 SGB XI, Anlage 1/2 und die seit 01.10.2026 geltenden MD-Begutachtungs-Richtlinien. Einzelheiten und Quellen stehen in legal-research.md und calculation.md.

## Navigation
Start → Selbstcheck / Ratgeber. Weitere eigenständige Ansichten: FAQ, Quellen und Methodik, Pflegereform 2027, Datenschutz, Impressum.

## Selbstcheck
Einführung und Erwachsenengrenze → sechs Module mit insgesamt 64 Kriterien → Ergebnis einschließlich Rechenweg und allen offenen Antworten. Ein Kriterium pro Bildschirm; Frage, Kontext, Auswahl und konkrete Hilfen. Modul- und Antwortübersicht erlauben direktes Bearbeiten. Keine Vorauswahl. Unbekannte Antworten bleiben unbekannt. Die Ergebnisansicht ist auch bei teilweise beantwortetem Fragebogen verfügbar und zeigt mathematische Unter-/Obergrenzen. Kinder erhalten kein Ergebnis.

## Trennung
- data.js: versionierte Regeln, Tabellen, Fragen, Antworten, Quellen
- calculator.js: reine validierte Berechnungsfunktionen ohne DOM
- app.js: Navigation, Zustandsverwaltung und barrierearme Interaktion
- content.js: redaktionelle, belegte Ratgebertexte
- pdf.js: browserlokaler PDF-Download
- styles.css: Gestaltung, responsives Layout, Druckansicht, reduzierte Bewegung

Antworten existieren nur in JavaScript-Arbeitsspeicher. Keine Cookies, localStorage, sessionStorage, Formularübertragung, Analytics oder externe Laufzeitabhängigkeiten. Ein Neuladen verwirft die Antworten. PDF nur auf ausdrücklichen lokalen Download. URL enthält keine Gesundheitsantworten. Die private Hosting-Zugangsprüfung und allgemeine Serverzugriffsprotokolle sind von den lokalen Rechnerantworten zu unterscheiden.

## Veröffentlichung
Private Vorschau. Vor öffentlichem Betrieb tatsächlichen Anbieter, Kontaktdaten, Hostingvertrag, Rechtsgrundlage der technischen Zugriffsdaten und Datenschutzerklärung konkretisieren. Keine erfundenen Betreiberangaben. PNOG-Entwurf ist redaktionell vom implementierten geltenden Recht getrennt.
