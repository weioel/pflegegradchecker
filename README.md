# Pflegegradchecker von Caro

Vollständige browserlokale Pflegegrad-Selbsteinschätzung für Erwachsene. Statische Website ohne Build-Schritt und ohne Backend für Gesundheitsantworten.

## Lokal starten

```sh
npm ci
npm start
```

Öffnen: http://127.0.0.1:4173

Die Website selbst benötigt keine npm-Pakete zur Laufzeit. `npm ci` installiert ausschließlich Entwicklungswerkzeuge für Tests und die Quelle der lokal ausgelieferten Inter-Schrift. `node server.mjs` funktioniert auch ohne diese Installation.

## Prüfen

```sh
npm test
npm run check
```

95 automatisierte Tests: komplette amtliche Tabellen, Pflegegradgrenzen mit Nachbarwerten, Modul-2/3-Kombination, Modul-4-Sonderwerte, Modul-5-Frequenzen und Rundung, Unbekannt-Bereiche, vollständiger Durchlauf durch 64 Fragen, Bearbeiten/Zurücksetzen, Erwachsenenprüfung, strukturelle Barrierefreiheit und tatsächliche PDF-Erstellung.

## Struktur

- `dist/data.js`: versionierte Fragen, Antwortwerte, Tabellen und Quellen
- `dist/calculator.js`: validierter reiner Algorithmus
- `dist/app.js`: Navigation und Fragenablauf; Antworten nur im Arbeitsspeicher
- `dist/results.js`: Pflegegrad, passende Leistungen und aufklappbarer Rechenweg
- `dist/benefits-data.js`, `dist/benefits.js`: versionierte aktuelle Leistungen, Quellen und interaktive Pflegegrad-/Pflegeortauswahl
- `dist/reform-data.js`, `dist/reform.js`: isolierter Vergleich geltender Regeln und PNOG-Entwurf; Punkte- und Modulregler, Gewichtungsdiagramm
- `dist/question-copy.js`: verständliche Anzeigeformulierungen ohne Änderung der Bewertung
- `dist/pdf.js`: echter lokaler PDF-Download, inklusive aller Antworten und Quellen
- `dist/home.js`, `dist/content.js`: Startseite und vollständige redaktionelle Inhalte
- `dist/presentation.js`, `dist/ui.js`: progressive Darstellung, Kacheln, Schritte und Icons ohne Berechnungslogik
- `dist/styles.css`: responsives Design, Fokuszustände, reduzierte Bewegung und Druckansicht
- `dist/fonts`: lokal ausgelieferte Inter-Variable-Schrift mit OFL-Lizenz
- `docs/calculation.md`: vollständiger Rechenweg und dokumentierte Beispiele
- `docs/legal-research.md`: amtliche Grundlagen der Bewertung
- `docs/benefits-research.md`: aktuelle Leistungsbeträge, Kombinationen und Reformstand vom 12.11.2026
- `docs/quality-assurance.md`: Prüfergebnisse und Grenzen der Verifikation

## Rechtlicher Stand

Recherche zuletzt geprüft: 12. November 2026. Es gelten die Tabellen aus Anlage 1/2 zu § 15 SGB XI und die Begutachtungs-Richtlinien vom 26.08.2026, gültig seit 01.10.2026. Der PNOG-Entwurf vom 02.11.2026 ist im eigenen Informationsbereich vom geltenden Recht getrennt und wird nicht im Rechner verwendet.

Für Aktualisierungen zuerst die amtlichen Originalquellen prüfen, dann den Regelsatz versionieren, Quellen/Dokumentation und Erwartungen in den unabhängigen Tests anpassen. Keine Reformwerte ohne gesicherte Rechtsgrundlage übernehmen.

## Datenschutz und Veröffentlichung

Keine externen Laufzeitbibliotheken, Schriftabrufe, Analytics, Cookies, Benutzerkonten oder dauerhafte Speicherung der Antworten. Antworten werden weder an einen Server noch an KI-Dienste übermittelt. Ein Reload verwirft den Zustand; PDF-Downloads bleiben im Verantwortungsbereich der nutzenden Person.

Die bereitgestellte Fassung ist eine **private Projektvorschau**. Die Hostingplattform kann hierfür eine Zugangsprüfung verlangen; der Rechner hat kein eigenes Konto. Vor öffentlichem Betrieb sind verifizierter Betreibername, Rechtsform, Anschrift, Kontakt und gegebenenfalls Registerdaten sowie verbindliche Hosting-/Datenschutzangaben einzutragen. Derzeitige Transparenzhinweise sind kein vollständiges öffentliches Impressum und keine abschließend geprüfte Datenschutzerklärung. `noindex, nofollow` dient ausschließlich als Indexierungshinweis; der Schutz der Vorschau erfolgt über die private Hostingfreigabe.

Die Website ersetzt keine fachliche Pflegebegutachtung und trifft keine verbindlichen Leistungsentscheidungen. Besondere Bedarfskonstellationen werden erklärt, aber nicht automatisch eingestuft. Kinder erhalten keinen Erwachsenen-Pflegegrad.

## Gezielte Vereinfachung vom 12.11.2026

Drei Aufgaben auf der Startseite, dezente Pastellfarben, drei praktische Antragsschritte und Musterantrag als Kopie/Textdatei. Der Selbstcheck zeigt vorrangig die aktuelle Frage; Hilfen und Fachbegriffe öffnen sich bei Bedarf. Das Ergebnis zeigt den möglichen Pflegegrad, passende Leistungen und den nächsten Schritt. Detaillierte Punkte und PDF bleiben erhalten.

Die neue Leistungsübersicht erklärt alle fünf Pflegegrade mit getrennten Ansichten für Pflege zu Hause und im Heim. Beträge, Zeiträume und Geld-/Sach-/Erstattungsleistungen sind getrennt ausgewiesen. Aktuelle Werte wurden am 12.11.2026 gegen SGB XI und BMG geprüft; PNOG-Entwurfswerte sind nicht aktiv. Bewertungsdaten, Algorithmus und PDF-Export bleiben byteidentisch.

Browserzugriff war nicht verfügbar. Automatisierte Funktions- und Strukturprüfungen sind abgeschlossen; eine echte mobile Sichtprüfung bleibt offen.


## Reformvergleich und Leistungsstatus, 12.11.2026

Vier Hauptkacheln mit direktem Zugang zu `#/reform`. Zwei getrennte Vergleichswerkzeuge zeigen Gesamtgrenzen und die Einzelpunktumrechnung aller sechs Module. Das Gewichtungsdiagramm bildet fünf Anteile mit zusammen 100 % und sechs auswählbare Module ab; 2/3 werden gemeinsam gezählt. Der Entwurf wird durchgehend gekennzeichnet. Vollständige bisherige Reforminformationen bleiben unter `#/reform-details` erreichbar.

Die fünf Pflegegrad-Kacheln zeigen sieben Leistungsarten ohne Eurobeträge. Auf Mobilgeräten folgt auf die kompakte Auswahl eine Matrix für den gewählten Grad. Sechs große Leistungskacheln zeigen Beträge oder ausdrücklich fehlende eigene Ansprüche. Pflegeortwechsel, Tages-/Nachtpflege, Beratung, Ergebnisverknüpfung und PDF bleiben erhalten. Recherche: `docs/reform-comparison.md`.
