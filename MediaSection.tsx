/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Youtube, ExternalLink, HelpCircle, Linkedin, Instagram, Facebook, Share2 } from 'lucide-react';
import { YouTubeVideo, SocialMediaLink } from '../types';

interface MediaSectionProps {
  videos: YouTubeVideo[];
  socials: SocialMediaLink[];
}

export default function MediaSection({ videos, socials }: MediaSectionProps) {
  // Eine kleine Hilfsfunktion, um eine simulierte Thumbnail-URL für YouTube zu generieren
  // Standardmäßig zeigt es ein schönes steuerrelevantes Hintergrundbild, falls es eine echte ID ist.
  const getThumbnailUrl = (videoUrl: string, idx: number) => {
    // Da wir dQw4w9WgXcQ als Platzhalter verwenden, sieht das gut aus.
    let ytId = 'dQw4w9WgXcQ';
    try {
      const urlObj = new URL(videoUrl);
      if (urlObj.hostname.includes('youtube.com')) {
        ytId = urlObj.searchParams.get('v') || 'dQw4w9WgXcQ';
      } else if (urlObj.hostname.includes('youtu.be')) {
        ytId = urlObj.pathname.slice(1) || 'dQw4w9WgXcQ';
      }
    } catch (e) {
      // Fallback
    }

    // Wir können eine echte YouTube-Thumbnail-URL nehmen oder ein schönes Unsplash Steuer-Bild für bessere Ästhetik!
    // Unsplash Bilder zu Steuern/Kanzlei sehen fantastisch aus und sind hochauflösend.
    const taxImages = [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60", // Tax/Finance
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60", // Business desk
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60"  // Planner / Calendar
    ];

    return taxImages[idx % taxImages.length];
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) {
      return <Linkedin className="h-5 w-5 text-blue-700" />;
    } else if (p.includes('instagram')) {
      return <Instagram className="h-5 w-5 text-pink-600" />;
    } else if (p.includes('youtube')) {
      return <Youtube className="h-5 w-5 text-red-600" />;
    } else if (p.includes('facebook')) {
      return <Facebook className="h-5 w-5 text-blue-600" />;
    }
    return <Share2 className="h-5 w-5 text-gray-500" />;
  };

  return (
    <section id="media-section" className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Youtube className="h-6 w-6 text-red-600" />
          Mediathek & Lernzentrum
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Kompaktes Wissen rund um das Steuerrecht. Entdecken Sie Video-Anleitungen zu aktuellen Gesetzgebungen und folgen Sie Lexonomy auf Social Media, um keine Frist und Gesetzesänderung mehr zu verpassen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* YouTube Video-Hub */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Aktuelle Video-Beiträge
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.length > 0 ? (
              videos.map((video, idx) => (
                <div
                  id={`video-card-${video.id}`}
                  key={video.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-emerald-200 transition-all flex flex-col group"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={getThumbnailUrl(video.url, idx)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="h-12 w-12 bg-red-600 group-hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                        <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {video.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-3 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">YouTube</span>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                      >
                        Video ansehen
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
                <HelpCircle className="h-10 w-10 text-gray-300 mx-auto" />
                <h4 className="text-sm font-semibold text-gray-900 mt-2">Keine Videos vorhanden</h4>
                <p className="text-xs text-gray-500 mt-1">Im Admin-Bereich können Sie Videos einfügen.</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Links Widget */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            Kanäle & Social Media
          </h3>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Verbinden Sie sich mit uns auf den bekannten Kanzlei-Plattformen. Wir veröffentlichen wöchentliche Updates, Praxistipps für Steuererklärungen und Neuigkeiten zur Kanzlei-Digitalisierung.
            </p>

            <div className="space-y-3">
              {socials.length > 0 ? (
                socials.map((social) => (
                  <a
                    id={`social-link-${social.id}`}
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-emerald-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 group-hover:bg-emerald-50 rounded-lg transition-colors">
                        {getSocialIcon(social.platform)}
                      </div>
                      <span className="font-bold text-gray-800 text-sm">{social.platform}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Besuchen
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  Keine Profile verknüpft.
                </div>
              )}
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 text-[11px] text-emerald-800">
              <span className="font-bold block mb-1">Für Steuerfachangestellte:</span>
              Treten Sie unserem Kanzlei-Netzwerk bei! Teilen Sie Berechnungen und Gesetzestexte direkt mit Ihren Kollegen per Mausklick.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
