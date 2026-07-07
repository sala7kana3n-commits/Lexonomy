/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Globe, Youtube, Plus, Trash2, Edit2, Save, Lock, Unlock, AlertCircle, FileText, Check } from 'lucide-react';
import { SEOConfig, GlossaryTerm, YouTubeVideo, SocialMediaLink, TaxTool } from '../types';

interface AdminDashboardProps {
  seoConfig: SEOConfig;
  onUpdateSEO: (config: SEOConfig) => void;
  videos: YouTubeVideo[];
  onAddVideo: (video: Omit<YouTubeVideo, 'id'>) => void;
  onDeleteVideo: (id: string) => void;
  socials: SocialMediaLink[];
  onUpdateSocial: (id: string, url: string) => void;
  terms: GlossaryTerm[];
  onAddTerm: (term: Omit<GlossaryTerm, 'id' | 'lastUpdated'>) => void;
  onDeleteTerm: (id: string) => void;
  tools: TaxTool[];
  onAddTool: (tool: Omit<TaxTool, 'id'>) => void;
  onDeleteTool: (id: string) => void;
}

export default function AdminDashboard({
  seoConfig,
  onUpdateSEO,
  videos,
  onAddVideo,
  onDeleteVideo,
  socials,
  onUpdateSocial,
  terms,
  onAddTerm,
  onDeleteTerm,
  tools,
  onAddTool,
  onDeleteTool,
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [activeSubTab, setActiveSubTab] = useState<'seo' | 'videos' | 'socials' | 'glossary' | 'tools'>('seo');

  // --- LOCAL STATES FOR FORMS ---
  const [tempSEO, setTempSEO] = useState<SEOConfig>({ ...seoConfig });

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  const [newTermName, setNewTermName] = useState('');
  const [newTermDef, setNewTermDef] = useState('');
  const [newTermLaw, setNewTermLaw] = useState('');
  const [newTermEx, setNewTermEx] = useState('');
  const [newTermCat, setNewTermCat] = useState('Einkommensteuer');

  // New Tool states
  const [newToolTitle, setNewToolTitle] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolCat, setNewToolCat] = useState('Allgemein');
  const [newToolType, setNewToolType] = useState<'brutto_netto' | 'fristen' | 'custom'>('custom');
  const [newToolContent, setNewToolContent] = useState('');

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Einfacher Passwortschutz für Demo/Kanzlei-Zwecke (Standardmäßig "admin123" oder "lexonomy2026")
    if (password === 'admin123' || password === 'lexonomy') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Ungültiges Passwort! Nutzen Sie das Standardpasswort "admin123"');
    }
  };

  // SEO Update
  const handleSEOUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSEO(tempSEO);
    alert('SEO-Meta-Tags erfolgreich aktualisiert! Der Quelltext im <head> wurde dynamisch neu geschrieben.');
  };

  // Video hinzufügen
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle || !newVideoUrl) {
      alert('Bitte füllen Sie mindestens Titel und YouTube-URL aus.');
      return;
    }
    onAddVideo({
      title: newVideoTitle,
      url: newVideoUrl,
      description: newVideoDesc
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    alert('Video erfolgreich zur Mediathek hinzugefügt!');
  };

  // Begriff hinzufügen
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName || !newTermDef) {
      alert('Bitte füllen Sie Begriff und Definition aus.');
      return;
    }
    onAddTerm({
      term: newTermName,
      definition: newTermDef,
      law: newTermLaw || undefined,
      example: newTermEx || undefined,
      category: newTermCat
    });
    setNewTermName('');
    setNewTermDef('');
    setNewTermLaw('');
    setNewTermEx('');
    alert('Steuerfachbegriff erfolgreich im Lexikon hinterlegt!');
  };

  // Tool hinzufügen
  const handleAddToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolTitle || !newToolDesc) {
      alert('Bitte füllen Sie Titel und Beschreibung aus.');
      return;
    }
    onAddTool({
      title: newToolTitle,
      description: newToolDesc,
      category: newToolCat,
      type: newToolType,
      content: newToolType === 'custom' ? newToolContent : undefined
    });
    setNewToolTitle('');
    setNewToolDesc('');
    setNewToolCat('Allgemein');
    setNewToolType('custom');
    setNewToolContent('');
    alert('Tool erfolgreich im Kanzlei-Portal veröffentlicht!');
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-login-container" className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Admin-Bereich geschützt</h2>
          <p className="text-xs text-gray-500">
            Bitte geben Sie das Administrator-Passwort ein, um SEO-Einstellungen und Fachbegriffe zu bearbeiten.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Passwort eingeben
            </label>
            <input
              id="admin-password-input"
              type="password"
              placeholder="z.B. admin123"
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 leading-relaxed text-center border border-gray-100">
            💡 <span className="font-semibold text-gray-700">Steuerfachgehilfen-Hinweis:</span> Nutzen Sie das Testpasswort <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">admin123</span> zum Einloggen.
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
          >
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600 animate-spin-slow" />
            Lexonomy Admin-Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Verwalten Sie hier die SEO-Metadaten, verknüpfen Sie neue Lernvideos und erstellen Sie neue Lexikonbeiträge für Ihre Mandanten.
          </p>
        </div>

        <button
          id="admin-logout-btn"
          onClick={() => {
            setIsAuthenticated(false);
            setPassword('');
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 self-start md:self-center"
        >
          <Unlock className="h-3.5 w-3.5 text-emerald-600" />
          Dashboard sperren
        </button>
      </div>

      {/* Admin-Untermenü */}
      <div className="flex flex-wrap border-b border-gray-100">
        <button
          id="subtab-btn-seo"
          onClick={() => setActiveSubTab('seo')}
          className={`py-3 px-5 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === 'seo'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          SEO-Dashboard
        </button>
        <button
          id="subtab-btn-videos"
          onClick={() => setActiveSubTab('videos')}
          className={`py-3 px-5 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === 'videos'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          YouTube-Videos ({videos.length})
        </button>
        <button
          id="subtab-btn-socials"
          onClick={() => setActiveSubTab('socials')}
          className={`py-3 px-5 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === 'socials'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Social Media Links
        </button>
        <button
          id="subtab-btn-glossary"
          onClick={() => setActiveSubTab('glossary')}
          className={`py-3 px-5 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === 'glossary'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Steuer-Lexikon ({terms.length})
        </button>
        <button
          id="subtab-btn-tools"
          onClick={() => setActiveSubTab('tools')}
          className={`py-3 px-5 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
            activeSubTab === 'tools'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tools verwalten ({tools.length})
        </button>
      </div>

      {/* --- SEO DASHBOARD --- */}
      {activeSubTab === 'seo' && (
        <div id="admin-seo-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSEOUpdate} className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              SEO-Meta-Daten konfigurieren
            </h3>
            <p className="text-xs text-gray-400">
              Ändern Sie hier die Titel, Keywords und Beschreibungen. Das Javascript schreibt diese Einträge live in die Meta-Tags im Seiten-Header (&lt;head&gt;).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Seitentitel (SEO Title)
                </label>
                <input
                  id="seo-title-input"
                  type="text"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={tempSEO.title}
                  onChange={(e) => setTempSEO({ ...tempSEO, title: e.target.value })}
                  placeholder="Geben Sie einen ansprechenden Titel für Google ein"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Seitenbeschreibung (Meta-Description)
                </label>
                <textarea
                  id="seo-desc-input"
                  rows={3}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={tempSEO.description}
                  onChange={(e) => setTempSEO({ ...tempSEO, description: e.target.value })}
                  placeholder="Beschreiben Sie Ihre Webseite kurz (optimal für Google: ~150-160 Zeichen)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Suchbegriffe (Meta-Keywords, Kommagetrennt)
                </label>
                <input
                  id="seo-keywords-input"
                  type="text"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={tempSEO.keywords}
                  onChange={(e) => setTempSEO({ ...tempSEO, keywords: e.target.value })}
                  placeholder="Werbungskosten, Steuerrechner, Kanzlei"
                />
              </div>
            </div>

            <button
              id="seo-save-submit"
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              SEO-Tags im Head aktualisieren
            </button>
          </form>

          {/* Google Preview Widget */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Google-Vorschau</h4>
            <p className="text-xs text-gray-400 leading-normal">
              So wird Ihr Steuer-Portal Lexonomy in den Google Suchergebnissen für Mandanten und Gäste angezeigt:
            </p>

            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 space-y-1 md:mt-6 shadow-inner font-sans">
              {/* URL */}
              <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                <span>https://yourdomain.github.io</span>
                <span className="text-gray-300">›</span>
                <span className="text-gray-400">lexonomy</span>
              </div>
              
              {/* Titel */}
              <h4 className="text-xl text-[#1a0dab] hover:underline font-medium cursor-pointer leading-tight truncate">
                {tempSEO.title || 'Bitte einen SEO-Titel eingeben'}
              </h4>
              
              {/* Description */}
              <p className="text-sm text-[#4d5156] leading-normal line-clamp-3">
                {tempSEO.description || 'Bitte geben Sie eine Meta-Beschreibung ein, um den Auszug auf Google zu füllen.'}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-[11px] text-amber-800 leading-relaxed border border-amber-100 mt-4">
              💡 <span className="font-semibold text-gray-700">SEO-Tipp:</span> Suchmaschinen bevorzugen aussagekräftige Titel unter 60 Zeichen und Beschreibungen unter 160 Zeichen. Nutzen Sie Ihre Haupt-Keywords wie <span className="font-semibold text-gray-800">Steuerrechner</span> am Anfang des Titels!
            </div>
          </div>
        </div>
      )}

      {/* --- YOUTUBE VIDEOS TAB --- */}
      {activeSubTab === 'videos' && (
        <div id="admin-videos-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video hinzufügen Form */}
          <form onSubmit={handleAddVideo} className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Neues YouTube-Video hinzufügen
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Videotitel
                </label>
                <input
                  id="new-video-title-input"
                  type="text"
                  required
                  placeholder="z.B. Werbungskosten im Steuerrecht"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  YouTube Video-URL
                </label>
                <input
                  id="new-video-url-input"
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Kurzbeschreibung (Inhalt)
                </label>
                <textarea
                  id="new-video-desc-input"
                  rows={3}
                  placeholder="Kurzer Abriss über den Inhalt des Videos..."
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newVideoDesc}
                  onChange={(e) => setNewVideoDesc(e.target.value)}
                />
              </div>
            </div>

            <button
              id="new-video-submit"
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              In die Mediathek einbinden
            </button>
          </form>

          {/* Aktuelle Videoliste */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Aktuelle Video-Einträge</h3>
            
            <div className="divide-y divide-gray-100">
              {videos.map((vid) => (
                <div id={`admin-video-row-${vid.id}`} key={vid.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono block">ID: {vid.id}</span>
                    <h4 className="font-bold text-gray-800 text-sm">{vid.title}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-md">{vid.url}</p>
                  </div>

                  <button
                    id={`admin-delete-video-${vid.id}`}
                    onClick={() => {
                      if (confirm('Möchten Sie dieses Video wirklich löschen?')) {
                        onDeleteVideo(vid.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Video entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SOCIAL MEDIA LINKS TAB --- */}
      {activeSubTab === 'socials' && (
        <div id="admin-socials-tab" className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-gray-900">Social-Media-Kanäle bearbeiten</h3>
            <p className="text-xs text-gray-500 mt-1">
              Verknüpfen Sie hier die Social-Media-Konten Ihrer Steuerkanzlei oder Ihres Portals. Die Links werden für Gäste im rechten Panel der Mediathek live verlinkt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {socials.map((soc) => (
              <div id={`admin-social-card-${soc.id}`} key={soc.id} className="p-4 border border-gray-100 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {soc.platform}
                </span>

                <div className="flex gap-2">
                  <input
                    id={`admin-social-input-${soc.id}`}
                    type="url"
                    className="block w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-xs font-semibold"
                    value={soc.url}
                    onChange={(e) => onUpdateSocial(soc.id, e.target.value)}
                  />
                  <span className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg self-center" title="Gespeichert">
                    <Check className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GLOSSARY MANAGER TAB --- */}
      {activeSubTab === 'glossary' && (
        <div id="admin-glossary-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Begriff hinzufügen */}
          <form onSubmit={handleAddTerm} className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Neuen Lexikonbegriff erstellen
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Steuerfachbegriff (z.B. Werbungskosten)
                </label>
                <input
                  id="new-term-name-input"
                  type="text"
                  required
                  placeholder="Begriff eingeben"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Gesetzesgrundlage (z.B. § 9 EStG)
                  </label>
                  <input
                    id="new-term-law-input"
                    type="text"
                    placeholder="Paragraph"
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    value={newTermLaw}
                    onChange={(e) => setNewTermLaw(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Steuerbereich
                  </label>
                  <select
                    id="new-term-cat-select"
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    value={newTermCat}
                    onChange={(e) => setNewTermCat(e.target.value)}
                  >
                    <option value="Einkommensteuer">Einkommensteuer</option>
                    <option value="Umsatzsteuer">Umsatzsteuer</option>
                    <option value="Gewerbesteuer">Gewerbesteuer</option>
                    <option value="Körperschaftsteuer">Körperschaftsteuer</option>
                    <option value="Erbschaftsteuer">Erbschaftsteuer</option>
                    <option value="Lohnsteuer / Einkommensteuer">Lohnsteuer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Detaillierte Definition
                </label>
                <textarea
                  id="new-term-def-input"
                  rows={3}
                  required
                  placeholder="Erklären Sie den Begriff verständlich für Fachangestellte und Mandanten..."
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newTermDef}
                  onChange={(e) => setNewTermDef(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Praxisbeispiel (Optional)
                </label>
                <textarea
                  id="new-term-ex-input"
                  rows={2}
                  placeholder="Wie wirkt sich diese Regelung in der Praxis aus?"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newTermEx}
                  onChange={(e) => setNewTermEx(e.target.value)}
                />
              </div>
            </div>

            <button
              id="new-term-submit"
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              Lexikonbeitrag veröffentlichen
            </button>
          </form>

          {/* Aktuelle Begriffe verwalten */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Fachbegriffe-Katalog ({terms.length})</h3>

            <div className="overflow-y-auto max-h-[480px] divide-y divide-gray-50 pr-2">
              {terms.map((t) => (
                <div id={`admin-glossary-row-${t.id}`} key={t.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      {t.term}
                      {t.law && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t.law}</span>}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.definition}</p>
                  </div>

                  <button
                    id={`admin-delete-term-${t.id}`}
                    onClick={() => {
                      if (confirm(`Begriff "${t.term}" wirklich löschen?`)) {
                        onDeleteTerm(t.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Begriff löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TOOLS MANAGER TAB --- */}
      {activeSubTab === 'tools' && (
        <div id="admin-tools-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tool hinzufügen */}
          <form onSubmit={handleAddToolSubmit} className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Neues Tool hinzufügen
            </h3>
            <p className="text-xs text-gray-400">
              Erstellen Sie ein neues Tool für Ihre Gäste und Mandanten. Built-in-Rechner können als Standard verknüpft oder benutzerdefinierte Info-Tools erstellt werden.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Titel des Tools
                </label>
                <input
                  id="new-tool-title-input"
                  type="text"
                  required
                  placeholder="z.B. Erbschaftsteuer-Rechner-Anleitung"
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newToolTitle}
                  onChange={(e) => setNewToolTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Kategorie
                  </label>
                  <input
                    id="new-tool-cat-input"
                    type="text"
                    placeholder="z.B. Steuern, Gehalt, Fristen"
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                    value={newToolCat}
                    onChange={(e) => setNewToolCat(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Typ des Tools
                  </label>
                  <select
                    id="new-tool-type-select"
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    value={newToolType}
                    onChange={(e) => setNewToolType(e.target.value as 'brutto_netto' | 'fristen' | 'custom')}
                  >
                    <option value="custom">Eigenes Text-/Info-Tool</option>
                    <option value="brutto_netto">Brutto-Netto-Rechner Klon</option>
                    <option value="fristen">Fristenrechner Klon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Kurzbeschreibung (Vorschautext)
                </label>
                <textarea
                  id="new-tool-desc-input"
                  rows={2}
                  required
                  placeholder="Kurze Vorschau für die Toolkarte..."
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                />
              </div>

              {newToolType === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Inhalt / Anleitung / Rechenhinweise
                  </label>
                  <textarea
                    id="new-tool-content-input"
                    rows={4}
                    placeholder="Geben Sie hier nützliche Rechenhinweise, Formeln oder Kanzlei-Informationen ein. Dieses Tool zeigt diesen Text als Kanzlei-Anweisung oder Info an."
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    value={newToolContent}
                    onChange={(e) => setNewToolContent(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button
              id="new-tool-submit"
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              Tool veröffentlichen
            </button>
          </form>

          {/* Aktuelle Tools verwalten */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Veröffentlichte Tools ({tools.length})</h3>
            <p className="text-xs text-gray-400">
              Hier sehen Sie alle Tools, die Ihren Besuchern im "Tools Bereich" zur Verfügung stehen. Sie können jedes Tool löschen (auch die Standardrechner), um die Webseite anzupassen.
            </p>

            <div className="overflow-y-auto max-h-[480px] divide-y divide-gray-100 pr-2">
              {tools.length > 0 ? (
                tools.map((tool) => (
                  <div id={`admin-tool-row-${tool.id}`} key={tool.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                          {tool.category}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          Typ: {tool.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{tool.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
                    </div>

                    <button
                      id={`admin-delete-tool-${tool.id}`}
                      onClick={() => {
                        if (confirm(`Möchten Sie das Tool "${tool.title}" wirklich löschen?`)) {
                          onDeleteTool(tool.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Tool löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                  Keine Tools verbleibend. Besucher sehen einen leeren Tools-Bereich.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
