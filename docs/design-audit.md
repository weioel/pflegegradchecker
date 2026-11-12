# Redesign: Audit und Umsetzung

## Ausgangslage

- Startseite: sechs große, weitgehend identische Abschnitte mit Eyebrow, zweispaltiger Überschrift und Fließtext. Inhaltliche Ziele werden zwischen wiederholten Einleitungen versteckt.
- Ratgeber: fünf lange Abschnitte gleichzeitig sichtbar. Navigation steht neben dem Text statt als klarer Ablauf darüber. Antragstext und Vorbereitung sind schwer direkt erreichbar.
- Rechner: Modulbeschreibung, vollständiger Hilfetext, vier ausführliche Beispiele, Punktwerte und Quellen gleichzeitig sichtbar. Die Frage konkurriert mit Nebentext; Fortschritt und Modulabschluss sind nicht ausreichend unterscheidbar.
- Ergebnis: große Zahlen, anschließend lange Erklärung, Diagramm, Formel, sechs weitere Accordions und drei ausführliche nächste Schritte. Gleiche Inhalte werden wiederholt.
- FAQ/Quellen/Reform: schwache Orientierung über Themen. Quellen- und Reformtabellen verlangen lange Scrollwege.

## Neue Informationsarchitektur

1. Startseite als Aufgabenübersicht: dominanter Rechner, Antrag, Begutachtung, interaktive Pflegegradübersicht, FAQ und sichtbar als Entwurf markierte Reform.
2. Antrag als fünfstufige Timeline. Jede Station hat eine kurze Zusammenfassung; alle vorhandenen Rechtstexte und Links bleiben in aufklappbaren Abschnitten. Antragstext erhält einen direkten Einstieg.
3. Fragebogen: Frage → Auswahl → Weiter. Beispiele einzeln per Details, Kontext und Quellen auf Abruf. Wichtige Anwendungsvoraussetzungen bleiben auffindbar und bei Frequenzen/Inkontinenz sichtbar. Modulwechsel ohne zusätzlichen Bestätigungsschritt.
4. Ergebnis als kompaktes Dashboard: Punkte, mögliche Einstufung, Bearbeitungsstand, Module. Formel, Einzelantworten und Sonderfälle aufklappbar. Der verbindliche Unverbindlichkeitshinweis bleibt sichtbar.
5. Quellen und Reform nach Themen aufklappbar; geltendes Recht und Entwurf stets sichtbar getrennt. Datenschutz und Impressum in ihrem vollständigen rechtlichen Kontext erhalten.

## Schutz der Funktion

Unveränderte Dateien: data.js, calculator.js, pdf.js. SHA-256 vor Redesign:
- data.js: be785827fa41493f61735d8e1948ec859cde080cf4ae510efeca576c062b73bb
- calculator.js: 9f297b038400632468700c7188371d0274c3629df2719008fd5fc2dd1bbc303a
- pdf.js: 6c1ca4e20281eebd6a5ad34a5d66dc837dc4f746e737a06642c8b13226b3f9c7

Die vorhandenen redaktionellen Volltexte in content.js werden für die Darstellung strukturiert, nicht gelöscht. Alle 64 Fragen und Antwortwerte bleiben erhalten. Keine Neurecherche oder Änderung des dokumentierten Rechtsstands durch dieses rein gestalterische Redesign.

## Prüfung des Redesigns – 12.11.2026

- 59 automatisierte Prüfungen erfolgreich: die bisherigen 47 Prüfungen plus Schutz vor Änderungen an den drei fachlichen Dateien, Volltexterhalt für sechs Inhaltsseiten, alle 64 unveränderten Frage-/Antworttexte, Pflegegrad-Auswahl, FAQ-Themen, direkte Ratgeber-Einstiege, Antragsmuster, Modulwechsel und Fortsetzen des Selbstchecks.
- Ratgeber, Quellen und Reform enthalten vor dem Aufklappen mindestens 50 % weniger Text. DOM-basierte Wortzählung ohne ausgeblendete Inhalte: Ratgeber 905 → 116; Quellen 703 → 56; Reform 518 → 57. Das ist eine Inhaltsmessung, keine Messung einer konkreten Bildschirmgröße.
- Vollständige Rechtstexte und sämtliche externen Quellenlinks bleiben in den aufklappbaren Themen verfügbar. Die Vergleichstests prüfen Absatztexte und Tabellenzellen.
- Die Berechnungsdaten, der Algorithmus und der PDF-Export stimmen bytegenau mit dem vorherigen Stand überein (SHA-256-Prüfung).
- Native HTML-Details, ARIA-Zustände, Fokusführung, reduzierte Bewegung, mobile Navigation bis 960 px und vergrößerte Antwortflächen sind berücksichtigt. Automatisierte strukturelle Accessibility-Prüfungen bleiben erfolgreich.
- Visuelle Browserprüfung weiterhin nicht möglich: Der Computer-Use-Browserdienst meldet auch am 12.11.2026 „The browser access host is unavailable“. Keine Behauptung einer visuellen Desktop-/Mobilabnahme oder vollständigen WCAG-Zertifizierung.
- Rechts-/Reformstand weiterhin ausdrücklich 11.11.2026. Dieses Redesign aktualisiert keine gesetzlichen Regeln.

## Gezielte Vereinfachung und Leistungen – zweite Überarbeitung am 12.11.2026

Befund aus Sicht einer erstmals antragstellenden älteren Person: Die bisherige Startseite verlangte nach dem Rechner noch eine Modulvorschau, Vertrauensleiste, Pflegegrade, fünf Antragsschritte, Grundlagen, FAQ und Reforminformation. Dieselben Hinweise wiederholten sich in Einleitung, Seitenleiste und Footer. Im Ergebnis konkurrierten Punktzahl, Module und drei nächste Schritte um Aufmerksamkeit.

Umgesetzt: genau drei Aufgaben auf der Startseite, mit Eisblau für Selbstcheck, Salbei für Antrag und Lavendel für Leistungen. Drei praktische Antragsschritte mit optionaler Vertiefung, Muster zum Kopieren und lokalen Textdatei-Download. Vollständige ursprüngliche Rechtstexte bleiben erhalten. Im Selbstcheck kurze Antwortbezeichnungen nur für die eindeutigen Selbstständigkeitsskalen in Modul 1/4/6; offizielle Labels, Punkte und Beispiele bleiben separat aufrufbar. Häufigkeitsskalen und Sonderantworten behalten ihre Bedeutung. Nur ausgewählte sperrige Fragen haben eine zusätzliche verständliche Anzeigeform; der vollständige Ausgangstext bleibt in der Hilfe.

Das Ergebnis führt mit Pflegegrad und dessen Bedeutung, passenden Leistungen und einem nächsten Schritt. Alle Module, Kriterien, Formeln und Unsicherheitsinformationen bleiben verfügbar. Bewertungsdateien und PDF-Modul unverändert (SHA-256-Regressionstest).

Leistungen sind ein eigener Hauptbereich: fünf auswählbare Pflegegrade, häusliche und stationäre Versorgung getrennt, große Eurobeträge und sichtbare Budgetart/Einheit. Monatsansprüche werden nicht zusammengezählt. Weitere Hilfen, Kombinationen und Quellen öffnen sich bei Bedarf. Die Auswahl aus einem vollständigen Ergebnis wird ausschließlich im flüchtigen Browserzustand übernommen, nicht im URL oder in persistentem Speicher.

Mobile Regeln: drei Kacheln untereinander, kompakte fünfteilige Gradeauswahl, einspaltige Leistungsansicht, eindeutige 48–50px-Bedienelemente. Fließtexte werden durch Kürzung reduziert, nicht durch kleinere Schrift. Pastelltöne haben dunkle Schrift, sichtbare Fokuslinien und explizite Auswahlzustände. Bewegungsreduktion bleibt aktiv.

Grenze: Browserhost erneut nicht verfügbar; keine visuellen Screenshots oder tatsächlichen mobilen Layoutmessungen möglich. Die Aussage „WCAG vollständig erfüllt“ wird daher nicht getroffen. Struktur und Interaktionen wurden mit JSDOM/axe geprüft.
