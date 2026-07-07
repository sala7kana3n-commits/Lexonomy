/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Bookmark, BookmarkCheck, FileText, Scale, Calendar, HelpCircle } from 'lucide-react';
import { GlossaryTerm, UserProfile } from '../types';

interface GlossarySectionProps {
  terms: GlossaryTerm[];
  userProfile: UserProfile;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  // Admin-spezifische Aktionen, falls der Admin direkt im Lexikon editieren möchte
  isAdmin: boolean;
  onEditTerm?: (term: GlossaryTerm) => void;
  onDeleteTerm?: (id: string) => void;
}

export default function GlossarySection({
  terms,
  userProfile,
  bookmarkedIds,
  onToggleBookmark,
  isAdmin,
  onEditTerm,
  onDeleteTerm,
}: GlossarySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedLetter, setSelectedLetter] = useState<string>('Alle');
  const [activeTermId, setActiveTermId] = useState<string | null>(null);

  // Einzigartige Kategorien ermitteln
  const categories = useMemo(() => {
    const cats = new Set<string>();
    terms.forEach(t => cats.add(t.category));
    return ['Alle', ...Array.from(cats)];
  }, [terms]);

  // Das Alphabet für den Buchstaben-Filter erstellen
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    terms.forEach(t => {
      const firstChar = t.term.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return ['Alle', ...Array.from(letters).sort()];
  }, [terms]);

  // Filterung der Begriffe
  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const matchesSearch = 
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.law && t.law.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.example && t.example.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'Alle' || t.category === selectedCategory;
      const matchesLetter = selectedLetter === 'Alle' || t.term.toUpperCase().startsWith(selectedLetter);

      return matchesSearch && matchesCategory && matchesLetter;
    });
  }, [terms, searchQuery, selectedCategory, selectedLetter]);

  return (
    <section id="glossary-section" className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6 text-emerald-600" />
            Lexonomy Steuer-Lexikon
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Das verständliche Nachschlagewerk für das deutsche Steuerrecht. Suchen Sie nach Fachbegriffen, Paragraphen oder Anwendungsfällen – optimiert für Steuerfachangestellte, Unternehmer und Kanzleien.
          </p>
        </div>

        {/* Such- und Filterleiste */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="glossary-search"
              type="text"
              placeholder="Suchen nach Werbungskosten, UStG, Paragraph..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Kategorien-Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Bereich:</span>
            {categories.map((cat) => (
              <button
                id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Alphabetischer Index */}
          <div className="flex flex-wrap gap-1.5 items-center border-t border-gray-100 pt-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Index:</span>
            {alphabet.map((letter) => (
              <button
                id={`letter-filter-${letter.toLowerCase()}`}
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`h-7 px-2 min-w-[28px] rounded text-xs font-medium transition-colors flex items-center justify-center ${
                  selectedLetter === letter
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glossar-Ergebnisse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term) => {
            const isBookmarked = bookmarkedIds.includes(term.id);
            const isActive = activeTermId === term.id;

            return (
              <div
                id={`term-card-${term.id}`}
                key={term.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                  isActive 
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{term.term}</h3>
                      {term.law && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Scale className="h-3 w-3" />
                          {term.law}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {/* Lesezeichen für registrierte Benutzer */}
                      {userProfile.role !== 'guest' && (
                        <button
                          id={`bookmark-btn-${term.id}`}
                          onClick={() => onToggleBookmark(term.id)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
                          title={isBookmarked ? "Lesezeichen entfernen" : "Lesezeichen hinzufügen"}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </button>
                      )}

                      {/* Admin Controls */}
                      {isAdmin && onEditTerm && onDeleteTerm && (
                        <>
                          <button
                            id={`edit-term-btn-${term.id}`}
                            onClick={() => onEditTerm(term)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-xs font-semibold"
                            title="Begriff bearbeiten"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-term-btn-${term.id}`}
                            onClick={() => onDeleteTerm(term.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold"
                            title="Begriff löschen"
                          >
                            Löschen
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                    {term.definition}
                  </p>

                  {/* Praxisbeispiel */}
                  {term.example && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border-l-2 border-amber-400">
                      <span className="font-semibold text-gray-700 block mb-1">Praxisbeispiel:</span>
                      {term.example}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {term.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Aktualisiert: {term.lastUpdated}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100 p-6">
            <HelpCircle className="h-10 w-10 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">Keine Steuerbegriffe gefunden</h3>
            <p className="mt-1 text-xs text-gray-500">
              Probieren Sie es mit anderen Suchkriterien oder Begriffen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Lokales Hilfs-Icon für das Buch
function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}
