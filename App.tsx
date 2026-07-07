/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Youtube, 
  User, 
  Settings, 
  HelpCircle, 
  Check, 
  ShieldCheck, 
  Compass, 
  Scale, 
  BookMarked, 
  Search, 
  LogOut,
  Info
} from 'lucide-react';

import { SEOConfig, GlossaryTerm, YouTubeVideo, SocialMediaLink, SavedCalculation, UserProfile, TaxTool } from './types';
import { DEFAULT_SEO, DEFAULT_GLOSSARY, DEFAULT_YOUTUBE, DEFAULT_SOCIALS, DEFAULT_TOOLS } from './data';

import GlossarySection from './components/GlossarySection';
import CalculatorsSection from './components/CalculatorsSection';
import MediaSection from './components/MediaSection';
import AdminDashboard from './components/AdminDashboard';
import UserProfileSection from './components/UserProfileSection';

export default function App() {
  // =========================================================================
  // STATE-REGISTER (Die Steuerkanzlei-Datenbank im LocalStorage)
  // =========================================================================

  // 1. SEO-Daten laden (Titel, Beschreibung, Keywords)
  const [seoConfig, setSeoConfig] = useState<SEOConfig>(() => {
    const saved = localStorage.getItem('lexonomy_seo');
    return saved ? JSON.parse(saved) : DEFAULT_SEO;
  });

  // 2. Glossar-Begriffe laden (Die Fachdatenbank für Gesetze)
  const [terms, setTerms] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('lexonomy_glossary');
    return saved ? JSON.parse(saved) : DEFAULT_GLOSSARY;
  });

  // 3. YouTube-Videos laden
  const [videos, setVideos] = useState<YouTubeVideo[]>(() => {
    const saved = localStorage.getItem('lexonomy_youtube');
    return saved ? JSON.parse(saved) : DEFAULT_YOUTUBE;
  });

  // 4. Social-Media-Links laden
  const [socials, setSocials] = useState<SocialMediaLink[]>(() => {
    const saved = localStorage.getItem('lexonomy_socials');
    return saved ? JSON.parse(saved) : DEFAULT_SOCIALS;
  });

  // 5. Benutzer-Sitzung verwalten (Standard: Gast-Zugang)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lexonomy_current_user');
    return saved ? JSON.parse(saved) : { username: 'Gast', isLoggedIn: false, role: 'guest' };
  });

  // 6. Lesezeichen (Bookmarks) für Steuerbegriffe
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const user = localStorage.getItem('lexonomy_current_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.isLoggedIn) {
        const saved = localStorage.getItem(`lexonomy_bookmarks_${parsedUser.username}`);
        return saved ? JSON.parse(saved) : [];
      }
    }
    return [];
  });

  // 7. Gespeicherte Berechnungen (z.B. Lohnabrechnungs-Entwürfe)
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    const user = localStorage.getItem('lexonomy_current_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.isLoggedIn) {
        const saved = localStorage.getItem(`lexonomy_calcs_${parsedUser.username}`);
        return saved ? JSON.parse(saved) : [];
      }
    }
    return [];
  });

  // 8. Aktiver Reiter (Navigationstabs)
  const [activeTab, setActiveTab] = useState<'lexikon' | 'rechner' | 'mediathek' | 'benutzer' | 'admin' | 'hosting-guide'>('lexikon');

  // 9. Tools laden (Brutto-Netto-Rechner, Fristenrechner, etc.)
  const [tools, setTools] = useState<TaxTool[]>(() => {
    const saved = localStorage.getItem('lexonomy_tools');
    return saved ? JSON.parse(saved) : DEFAULT_TOOLS;
  });

  // =========================================================================
  // DYNAMISCHES SEO-UPDATE (Die Steuerbescheid-Automatik im Head)
  // =========================================================================
  // Dieser Effekt wird ausgeführt, sobald sich unsere SEO-Konfiguration ändert.
  // Er greift direkt in den <head> der HTML-Seite ein und schreibt die Meta-Tags neu,
  // damit Google die veränderten Daten indizieren kann.
  useEffect(() => {
    // A. Den Seitentitel im Browser-Tab anpassen
    document.title = seoConfig.title;

    // B. Die Meta-Beschreibung (Description) für den Google-Auszug anpassen
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoConfig.description);

    // C. Die Suchbegriffe (Meta-Keywords) aktualisieren
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seoConfig.keywords);

    // D. In den LocalStorage wegschreiben für Dauerhaftigkeit
    localStorage.setItem('lexonomy_seo', JSON.stringify(seoConfig));
  }, [seoConfig]);

  // Speicherung im LocalStorage bei Datenänderung
  useEffect(() => {
    localStorage.setItem('lexonomy_glossary', JSON.stringify(terms));
  }, [terms]);

  useEffect(() => {
    localStorage.setItem('lexonomy_youtube', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('lexonomy_socials', JSON.stringify(socials));
  }, [socials]);

  useEffect(() => {
    localStorage.setItem('lexonomy_tools', JSON.stringify(tools));
  }, [tools]);

  // Synchronisation der Lesezeichen & Berechnungen, wenn der Benutzer wechselt
  useEffect(() => {
    if (userProfile.isLoggedIn) {
      const savedBookmarked = localStorage.getItem(`lexonomy_bookmarks_${userProfile.username}`);
      setBookmarkedIds(savedBookmarked ? JSON.parse(savedBookmarked) : []);

      const savedCalcs = localStorage.getItem(`lexonomy_calcs_${userProfile.username}`);
      setSavedCalculations(savedCalcs ? JSON.parse(savedCalcs) : []);
    } else {
      setBookmarkedIds([]);
      setSavedCalculations([]);
    }
    localStorage.setItem('lexonomy_current_user', JSON.stringify(userProfile));
  }, [userProfile]);

  // =========================================================================
  // SCHNITTSTELLEN-AKTIONEN (Die Arbeitsanweisungen im Kanzleibetrieb)
  // =========================================================================

  // Lesezeichen setzen oder aufheben
  const handleToggleBookmark = (id: string) => {
    if (!userProfile.isLoggedIn) return;
    
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(bId => bId !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    
    setBookmarkedIds(updated);
    localStorage.setItem(`lexonomy_bookmarks_${userProfile.username}`, JSON.stringify(updated));
  };

  // Eine neue Steuer-Berechnung in die Handakte legen
  const handleSaveCalculation = (calc: Omit<SavedCalculation, 'id' | 'date'>) => {
    if (!userProfile.isLoggedIn) return;

    const newCalc: SavedCalculation = {
      ...calc,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    localStorage.setItem(`lexonomy_calcs_${userProfile.username}`, JSON.stringify(updated));
  };

  // Eine Berechnung aus der Handakte vernichten
  const handleDeleteCalculation = (id: string) => {
    if (!userProfile.isLoggedIn) return;

    const updated = savedCalculations.filter(c => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem(`lexonomy_calcs_${userProfile.username}`, JSON.stringify(updated));
  };

  // Benutzer-Anmeldung durchführen
  const handleLogin = (username: string, role: 'user' | 'admin') => {
    setUserProfile({
      username,
      isLoggedIn: true,
      role
    });
  };

  // Benutzer abmelden
  const handleLogout = () => {
    setUserProfile({
      username: 'Gast',
      isLoggedIn: false,
      role: 'guest'
    });
    setActiveTab('lexikon');
  };

  // --- ADMIN-SCHNITTSTELLEN ---
  const handleAddVideo = (newVideo: Omit<YouTubeVideo, 'id'>) => {
    const videoObj: YouTubeVideo = {
      ...newVideo,
      id: Date.now().toString()
    };
    setVideos([...videos, videoObj]);
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleUpdateSocial = (id: string, url: string) => {
    setSocials(socials.map(s => s.id === id ? { ...s, url } : s));
  };

  const handleAddTerm = (newTerm: Omit<GlossaryTerm, 'id' | 'lastUpdated'>) => {
    const termObj: GlossaryTerm = {
      ...newTerm,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setTerms([termObj, ...terms]);
  };

  const handleDeleteTerm = (id: string) => {
    setTerms(terms.filter(t => t.id !== id));
  };

  const handleAddTool = (newTool: Omit<TaxTool, 'id'>) => {
    const toolObj: TaxTool = {
      ...newTool,
      id: Date.now().toString()
    };
    setTools([...tools, toolObj]);
  };

  const handleDeleteTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  return (
    <div id="lexonomy-app" className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      
      {/* =========================================================================
          1. HEADER-BEREICH (Der Empfangsbereich der Kanzlei)
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo & Slogan */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-100 font-extrabold text-lg">
                L
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 block leading-none">Lexonomy</span>
                <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">Portal für Steuerwissen</span>
              </div>
            </div>

            {/* Quick-Info / Statuszeile */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>SEO-Schutz aktiv</span>
              </div>

              {userProfile.isLoggedIn && (
                <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{userProfile.username} ({userProfile.role === 'admin' ? 'Kanzlei-Admin' : 'Mandant'})</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HAUPTNAVIGATION (Die Aktenreiter für schnellen Zugriff)
          ========================================================================= */}
      <nav className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-1 py-2 overflow-x-auto">
            <button
              id="nav-btn-lexikon"
              onClick={() => setActiveTab('lexikon')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'lexikon' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Steuer-Lexikon
            </button>
            
            <button
              id="nav-btn-rechner"
              onClick={() => setActiveTab('rechner')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'rechner' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Calculator className="h-4 w-4" />
              Tools Bereich
            </button>

            <button
              id="nav-btn-mediathek"
              onClick={() => setActiveTab('mediathek')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'mediathek' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Youtube className="h-4 w-4" />
              Mediathek
            </button>

            <button
              id="nav-btn-benutzer"
              onClick={() => setActiveTab('benutzer')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'benutzer' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Benutzerbereich
            </button>

            {/* Admin-Tab: Für alle sichtbar, verlangt aber Login */}
            <button
              id="nav-btn-admin"
              onClick={() => {
                if (userProfile.role === 'admin') {
                  setActiveTab('admin');
                } else {
                  // Wenn nicht eingeloggt oder kein Admin, leiten wir auf Benutzerbereich um (bzw. Loginfeld dort)
                  setActiveTab('admin'); 
                }
              }}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin-Bereich
            </button>

            <button
              id="nav-btn-guide"
              onClick={() => setActiveTab('hosting-guide')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ml-auto cursor-pointer ${
                activeTab === 'hosting-guide' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-gray-800 hover:text-emerald-300'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              GitHub Pages Anleitung
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          3. HAUPT-INHALT (Die Kanzleiräume)
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* LEXIKON */}
        {activeTab === 'lexikon' && (
          <GlossarySection
            terms={terms}
            userProfile={userProfile}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            isAdmin={userProfile.role === 'admin'}
            onEditTerm={(term) => {
              // Einfacher Edit-Weg: Springt direkt in das Admin-Tab
              setActiveTab('admin');
              alert(`Begriff "${term.term}" kann direkt im Admin-Bereich unter "Steuer-Lexikon" editiert oder gelöscht werden.`);
            }}
            onDeleteTerm={handleDeleteTerm}
          />
        )}

        {/* STEUERRECHNER */}
        {activeTab === 'rechner' && (
          <CalculatorsSection
            userProfile={userProfile}
            onSaveCalculation={handleSaveCalculation}
            savedCalculations={savedCalculations}
            onDeleteCalculation={handleDeleteCalculation}
            tools={tools}
            onDeleteTool={handleDeleteTool}
          />
        )}

        {/* MEDIATHEK */}
        {activeTab === 'mediathek' && (
          <MediaSection
            videos={videos}
            socials={socials}
          />
        )}

        {/* BENUTZERBEREICH */}
        {activeTab === 'benutzer' && (
          <UserProfileSection
            userProfile={userProfile}
            onLogin={handleLogin}
            onLogout={handleLogout}
            terms={terms}
            bookmarkedIds={bookmarkedIds}
            savedCalculations={savedCalculations}
            onRemoveBookmark={handleToggleBookmark}
            onDeleteCalculation={handleDeleteCalculation}
            onToggleAdminView={() => setActiveTab('admin')}
          />
        )}

        {/* ADMIN BEREICH */}
        {activeTab === 'admin' && (
          <AdminDashboard
            seoConfig={seoConfig}
            onUpdateSEO={setSeoConfig}
            videos={videos}
            onAddVideo={handleAddVideo}
            onDeleteVideo={handleDeleteVideo}
            socials={socials}
            onUpdateSocial={handleUpdateSocial}
            terms={terms}
            onAddTerm={handleAddTerm}
            onDeleteTerm={handleDeleteTerm}
            tools={tools}
            onAddTool={handleAddTool}
            onDeleteTool={handleDeleteTool}
          />
        )}

        {/* GITHUB PAGES ANLEITUNG */}
        {activeTab === 'hosting-guide' && (
          <div id="github-pages-guide" className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <Compass className="h-6 w-6 text-emerald-600" />
                Schritt-für-Schritt-Anleitung: Veröffentlichung auf GitHub Pages
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Als Steuerfachangestellter sind Sie Präzision und Struktur gewöhnt. Diese Anleitung führt Sie genauso sauber und fehlerfrei durch die Veröffentlichung Ihres Portals &quot;Lexonomy&quot;, damit Ihre Mandanten es direkt im Browser aufrufen können.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Schritt 1 */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                  1
                </span>
                <h3 className="text-lg font-bold text-gray-900">GitHub Repository erstellen</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Loggen Sie sich auf <a href="https://github.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">GitHub.com</a> ein und erstellen Sie ein neues, öffentliches Repository (z.B. mit dem Namen <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs font-bold">lexonomy</code>). Lassen Sie das Häkchen für README oder .gitignore unberührt, da wir das Projekt lokal hochladen werden.
                </p>
              </div>

              {/* Schritt 2 */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                  2
                </span>
                <h3 className="text-lg font-bold text-gray-900">Base-Pfad in der Konfiguration eintragen</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Weil GitHub Pages Ihre Seite im Format <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs text-emerald-800">https://BENUTZERNAME.github.io/REPOSITORY-NAME/</code> hostet, müssen wir dem Build-Tool mitteilen, wo die Scripte liegen.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-200 space-y-1 overflow-x-auto border-l-4 border-amber-400">
                  <p className="text-gray-400">// In der Datei: vite.config.ts</p>
                  <p>export default defineConfig(() =&gt; &#123;</p>
                  <p className="pl-4">return &#123;</p>
                  <p className="pl-8 text-amber-300">base: "/lexonomy/", // Fügen Sie diese Zeile hinzu! (Entspricht Ihrem Repository-Namen)</p>
                  <p className="pl-8">plugins: [react(), tailwindcss()],</p>
                  <p className="pl-8">...</p>
                </div>
              </div>

              {/* Schritt 3 */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                  3
                </span>
                <h3 className="text-lg font-bold text-gray-900">Das Deployment-Paket einrichten</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Installieren Sie im Terminal Ihrer Entwicklungsumgebung das offizielle Deployment-Hilfspaket mit folgendem Befehl:
                </p>
                <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-emerald-400">
                  npm install gh-pages --save-dev
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Fügen Sie anschließend in Ihrer <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs font-semibold">package.json</code> unter dem Abschnitt <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs font-semibold">&quot;scripts&quot;</code> zwei nützliche Kurzbefehle hinzu:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-200 space-y-1 overflow-x-auto">
                  <p className="text-gray-400">&quot;scripts&quot;: &#123;</p>
                  <p className="pl-4 text-emerald-400">&quot;predeploy&quot;: &quot;npm run build&quot;,</p>
                  <p className="pl-4 text-emerald-400">&quot;deploy&quot;: &quot;gh-pages -d dist&quot;,</p>
                  <p className="pl-4">&quot;dev&quot;: &quot;vite&quot;,</p>
                  <p className="pl-4">...</p>
                </div>
              </div>

              {/* Schritt 4 */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                  4
                </span>
                <h3 className="text-lg font-bold text-gray-900">Veröffentlichen!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Führen Sie nun im Terminal einfach diesen Befehl aus:
                </p>
                <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-emerald-400">
                  npm run deploy
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Dieser Befehl kompiliert Ihre gesamte App in eine optimierte, statische Version (<code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-semibold">dist</code>-Ordner) und schiebt diese automatisch in einen speziellen, unsichtbaren Zweig namens <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs font-bold text-gray-700">gh-pages</code> auf GitHub.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Gehen Sie auf GitHub in die Einstellungen Ihres Repositories unter <span className="font-bold">Settings › Pages</span> und stellen Sie sicher, dass als Quelle (<span className="font-bold">Branch</span>) der Zweig <span className="font-bold">gh-pages</span> ausgewählt ist. Nach 1–2 Minuten ist Ihre Steuer-Webseite Lexonomy weltweit unter Ihrer GitHub-URL erreichbar!
                </p>
              </div>

              {/* Warum das hervorragend für SEO ist */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 space-y-3">
                <h4 className="text-emerald-950 font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  Kanzlei-Geheimtipp: Warum diese Architektur genial für Google ist
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  GitHub Pages liefert Ihre Webseite dank CDN (Content Delivery Network) extrem schnell an Besucher aus. Da unsere App die SEO-Tags (Titel, Beschreibung, Keywords) dynamisch über Javascript anpasst, indiziert Google die Änderungen zuverlässig. Moderne Crawler (wie der Googlebot) führen Javascript komplett aus und lesen somit exakt die Meta-Daten ein, die Sie im Admin-Dashboard abspeichern. Sie genießen erstklassige Ladezeiten, null Serverkosten und volle SEO-Kontrolle!
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          4. FOOTER-BEREICH (Der Feierabend-Abschluss)
          ========================================================================= */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
            <span className="font-semibold text-gray-600">Lexonomy © 2026</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-emerald-600" onClick={() => setActiveTab('lexikon')}>Steuer-Lexikon</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-emerald-600" onClick={() => setActiveTab('rechner')}>Tools Bereich</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-emerald-600" onClick={() => setActiveTab('hosting-guide')}>Kanzlei-Hosting</span>
          </div>

          <div className="text-[10px] text-gray-400 max-w-xl mx-auto leading-relaxed">
            Haftungsausschluss: Die bereitgestellten Berechnungen und Glossar-Definitionen dienen ausschließlich Kanzlei-Informationszwecken und stellen keine steuerliche Beratung dar. Alle Berechnungen beruhen auf geschätzten Parametern für das Steuerjahr 2026.
          </div>
        </div>
      </footer>

    </div>
  );
}
