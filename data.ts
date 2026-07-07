/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEOConfig, GlossaryTerm, YouTubeVideo, SocialMediaLink, TaxTool } from './types';

export const DEFAULT_SEO: SEOConfig = {
  title: "Lexonomy - Das Steuerfach-Portal für Kanzleiwissen & Berechnungen",
  description: "Das ultimative Fachportal für Steuerfachangestellte, Kanzleien und Mandanten. Nutzen Sie unsere kostenlosen Steuerrechner, Fristenplaner und das detaillierte Steuer-Glossar.",
  keywords: "Steuerrechner, Brutto Netto Rechner, Fristenrechner, Steuer-Glossar, Werbungskosten, Steuerfachangestellter, Steuerrecht, Kanzlei, Lexonomy"
};

export const DEFAULT_GLOSSARY: GlossaryTerm[] = [
  {
    id: "1",
    term: "Werbungskosten",
    definition: "Werbungskosten sind alle Aufwendungen, die der Erwerbung, Sicherung und Erhaltung von Einnahmen dienen. Sie werden bei der Ermittlung der Einkünfte von den Einnahmen abgezogen. Für Arbeitnehmer gibt es einen Arbeitnehmer-Pauschbetrag von derzeit 1.230 € jährlich.",
    category: "Einkommensteuer",
    law: "§ 9 EStG",
    example: "Aufwendungen für die tägliche Fahrt zur Arbeit (Pendlerpauschale), Arbeitsmittel (z.B. Fachliteratur, Berufsbekleidung), Fortbildungskosten oder ein häusliches Arbeitszimmer.",
    lastUpdated: "2026-01-15"
  },
  {
    id: "2",
    term: "Sonderausgaben",
    definition: "Sonderausgaben sind Aufwendungen, die der privaten Lebensführung zuzurechnen sind, aber aus sozial- oder wirtschaftspolitischen Gründen steuerlich begünstigt werden. Sie mindern das zu versteuernde Einkommen, sofern sie den Sonderausgaben-Pauschbetrag (36 € für Ledige, 72 € für Verheiratete) übersteigen.",
    category: "Einkommensteuer",
    law: "§ 10 EStG",
    example: "Beiträge zur Kranken- und Pflegeversicherung, Altersvorsorgeaufwendungen (Rentenversicherung), Spenden für gemeinnützige Zwecke oder gezahlte Kirchensteuer.",
    lastUpdated: "2026-02-10"
  },
  {
    id: "3",
    term: "Entlastungsbetrag für Alleinerziehende",
    definition: "Ein Steuerfreibetrag, der Alleinerziehenden zusteht, um die höheren Lebenshaltungskosten von Einelternfamilien auszugleichen. Voraussetzung ist, dass zum Haushalt mindestens ein Kind gehört, für das dem Steuerpflichtigen Kindergeld oder ein Kinderfreibetrag zusteht, und keine andere volljährige Person im Haushalt lebt.",
    category: "Einkommensteuer",
    law: "§ 24b EStG",
    example: "Eine alleinerziehende Mutter erhält den Entlastungsbetrag in Höhe von 4.260 € jährlich für das erste Kind. Für jedes weitere Kind erhöht sich der Betrag um jeweils 240 €.",
    lastUpdated: "2026-03-01"
  },
  {
    id: "4",
    term: "Kleinunternehmerregelung",
    definition: "Unternehmer, deren Umsatz im vorangegangenen Kalenderjahr 22.000 € nicht überstiegen hat und im laufenden Kalenderjahr 50.000 € voraussichtlich nicht übersteigen wird, können sich von der Umsatzsteuerpflicht befreien lassen. Sie dürfen dann keine Vorsteuer abziehen und auf ihren Rechnungen keine Umsatzsteuer ausweisen.",
    category: "Umsatzsteuer",
    law: "§ 19 UStG",
    example: "Ein selbstständiger IT-Berater erzielt im Gründungsjahr 15.000 € Umsatz. Er entscheidet sich für die Kleinunternehmerregelung, spart sich die monatliche Umsatzsteuervoranmeldung und stellt Rechnungen ohne Umsatzsteuer aus.",
    lastUpdated: "2026-04-20"
  },
  {
    id: "5",
    term: "Umsatzsteuer-Identifikationsnummer (USt-IdNr.)",
    definition: "Eine eindeutige Nummer, die jedem Unternehmer im EU-Raum auf Antrag erteilt wird. Sie dient der Abwicklung von innergemeinschaftlichen Lieferungen und Leistungen und ermöglicht die umsatzsteuerfreie Rechnungsstellung bei der Durchführung des Reverse-Charge-Verfahrens.",
    category: "Umsatzsteuer",
    law: "§ 27a UStG",
    example: "Eine deutsche Webagentur kauft Software von einem Anbieter aus Frankreich. Durch Angabe der USt-IdNr. stellt der französische Verkäufer eine Nettorechnung ohne französische Umsatzsteuer aus.",
    lastUpdated: "2026-05-12"
  },
  {
    id: "6",
    term: "Dienstwagenprivileg (1%-Regelung)",
    definition: "Nutzt ein Arbeitnehmer einen Dienstwagen auch privat, stellt diese Nutzung einen geldwerten Vorteil (Sachbezug) dar, der zu versteuern ist. Bei der Pauschalmethode wird dieser Vorteil monatlich mit 1 % des inländischen Bruttolistenpreises zum Zeitpunkt der Erstzulassung angesetzt. Für Elektroautos gelten reduzierte Sätze (0,25 % oder 0,5 %).",
    category: "Lohnsteuer / Einkommensteuer",
    law: "§ 6 Abs. 1 Nr. 4 EStG",
    example: "Ein Dienstwagen hat einen Bruttolistenpreis von 40.000 €. Die monatliche private Nutzung wird pauschal mit 1 % (400 €) als steuerpflichtiges Einkommen auf der Gehaltsabrechnung hinzugerechnet.",
    lastUpdated: "2026-06-05"
  },
  {
    id: "7",
    term: "Pendlerpauschale (Entfernungspauschale)",
    definition: "Eine verkehrsmittelunabhängige Pauschale für Fahrten zwischen Wohnung und erster Tätigkeitsstätte. Sie beträgt derzeit 0,30 € pro vollem Entfernungskilometer für die ersten 20 Kilometer und 0,38 € ab dem 21. Kilometer, begrenzt auf maximal 4.500 € pro Kalenderjahr (außer bei Nutzung eines eigenen PKWs).",
    category: "Einkommensteuer",
    law: "§ 9 Abs. 1 Satz 3 Nr. 4 EStG",
    example: "Ein Arbeitnehmer fährt an 220 Arbeitstagen im Jahr 25 Kilometer einfache Strecke zur Arbeit. Seine Werbungskosten berechnen sich wie folgt: (20 km x 0,30 € + 5 km x 0,38 €) x 220 Tage = 1.738 €.",
    lastUpdated: "2026-06-18"
  }
];

export const DEFAULT_YOUTUBE: YouTubeVideo[] = [
  {
    id: "1",
    title: "Steuern sparen im Beruf: Werbungskosten richtig absetzen",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Wie Sie Arbeitsmittel, Fahrtkosten und Fortbildungen richtig in der Steuererklärung angeben und maximal profitieren."
  },
  {
    id: "2",
    title: "Umsatzsteuer vs. Vorsteuer einfach erklärt",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Der Unterschied zwischen erhobener Umsatzsteuer und gezahlter Vorsteuer. Ein Crashkurs für Gründer und Auszubildende."
  },
  {
    id: "3",
    title: "Fristen beim Finanzamt: Was passiert bei Verspätung?",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Verspätungszuschlag, Zwangsgeld und Schätzung. So bewahren Sie Kanzlei und Mandanten vor teuren Fristversäumnissen."
  }
];

export const DEFAULT_SOCIALS: SocialMediaLink[] = [
  {
    id: "1",
    platform: "LinkedIn",
    url: "https://www.linkedin.com"
  },
  {
    id: "2",
    platform: "Instagram",
    url: "https://www.instagram.com"
  },
  {
    id: "3",
    platform: "X (Twitter)",
    url: "https://www.x.com"
  }
];

export const DEFAULT_TOOLS: TaxTool[] = [
  {
    id: "brutto_netto",
    title: "Brutto-Netto-Rechner",
    description: "Berechnen Sie schnell Ihr Nettogehalt, Steuern und Sozialversicherungsabgaben für das Steuerjahr 2026.",
    category: "Gehalt",
    type: "brutto_netto"
  },
  {
    id: "fristen",
    title: "Fristen- & Terminrechner",
    description: "Berechnen Sie gesetzliche Abgabefristen für Umsatzsteuer-Voranmeldungen und Einkommensteuererklärungen gemäß § 108 AO.",
    category: "Fristen",
    type: "fristen"
  }
];

