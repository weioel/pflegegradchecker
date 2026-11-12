# Reformvergleich – Quellen und fachliche Abgrenzung

Geprüft am **12.11.2026**. Datenversion `pnog-bt21-8869-2026-11-12-v1`.

## Rechtsstand

- Geltend: [amtliche Gesamtfassung des SGB XI](https://www.gesetze-im-internet.de/sgb_11/SGB_11.pdf), § 15 auf S. 29–30, Anlage 2 auf S. 177–178. Letzte Änderung Art. 2c G vom 24.07.2026 (BGBl. I Nr. 228), Bek. vom 16.09.2026 berücksichtigt. Einzelabrufe § 15 und Anlage 2 waren bei der erneuten Prüfung teilweise zeitlich nicht erreichbar; die amtliche Gesamtfassung wurde erfolgreich geprüft.
- Einzelkriterien: [Anlage 1](https://www.gesetze-im-internet.de/sgb_11/anlage_1.html); keine Änderung am Selbstcheck.
- [Begutachtungs-Richtlinien](https://www.medizinischerdienst.de/fileadmin/MD-zentraler-Ordner/Downloads/01_Pflegebegutachtung/261016_MDB_48_002_RICHTLINIE_PFLEGE_2026_16.pdf): erlassen 26.08.2026, genehmigt 28.09.2026, wirksam 01.10.2026.
- Entwurf: [BT-Drs. 21/8869 vom 02.11.2026](https://dserver.bundestag.de/btd/21/088/2108869.pdf), Grenzen S. 28, Übergang § 142b S. 52–53, Anlage 2 S. 54, Inkrafttreten S. 61.
- [Erste Lesung vom 05.11.2026](https://www.bundestag.de/dokumente/textarchiv/2026/kw45-de-pflegeneuordnungsgesetz-1225076): Ausschussüberweisung. [Anhörung am 25.11.2026 angekündigt](https://www.bundestag.de/presse/hib/kurzmeldungen-1231090): liegt nach dem Recherchestand. Kein beschlossenes PNOG. 01.01.2027 ist ein geplanter Start.

## Vollständige Tabellen

Untere Pflegegradgrenzen 1–5: geltend **12,5 / 27 / 47,5 / 70 / 90**, Entwurf **15 / 30 / 50 / 70 / 90**.

| Modul | Geltende Einzelpunktbereiche | Entwurfsbereiche | Gewichtete Werte in beiden Ständen |
|---|---|---|---|
| 1 | 0–1 / 2–3 / 4–5 / 6–9 / 10–15 | 0–1 / 2–3 / 4–6 / 7–9 / 10–15 | 0 / 2,5 / 5 / 7,5 / 10 |
| 2 | 0–1 / 2–5 / 6–10 / 11–16 / 17–33 | unverändert | 0 / 3,75 / 7,5 / 11,25 / 15 |
| 3 | 0 / 1–2 / 3–4 / 5–6 / 7–65 | unverändert | 0 / 3,75 / 7,5 / 11,25 / 15 |
| 4 | 0–2 / 3–7 / 8–18 / 19–36 / 37–54 | 0–3 / 4–9 / 10–24 / 25–39 / 40–54 | 0 / 10 / 20 / 30 / 40 |
| 5 | 0 / 1 / 2–3 / 4–5 / 6–15 | unverändert | 0 / 5 / 10 / 15 / 20 |
| 6 | 0 / 1–3 / 4–6 / 7–11 / 12–18 | 0–1 / 2–3 / 4–6 / 7–11 / 12–18 | 0 / 3,75 / 7,5 / 11,25 / 15 |

Die Gewichte sind unverändert: 10 + 15 + 40 + 20 + 15 = 100 %. Für 2/3 zählt nur der höhere gewichtete Wert, nicht beide addiert.

Dokumentierte Beispiele: 28 Gesamtpunkte -> PG2 geltend / PG1 bei Entwurfsgrenzen. Das ist **nur ein Grenzvergleich**, keine Neuberechnung derselben Antworten. 8 Einzelpunkte in Selbstversorgung -> 20 geltend / 10 im Entwurf. 6 Mobilitätspunkte -> 7,5 / 5. 1 Alltagspunkt -> 3,75 / 0.

## Schutz vor Fehlinterpretation

`reform-data.js` liest den geltenden Regelsatz, mutiert ihn aber nicht. Entwurfstabellen sind getrennte Objekte. `calculator.js`, `data.js` und `pdf.js` importieren keine Vergleichsfunktionen und bleiben byteidentisch. Es gibt weder einen Entwurfsmodus im Selbstcheck noch eine automatische Umstellung im Jahr 2027. Reglerzustand und Gesundheitsantworten sind getrennt; kein Datenexport und kein Speichern der Reglerwerte.

Grenzregler: 0–100, zwei Nachkommastellen. Nicht jede Dezimalzahl ist tatsächlich über Module erreichbar. Modulregler: ganze gültige Rohpunktsummen, einschließlich unveränderter Bereiche. Besondere Bedarfskonstellation PG5 unter 90 nicht automatisch bewertet; nur Erwachsene. Ergebnisse werden immer mit beiden Rechtsständen und Entwurfsstatus beschriftet.

Geplanter § 142b: Antragszeitpunkt bzw. bei Wiederholungsbegutachtung Begutachtungstag; bestehende Zuordnung bis erneuter Begutachtung und Entscheidung; kein Verlust allein durch neue Schwellen/Tabellen. Kein pauschaler Schutz aller Leistungsbeträge. Geplante Fristausnahme Januar–April 2027 und Dringlichkeitsregeln gelten heute nicht. Keine abgeleitete neue Widerspruchsfrist, keine Stichtagsempfehlung.

## Leistungsstatus

Erneut mit [BMG-Leistungsübersicht 2026](https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/P/Pflegeversicherung_Leistungsbeitraege/Uebersicht_Leistungsbetraege_2026.pdf) und SGB XI geprüft; sämtliche Eurobeträge unverändert. Version `de-sgbxi-benefits-2026-11-12-v2` ergänzt ausschließlich Anzeigeinformationen.

- Entlastungsbetrag: grundsätzlich PG1–5 bei häuslicher Pflege, §45b.
- Pflegegeld und Pflegesachleistungen: eigener regulärer Anspruch erst PG2–5, §§37/36. Anteilig kombinierbar, §38.
- Verhinderungspflege: PG2–5 bei verhinderter Pflegeperson, §39. Daher bedingter Status, PG1 kein eigener Anspruch.
- Kurzzeitpflege: eigener Anspruch PG2–5 bei entsprechendem Bedarf, §42. PG1 nur Kosten über den Entlastungsbetrag unter dessen Voraussetzungen; bedingt und ausdrücklich kein eigener §42-Anspruch.
- Beide Pflegearten teilen ab PG2 **einen** Jahresbetrag nach §42a. Getrennte Statuszeilen sind keine zwei Budgets. Die große Kachel enthält den Betrag nur einmal.
- Pflegehilfsmittel und Wohnraumanpassung: PG1–5 bei spezifischem Bedarf nach §40, deshalb bedingter Status. Technische Hilfsmittel sind gesondert vom Verbrauchsbudget.

Die Matrix beschreibt häusliche Pflege nach Anerkennung und allgemeinen Voraussetzungen, keine automatischen Auszahlungen. Vollstationäre Leistungen werden in einer getrennten Ansicht dargestellt. Gesetzlich notwendige Details und alle bisherigen Hilfen bleiben aufklappbar.

## Einführung und IGES-Vergleich, 12.11.2026

Reihenfolge: sechs Module/Gewichtung mit drei Punkteschritten; Pflegegradgrenzen; Umrechnung; Zusammenfassung; IGES-Modell. Beispiele geltend: einzelnes Mobilitätskriterium 0/1/2/3; Mobilitätssumme 5 -> 5 gewichtet; unabhängiges Beispiel 35 Gesamtpunkte -> PG2. Kein zusätzlicher Berechnungsmodus.

Neue Datenversion `iges-table9-v2-2026-04-v1` in `dist/iges.js`. Originalbericht erfolgreich geöffnet und Tabelle 9 geprüft: gedruckte S.91 entspricht PDF-Seite93. Die Originaldaten des Nutzers stimmen vollständig überein. Quelle: https://www.gkv-spitzenverband.de/media/dokumente/pflegeversicherung/forschung/projekte_unterseiten/IGES_Entwicklung_Pflegepraevalenz_Abschlussbericht_final-2026-04-22.pdf#page=93

Je Spalte 1.218.275 Erstbegutachtungen aus 2024, anerkannt PG1–5: 980.885 bzw.764.691 (-22,0%). Originaltabelle schließt 1.241 ungültige/unvollständige Fälle und weitere 50.243 Aktenlagen ohne Einzelpunkte aus. Kein Bevölkerungshochrechnen und keine echten Fallzahlen 2027. Variante2 kombiniert die höheren Grenzen und geänderte Modulintervalle des Expertenbeirats; sie ist nicht als unveränderliche Simulation des endgültigen PNOG zu verstehen.

Alle zwölf Balken sind linear auf 0–500.000 skaliert, ohne Mindestbalkenbreite oder kategoriespezifische Skalierung. Eine gemeinsame Skala bleibt auch mobil erhalten. Direkt sichtbare relative Prozentwerte, Tastatur-/Tap-Auswahl und eine stabile Live-Region zeigen genaue Fallzahlen. Ausgewählte Kategorie bleibt bei Navigation erhalten. 91,1% meint die Veränderung der Nichtanerkennungsfälle, nicht ihren Anteil an allen Anträgen. 3,8% mehr PG1 erklärt keine leichteren Voraussetzungen. 22% weniger Anerkennungen bezieht sich ausschließlich auf neu berechnete Erstgutachten, nicht auf Entziehung bestehender Grade.

Gesetzgebungsstand erneut gegen die Bundestagsseiten zur ersten Lesung und angekündigten Anhörung geprüft: nach dem Stand vom12.11.2026 weiterhin Entwurf. §15 und Anlage2 erfolgreich direkt geöffnet, Entwurfs-PDF S.28/54 erneut abgerufen. Keine neuen geltenden Schwellen oder Modulintervalle festgestellt.
