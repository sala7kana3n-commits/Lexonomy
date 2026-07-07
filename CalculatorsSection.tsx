/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, Save, Trash2, ArrowRight, ShieldCheck, Info, CheckCircle, Search, ChevronLeft, Wrench, Sparkles, BookOpen } from 'lucide-react';
import { UserProfile, SavedCalculation, TaxTool } from '../types';

interface CalculatorsSectionProps {
  userProfile: UserProfile;
  onSaveCalculation: (calc: Omit<SavedCalculation, 'id' | 'date'>) => void;
  savedCalculations: SavedCalculation[];
  onDeleteCalculation: (id: string) => void;
  tools: TaxTool[];
  onDeleteTool: (id: string) => void;
}

export default function CalculatorsSection({
  userProfile,
  onSaveCalculation,
  savedCalculations,
  onDeleteCalculation,
  tools,
  onDeleteTool,
}: CalculatorsSectionProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'netto' | 'fristen' | 'saved' | 'custom_tool'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [activeCustomTool, setActiveCustomTool] = useState<TaxTool | null>(null);

  // Dynamische Kategorienliste aus allen Tools
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tools.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return ['Alle', ...Array.from(cats)];
  }, [tools]);

  // Gefilterte Tools für Gäste und Besucher
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, selectedCategory]);

  // --- NETTO BRUTTO RECHNER STATE ---
  const [brutto, setBrutto] = useState<number>(3500);
  const [steuerklasse, setSteuerklasse] = useState<number>(1);
  const [kirchensteuer, setKirchensteuer] = useState<boolean>(true);
  const [bundesland, setBundesland] = useState<'BW_BY' | 'OTHERS'>('OTHERS'); // BW/BY: 8%, Andere: 9%
  const [hatKinder, setHatKinder] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // --- FRISTENRECHNER STATE ---
  const [steuerart, setSteuerart] = useState<'ust_voranmeldung' | 'est_erklaerung'>('ust_voranmeldung');
  const [jahr, setJahr] = useState<number>(2026);
  const [dauerfristverlaengerung, setDauerfristverlaengerung] = useState<boolean>(false);
  const [beraten, setBeraten] = useState<boolean>(false); // Einkommensteuererklärung durch Steuerberater

  // --- NETTO BRUTTO RECHNER LOGIC ---
  const nettoResult = useMemo(() => {
    const br = Math.max(0, brutto);

    // Beitragsbemessungsgrenzen 2026 (Werte geschätzt nach aktuellen Entwürfen)
    // Kranken-/Pflegeversicherung: ca. 5.400 € monatlich
    // Renten-/Arbeitslosenversicherung: ca. 8.000 € monatlich
    const limitKV_PV = 5400;
    const limitRV_AV = 8000;

    const grossForKV_PV = Math.min(br, limitKV_PV);
    const grossForRV_AV = Math.min(br, limitRV_AV);

    // Sozialversicherungsbeiträge 2026 (Prozentsätze Arbeitnehmer-Anteil)
    // Krankenversicherung (KV): 7.3% + halber Zusatzbeitrag (ca. 1.7% / 2 = 0.85%) = 8.15%
    const kvRate = 0.0815;
    const kvBeitrag = grossForKV_PV * kvRate;

    // Rentenversicherung (RV): 9.3% (die Hälfte von 18.6%)
    const rvRate = 0.093;
    const rvBeitrag = grossForRV_AV * rvRate;

    // Arbeitslosenversicherung (AV): 1.3% (die Hälfte von 2.6%)
    const avRate = 0.013;
    const avBeitrag = grossForRV_AV * avRate;

    // Pflegeversicherung (PV): Basis AN-Anteil 2.3%. 
    // Wenn kinderlos, zusätzlich Kinderlosenzuschlag von 0.6% = 2.9%
    const pvRate = hatKinder ? 0.023 : 0.029;
    const pvBeitrag = grossForKV_PV * pvRate;

    const summeSozialabgaben = kvBeitrag + rvBeitrag + avBeitrag + pvBeitrag;

    // Lohnsteuer-Schätzung (Progressiv & Steuerklassen-abhängig)
    let lohnsteuer = 0;
    if (br > 0) {
      // Ermittlung eines fiktiven Steuersatzes auf Basis der Steuerklasse
      let effectiveGross = br;
      
      // Freibeträge simulieren durch Reduktion des steuerlich relevanten Bruttos
      if (steuerklasse === 1 || steuerklasse === 4) {
        effectiveGross = Math.max(0, br - 1050);
      } else if (steuerklasse === 2) {
        effectiveGross = Math.max(0, br - 1450); // Höherer Freibetrag für Alleinerziehende
      } else if (steuerklasse === 3) {
        effectiveGross = Math.max(0, br - 2100); // Sehr hohe Freibeträge durch Ehegatten-Splitting
      } else if (steuerklasse === 5) {
        effectiveGross = br + 500; // Sehr hohe Besteuerung ab dem ersten Euro
      } else if (steuerklasse === 6) {
        effectiveGross = br + 1000; // Zweitjob ohne Freibeträge
      }

      // Progressiver Tarifverlauf-Schätzer
      if (effectiveGross > 0) {
        if (effectiveGross < 500) {
          lohnsteuer = effectiveGross * 0.05;
        } else if (effectiveGross < 1500) {
          // Linearer Anstieg von 5% bis 14%
          const factor = (effectiveGross - 500) / 1000;
          lohnsteuer = effectiveGross * (0.05 + factor * 0.09);
        } else if (effectiveGross < 3500) {
          // Linearer Anstieg von 14% bis 24%
          const factor = (effectiveGross - 1500) / 2000;
          lohnsteuer = effectiveGross * (0.14 + factor * 0.10);
        } else if (effectiveGross < 6000) {
          // Linearer Anstieg von 24% bis 35%
          const factor = (effectiveGross - 3500) / 2500;
          lohnsteuer = effectiveGross * (0.24 + factor * 0.11);
        } else {
          // Spitzensteuersatz Schätzer
          lohnsteuer = effectiveGross * 0.38;
        }
      }
    }

    // Soli-Zuschlag: 5.5% der Lohnsteuer, wenn Lohnsteuer die Freigrenze übersteigt
    const soliGrenzbetrag = 1500; // monatliche Lohnsteuer-Freigrenze Schätzung
    const soliBeitrag = lohnsteuer > soliGrenzbetrag ? lohnsteuer * 0.055 : 0;

    // Kirchensteuer: 8% oder 9% der Lohnsteuer
    const kiStRate = kirchensteuer ? (bundesland === 'BW_BY' ? 0.08 : 0.09) : 0;
    const kirchensteuerBeitrag = lohnsteuer * kiStRate;

    const summeSteuern = lohnsteuer + soliBeitrag + kirchensteuerBeitrag;
    const netto = Math.max(0, br - summeSozialabgaben - summeSteuern);

    // Arbeitgeber-Anteile (Zusatzbelastung)
    const kvBeitragAG = grossForKV_PV * 0.0815; // 7.3% + 0.85% Zusatzbeitrag
    const rvBeitragAG = grossForRV_AV * 0.093;  // 9.3%
    const avBeitragAG = grossForRV_AV * 0.013;  // 1.3%
    // AG zahlt in der PV die Hälfte des Basisbeitrags (2.3% / 2 = 1.15%), zahlt aber keinen Kinderlosenzuschlag!
    const pvBeitragAG = grossForKV_PV * 0.0115; 
    
    const summeAGAbgaben = kvBeitragAG + rvBeitragAG + avBeitragAG + pvBeitragAG;
    const arbeitgeberGesamtbelastung = br + summeAGAbgaben;

    return {
      brutto: br,
      kvBeitrag,
      rvBeitrag,
      avBeitrag,
      pvBeitrag,
      summeSozialabgaben,
      lohnsteuer,
      soliBeitrag,
      kirchensteuerBeitrag,
      summeSteuern,
      netto,
      kvBeitragAG,
      rvBeitragAG,
      avBeitragAG,
      pvBeitragAG,
      summeAGAbgaben,
      arbeitgeberGesamtbelastung
    };
  }, [brutto, steuerklasse, kirchensteuer, bundesland, hatKinder]);

  // --- FRISTENRECHNER LOGIC ---
  // Hilfsfunktion: Berechnet verschobene Wochenend-Fristen nach § 108 Abs. 3 AO
  const calculateDueDate = (year: number, month: number, day: number): { dateStr: string; dayName: string; isShifted: boolean } => {
    // month ist 0-basiert (0 = Januar, 11 = Dezember)
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sonntag, 6 = Samstag, 5 = Freitag...
    
    let finalDate = new Date(date);
    let isShifted = false;

    // Wenn Fristende auf Samstag (6) oder Sonntag (0) oder Feiertag (hier vereinfacht nur Wochenenden) fällt, 
    // verschiebt sich die Frist auf den nächsten Werktag (Montag).
    if (dayOfWeek === 6) { // Samstag
      finalDate.setDate(date.getDate() + 2);
      isShifted = true;
    } else if (dayOfWeek === 0) { // Sonntag
      finalDate.setDate(date.getDate() + 1);
      isShifted = true;
    }

    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const formattedDate = finalDate.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return {
      dateStr: formattedDate,
      dayName: weekdays[finalDate.getDay()],
      isShifted
    };
  };

  const deadLinesList = useMemo(() => {
    const list = [];
    if (steuerart === 'ust_voranmeldung') {
      // Umsatzsteuervoranmeldung ist fällig zum 10. des Folgemonats
      // Bei Dauerfristverlängerung (DFV) verschiebt sich das um 1 Monat
      const monate = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
      ];

      for (let m = 0; m < 12; m++) {
        // Welcher Monat wird gemeldet?
        const anmeldeMonat = monate[m];
        // Wann ist Fälligkeit?
        // Standard: Fällig am 10. des Folgemonats (m + 1)
        // Mit DFV: Fällig am 10. des zweitfolgenden Monats (m + 2)
        let dueMonth = m + 1;
        let dueYear = jahr;

        if (dauerfristverlaengerung) {
          dueMonth += 1;
        }

        if (dueMonth >= 12) {
          dueMonth = dueMonth % 12;
          dueYear += 1;
        }

        const dueInfo = calculateDueDate(dueYear, dueMonth, 10);
        list.push({
          period: `${anmeldeMonat} ${jahr}`,
          standardDay: '10.',
          dueDate: dueInfo.dateStr,
          dayName: dueInfo.dayName,
          isShifted: dueInfo.isShifted,
          note: dauerfristverlaengerung ? 'Inkl. Dauerfristverlängerung (+1 Monat)' : 'Reguläre Frist'
        });
      }
    } else {
      // Einkommensteuererklärung
      // Ohne Berater: 31. Juli des Folgejahres
      // Mit Berater: z.B. Ende April des übernächsten Jahres (aufgrund von Covid/Übergangsregelungen angepasst, standardmäßig April/März)
      const dueYearWithout = jahr + 1;
      const dueInfoWithout = calculateDueDate(dueYearWithout, 6, 31); // 31. Juli (6 = Juli, da 0-basiert)

      const dueYearWith = jahr + 2;
      const dueInfoWith = calculateDueDate(dueYearWith, 3, 30); // 30. April (3 = April)

      list.push({
        period: `Einkommensteuererklärung für das Jahr ${jahr}`,
        standardDay: beraten ? '30. April' : '31. Juli',
        dueDate: beraten ? dueInfoWith.dateStr : dueInfoWithout.dateStr,
        dayName: beraten ? dueInfoWith.dayName : dueInfoWithout.dayName,
        isShifted: beraten ? dueInfoWith.isShifted : dueInfoWithout.isShifted,
        note: beraten ? 'Beratene Fälle (durch Steuerberater)' : 'Unberatene Fälle (Selbsterstellung)'
      });
    }
    return list;
  }, [steuerart, jahr, dauerfristverlaengerung, beraten]);

  // Speichern-Funktion für Berechnungen
  const handleSaveNetto = () => {
    onSaveCalculation({
      type: 'brutto_netto',
      title: `Netto-Berechnung (${brutto} € Brutto, StKl ${steuerklasse})`,
      details: `Brutto: ${brutto.toFixed(2)} € | Netto: ${nettoResult.netto.toFixed(2)} € | Abzüge: ${nettoResult.summeSteuern.toFixed(2)} € Steuern, ${nettoResult.summeSozialabgaben.toFixed(2)} € Sozialbeiträge.`
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleSaveFristen = () => {
    const detailString = steuerart === 'ust_voranmeldung'
      ? `Umsatzsteuervoranmeldung ${jahr} (${dauerfristverlaengerung ? 'mit DFV' : 'ohne DFV'})`
      : `Einkommensteuererklärung ${jahr} (${beraten ? 'mit Berater fällig am ' + deadLinesList[0].dueDate : 'ohne Berater fällig am ' + deadLinesList[0].dueDate})`;

    onSaveCalculation({
      type: 'fristen',
      title: steuerart === 'ust_voranmeldung' ? `Umsatzsteuer-Fristen ${jahr}` : `Einkommensteuer-Frist ${jahr}`,
      details: detailString
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return (
    <div id="calculators-section" className="space-y-6">
      
      {/* Top Header & Breadcrumbs / Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-emerald-600" />
            Kanzlei-Tools & Rechner
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kostenfreie interaktive Online-Werkzeuge und Anweisungen für Kanzleibesucher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'list' && (
            <button
              id="back-to-list-btn"
              onClick={() => {
                setActiveTab('list');
                setActiveCustomTool(null);
              }}
              className="inline-flex items-center gap-2 py-2 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-emerald-600" />
              Übersicht anzeigen
            </button>
          )}

          {userProfile.isLoggedIn && (
            <button
              id="tab-btn-saved-calcs"
              onClick={() => setActiveTab(activeTab === 'saved' ? 'list' : 'saved')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'saved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Meine Berechnungen
              {savedCalculations.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-black">
                  {savedCalculations.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {showSaveSuccess && (
        <div id="save-success-banner" className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm transition-all">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold">Erfolgreich gespeichert!</span> Die Berechnung wurde in Ihrem Benutzerbereich gesichert.
          </div>
        </div>
      )}

      {/* --- REITER 'LIST': ALL AVAILABLE TOOLS --- */}
      {activeTab === 'list' && (
        <div id="tools-list-dashboard" className="space-y-6">
          {/* Suche & Kategorienfilter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            {/* Filter-Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Suchfeld */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="tool-search-input"
                type="text"
                placeholder="Tool durchsuchen..."
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div 
                  id={`tool-card-${tool.id}`} 
                  key={tool.id} 
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {tool.category || 'Allgemein'}
                      </span>
                      {userProfile.role === 'admin' && (
                        <button
                          id={`delete-tool-btn-${tool.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Möchten Sie das Tool "${tool.title}" wirklich löschen?`)) {
                              onDeleteTool(tool.id);
                            }
                          }}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tool löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      {tool.type === 'custom' ? 'Anleitung' : 'Interaktiv'}
                    </span>
                    
                    <button
                      id={`start-tool-${tool.id}`}
                      onClick={() => {
                        if (tool.type === 'brutto_netto') {
                          setActiveTab('netto');
                        } else if (tool.type === 'fristen') {
                          setActiveTab('fristen');
                        } else {
                          setActiveCustomTool(tool);
                          setActiveTab('custom_tool');
                        }
                      }}
                      className="inline-flex items-center gap-1 py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Öffnen
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
              <Info className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Keine passenden Tools gefunden.</p>
              <p className="text-xs mt-1">Ändern Sie Ihre Suche oder die ausgewählte Kategorie.</p>
            </div>
          )}
        </div>
      )}

      {/* --- REITER 'CUSTOM_TOOL': DETAIL VIEW FOR CUSTOM TOOLS --- */}
      {activeTab === 'custom_tool' && activeCustomTool && (
        <div id="custom-tool-detail-container" className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded uppercase">
                {activeCustomTool.category || 'Allgemein'}
              </span>
              <span className="text-xs text-gray-400">• Nützliche Anleitung / Hilfestellung</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-gray-900">{activeCustomTool.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
              {activeCustomTool.description}
            </p>
          </div>

          <div className="prose prose-emerald max-w-none text-gray-800 text-sm leading-relaxed space-y-4 pt-4 border-t border-gray-50">
            {activeCustomTool.content ? (
              <div className="whitespace-pre-line bg-white rounded-xl border border-gray-50 p-6 shadow-inner text-gray-700">
                {activeCustomTool.content}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                Keine zusätzlichen Detailinformationen für dieses Tool hinterlegt.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              Bereitgestellt von Kanzlei Lexonomy
            </div>
            
            <button
              onClick={() => {
                setActiveTab('list');
                setActiveCustomTool(null);
              }}
              className="py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 1: BRUTTO-NETTO-RECHNER --- */}
      {activeTab === 'netto' && (
        <div id="netto-calculator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Eingabeformular */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Gehaltsdaten eingeben</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Monatliches Bruttogehalt (€)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    id="input-brutto"
                    type="number"
                    min="0"
                    step="50"
                    className="block w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                    value={brutto}
                    onChange={(e) => setBrutto(Number(e.target.value))}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 font-semibold">
                    EUR
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Steuerklasse
                </label>
                <select
                  id="select-steuerklasse"
                  className="block w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={steuerklasse}
                  onChange={(e) => setSteuerklasse(Number(e.target.value))}
                >
                  <option value={1}>Klasse 1 (Ledig, geschieden, verwitwet)</option>
                  <option value={2}>Klasse 2 (Alleinerziehend)</option>
                  <option value={3}>Klasse 3 (Verheiratet, Partner in Klasse 5)</option>
                  <option value={4}>Klasse 4 (Verheiratet, beide in Klasse 4)</option>
                  <option value={5}>Klasse 5 (Verheiratet, Partner in Klasse 3)</option>
                  <option value={6}>Klasse 6 (Zweitjob, Nebenbeschäftigung)</option>
                </select>
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Kirchensteuerpflichtig</span>
                    <p className="text-xs text-gray-400">Ja nach Religionszugehörigkeit</p>
                  </div>
                  <input
                    id="checkbox-kirchensteuer"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={kirchensteuer}
                    onChange={(e) => setKirchensteuer(e.target.checked)}
                  />
                </div>

                {kirchensteuer && (
                  <div className="pl-4 border-l-2 border-emerald-100 py-1 transition-all">
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                      Bundesland
                    </label>
                    <select
                      id="select-bundesland"
                      className="block w-full py-1.5 px-2 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={bundesland}
                      onChange={(e) => setBundesland(e.target.value as 'BW_BY' | 'OTHERS')}
                    >
                      <option value="BW_BY">Baden-Württemberg / Bayern (8 %)</option>
                      <option value="OTHERS">Andere Bundesländer (9 %)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Kinder vorhanden</span>
                    <p className="text-xs text-gray-400">Senkt den Pflegeversicherungs-Satz</p>
                  </div>
                  <input
                    id="checkbox-kinder"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={hatKinder}
                    onChange={(e) => setHatKinder(e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {userProfile.role !== 'guest' ? (
              <button
                id="btn-save-netto-calc"
                onClick={handleSaveNetto}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <Save className="h-4 w-4" />
                Berechnung speichern
              </button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
                Melden Sie sich an, um Ihre Lohnabrechnungen dauerhaft zu speichern.
              </div>
            )}
          </div>

          {/* Berechnungsergebnisse */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Berechnungsergebnis 2026</h3>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100">
                  Steuerklasse {steuerklasse}
                </span>
              </div>

              {/* Großes Nettogehalt */}
              <div className="text-center py-6 bg-gradient-to-r from-emerald-50/40 to-teal-50/20 rounded-2xl mt-4 border border-emerald-50/50">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">Netto-Auszahlung (Monat)</span>
                <span className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1 block">
                  {nettoResult.netto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>

              {/* Aufteilung Details */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Bruttogehalt</span>
                  <span className="font-bold text-gray-900">{nettoResult.brutto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                </div>

                {/* Steuern */}
                <div className="space-y-1 bg-red-50/10 rounded-xl p-3 border border-red-50/50">
                  <div className="flex justify-between text-xs font-semibold text-red-800">
                    <span>Abzüge Steuern</span>
                    <span>- {nettoResult.summeSteuern.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  <div className="pl-3 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Lohnsteuer</span>
                      <span>{nettoResult.lohnsteuer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    {nettoResult.soliBeitrag > 0 && (
                      <div className="flex justify-between">
                        <span>Solidaritätszuschlag (Soli)</span>
                        <span>{nettoResult.soliBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    )}
                    {nettoResult.kirchensteuerBeitrag > 0 && (
                      <div className="flex justify-between">
                        <span>Kirchensteuer ({bundesland === 'BW_BY' ? '8%' : '9%'})</span>
                        <span>{nettoResult.kirchensteuerBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sozialabgaben */}
                <div className="space-y-1 bg-blue-50/10 rounded-xl p-3 border border-blue-50/50">
                  <div className="flex justify-between text-xs font-semibold text-blue-800">
                    <span>Sozialversicherungen (Arbeitnehmer-Anteil)</span>
                    <span>- {nettoResult.summeSozialabgaben.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  <div className="pl-3 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Krankenversicherung (8.15 %)</span>
                      <span>{nettoResult.kvBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rentenversicherung (9.3 %)</span>
                      <span>{nettoResult.rvBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pflegeversicherung ({hatKinder ? '2.3 %' : '2.9 %'})</span>
                      <span>{nettoResult.pvBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arbeitslosenversicherung (1.3 %)</span>
                      <span>{nettoResult.avBeitrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zusatzinfo: Arbeitgeberbelastung */}
            <div className="mt-6 border-t border-gray-100 pt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700">Kanzlei- & Arbeitgeber-Sicht (Vollkosten):</p>
                  <p>
                    Die Arbeitgeber-Abgaben belaufen sich auf <span className="font-semibold text-gray-800">{nettoResult.summeAGAbgaben.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>.
                  </p>
                  <p>
                    Die tatsächliche Gesamtbelastung für den Arbeitgeber beträgt: <span className="font-bold text-gray-800">{nettoResult.arbeitgeberGesamtbelastung.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: FRISTENRECHNER --- */}
      {activeTab === 'fristen' && (
        <div id="fristen-calculator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Eingabe/Auswahl */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Steuerart & Frist-Filter</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Steuerart auswählen
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:border-emerald-300">
                    <input
                      id="radio-ust-voranmeldung"
                      type="radio"
                      name="steuerart"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      checked={steuerart === 'ust_voranmeldung'}
                      onChange={() => setSteuerart('ust_voranmeldung')}
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-800 block">Umsatzsteuervoranmeldung</span>
                      <span className="text-gray-400">Monatliche Abgabe (§ 18 UStG)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:border-emerald-300">
                    <input
                      id="radio-est-erklaerung"
                      type="radio"
                      name="steuerart"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      checked={steuerart === 'est_erklaerung'}
                      onChange={() => setSteuerart('est_erklaerung')}
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-800 block">Einkommensteuererklärung</span>
                      <span className="text-gray-400">Jährliche Veranlagung (§ 25 EStG)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Veranlagungsjahr / Zeitraum
                </label>
                <select
                  id="select-jahr"
                  className="block w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={jahr}
                  onChange={(e) => setJahr(Number(e.target.value))}
                >
                  <option value={2025}>Veranlagungsjahr 2025</option>
                  <option value={2026}>Veranlagungsjahr 2026</option>
                  <option value={2027}>Veranlagungsjahr 2027</option>
                </select>
              </div>

              {steuerart === 'ust_voranmeldung' ? (
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Dauerfristverlängerung</span>
                    <span className="text-xs text-gray-400">Meldung verschiebt sich um 1 Monat</span>
                  </div>
                  <input
                    id="checkbox-dfv"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={dauerfristverlaengerung}
                    onChange={(e) => setDauerfristverlaengerung(e.target.checked)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Durch Steuerberater beraten</span>
                    <span className="text-xs text-gray-400">Verlängert die gesetzliche Abgabefrist</span>
                  </div>
                  <input
                    id="checkbox-beraten"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={beraten}
                    onChange={(e) => setBeraten(e.target.checked)}
                  />
                </div>
              )}
            </div>

            {userProfile.role !== 'guest' ? (
              <button
                id="btn-save-fristen-calc"
                onClick={handleSaveFristen}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
              >
                <Save className="h-4 w-4" />
                Fristenplan speichern
              </button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
                Melden Sie sich an, um diesen Fristenplan für Ihre Handakte zu sichern.
              </div>
            )}
          </div>

          {/* Ergebnistabelle */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Fällige Abgabefristen ({jahr})</h3>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                Nach § 108 AO
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Zeitraum / Steuerfall</th>
                    <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Regulär am</th>
                    <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Fällig am (Werktag)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deadLinesList.map((dl, index) => (
                    <tr id={`deadline-row-${index}`} key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-semibold text-gray-900 text-sm block">{dl.period}</span>
                        <span className="text-[11px] text-gray-400 block mt-0.5">{dl.note}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {dl.standardDay} des Folgezeitraums
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-block">
                          <span className={`font-bold text-sm block ${dl.isShifted ? 'text-amber-600' : 'text-gray-900'}`}>
                            {dl.dueDate}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {dl.dayName} {dl.isShifted && '(Wochenendverschiebung)'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kanzlei-Hinweis gemäß Abgabenordnung (AO):</span> Fällt das Ende einer Frist auf einen Samstag, Sonntag oder einen gesetzlichen Feiertag, so verschiebt sich das Ende der Frist auf den Ablauf des nächsten Werktags (§ 108 Abs. 3 AO). Bitte beachten Sie länderspezifische Feiertage in Ihrer Kanzleipraxis!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: SAVED CALCULATIONS (FOR USER) --- */}
      {activeTab === 'saved' && userProfile.role !== 'guest' && (
        <div id="saved-calculations-container" className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ihre gespeicherten Berechnungen</h3>

          {savedCalculations.length > 0 ? (
            <div className="space-y-4">
              {savedCalculations.map((calc) => (
                <div
                  id={`saved-calc-card-${calc.id}`}
                  key={calc.id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        calc.type === 'brutto_netto' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {calc.type === 'brutto_netto' ? 'Brutto-Netto' : 'Fristenplan'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{calc.date}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{calc.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-mono bg-gray-50 p-2 rounded-lg mt-2 border border-gray-100">
                      {calc.details}
                    </p>
                  </div>

                  <button
                    id={`delete-calc-btn-${calc.id}`}
                    onClick={() => onDeleteCalculation(calc.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg self-end sm:self-center transition-colors"
                    title="Berechnung löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
              <Calculator className="h-10 w-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-900 mt-3">Noch keine Berechnungen gesichert</h4>
              <p className="text-xs text-gray-500 mt-1">
                Nutzen Sie den Brutto-Netto-Rechner oder den Fristenplaner und klicken Sie auf &quot;Berechnung speichern&quot;.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
