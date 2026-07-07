/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, LogIn, UserPlus, LogOut, Bookmark, Calculator, Key, Shield } from 'lucide-react';
import { UserProfile, GlossaryTerm, SavedCalculation } from '../types';

interface UserProfileSectionProps {
  userProfile: UserProfile;
  onLogin: (username: string, role: 'user' | 'admin') => void;
  onLogout: () => void;
  terms: GlossaryTerm[];
  bookmarkedIds: string[];
  savedCalculations: SavedCalculation[];
  onRemoveBookmark: (id: string) => void;
  onDeleteCalculation: (id: string) => void;
  onToggleAdminView: () => void;
}

export default function UserProfileSection({
  userProfile,
  onLogin,
  onLogout,
  terms,
  bookmarkedIds,
  savedCalculations,
  onRemoveBookmark,
  onDeleteCalculation,
  onToggleAdminView,
}: UserProfileSectionProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [activeUserTab, setActiveUserTab] = useState<'bookmarks' | 'calcs'>('bookmarks');

  // Filter bookmarked terms
  const favoriteTerms = terms.filter((t) => bookmarkedIds.includes(t.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Bitte geben Sie Benutzername und Passwort ein.');
      return;
    }
    
    if (username.toLowerCase() === 'admin') {
      alert('Der Benutzername "admin" ist für den Administrator reserviert. Bitte loggen Sie sich über das Admin-Dashboard mit dem Passwort "admin123" ein.');
      return;
    }

    // Client-seitiges Mock-Login: Wir speichern/prüfen in localStorage
    const users = JSON.parse(localStorage.getItem('lexonomy_users') || '{}');
    if (isRegistering) {
      if (users[username]) {
        alert('Dieser Benutzername existiert bereits!');
        return;
      }
      users[username] = password;
      localStorage.setItem('lexonomy_users', JSON.stringify(users));
      alert('Registrierung erfolgreich! Sie wurden automatisch eingeloggt.');
      onLogin(username, 'user');
    } else {
      if (users[username] && users[username] === password) {
        onLogin(username, 'user');
      } else if (username === 'testuser' && password === 'test') {
        // Standard Test-Nutzer
        onLogin('testuser', 'user');
      } else {
        alert('Falscher Benutzername oder Passwort! (Tipp: Nutzen Sie "testuser" mit Passwort "test" oder registrieren Sie sich)');
      }
    }

    setUsername('');
    setPassword('');
  };

  // Wenn der Benutzer NICHT eingeloggt ist, zeigen wir das Login/Registrierungsformular
  if (!userProfile.isLoggedIn) {
    return (
      <div id="auth-container" className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isRegistering ? 'Einen Account erstellen' : 'Im Kanzlei-Portal anmelden'}
          </h2>
          <p className="text-xs text-gray-500">
            {isRegistering 
              ? 'Erstellen Sie ein kostenloses Profil, um Ihre Steuerberechnungen und Lesezeichen dauerhaft auf diesem Gerät zu sichern.' 
              : 'Nutzen Sie ein bestehendes Profil oder registrieren Sie sich neu, um Ihre Daten zu verwalten.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Benutzername
            </label>
            <input
              id="auth-username"
              type="text"
              required
              placeholder="z.B. mandant123"
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Passwort
            </label>
            <input
              id="auth-password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="auth-submit"
            type="submit"
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {isRegistering ? 'Kostenlos registrieren' : 'Jetzt einloggen'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-50">
          <button
            id="toggle-auth-mode"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs text-emerald-600 font-semibold hover:underline"
          >
            {isRegistering ? 'Bereits einen Account? Hier einloggen' : 'Noch keinen Account? Hier registrieren'}
          </button>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 border border-gray-100 space-y-1">
          <p className="font-semibold text-gray-700">💡 Test-Login für Steuerfachgehilfen:</p>
          <p>Nutzer: <span className="font-mono bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded">testuser</span> | Passwort: <span className="font-mono bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded">test</span></p>
        </div>
      </div>
    );
  }

  // Eingeloggte Ansicht (Benutzer-Dashboard)
  return (
    <div id="user-profile-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Benutzer-Info Karte */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Willkommen zurück,</span>
              <h3 className="font-bold text-gray-900 text-lg">{userProfile.username}</h3>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Rolle:</span>
              <span className="font-bold text-gray-800 uppercase flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-600" />
                {userProfile.role === 'admin' ? 'Administrator' : 'Kanzlei-Mandant'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Gespeicherte Fristen/Rechnungen:</span>
              <span className="font-semibold text-gray-800">{savedCalculations.length}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lesezeichen im Lexikon:</span>
              <span className="font-semibold text-gray-800">{bookmarkedIds.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-50">
          {userProfile.role === 'admin' && (
            <button
              id="user-profile-to-admin"
              onClick={onToggleAdminView}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5" />
              Zum Admin-Dashboard wechseln
            </button>
          )}

          <button
            id="user-profile-logout"
            onClick={onLogout}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-red-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Abmelden
          </button>
        </div>
      </div>

      {/* Gespeicherte Inhalte (Bookmarks & Rechnungen) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex border-b border-gray-100">
          <button
            id="user-tab-bookmarks"
            onClick={() => setActiveUserTab('bookmarks')}
            className={`py-3 px-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeUserTab === 'bookmarks'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Lexikon-Favoriten ({favoriteTerms.length})
          </button>
          <button
            id="user-tab-calcs"
            onClick={() => setActiveUserTab('calcs')}
            className={`py-3 px-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeUserTab === 'calcs'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            Gespeicherte Berechnungen ({savedCalculations.length})
          </button>
        </div>

        {/* Ansicht Bookmarks */}
        {activeUserTab === 'bookmarks' && (
          <div className="space-y-4">
            {favoriteTerms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteTerms.map((term) => (
                  <div
                    id={`fav-term-card-${term.id}`}
                    key={term.id}
                    className="p-4 border border-gray-100 rounded-xl relative group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-gray-900 text-sm">{term.term}</h4>
                        <button
                          id={`fav-term-remove-${term.id}`}
                          onClick={() => onRemoveBookmark(term.id)}
                          className="text-gray-300 hover:text-red-500 p-1"
                          title="Aus Favoriten entfernen"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                      {term.law && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                          {term.law}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                        {term.definition}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="font-semibold uppercase tracking-wider text-gray-400">{term.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
                <Bookmark className="h-8 w-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-semibold text-gray-900 mt-2">Noch keine Favoriten gesetzt</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Klicken Sie im Steuer-Lexikon auf das Lesezeichen-Symbol eines Begriffs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ansicht Rechnungen */}
        {activeUserTab === 'calcs' && (
          <div className="space-y-4">
            {savedCalculations.length > 0 ? (
              <div className="space-y-3">
                {savedCalculations.map((calc) => (
                  <div
                    id={`fav-calc-card-${calc.id}`}
                    key={calc.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        {calc.type === 'brutto_netto' ? 'Lohnberechnung' : 'Fristenplan'}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{calc.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded-lg leading-relaxed border border-gray-100">
                        {calc.details}
                      </p>
                    </div>

                    <button
                      id={`fav-calc-delete-${calc.id}`}
                      onClick={() => onDeleteCalculation(calc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg self-end sm:self-center transition-colors"
                      title="Berechnung löschen"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
                <Calculator className="h-8 w-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-semibold text-gray-900 mt-2">Keine Berechnungen gesichert</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Verwenden Sie unsere Rechner und sichern Sie die Ergebnisse für Ihre Akte.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Trash2Icon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}
