/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  law?: string; // z.B. § 9 EStG
  example?: string; // Praxisbeispiel
  lastUpdated: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface SocialMediaLink {
  id: string;
  platform: string; // 'YouTube' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'X'
  url: string;
}

export interface SavedCalculation {
  id: string;
  type: 'brutto_netto' | 'fristen';
  date: string;
  title: string;
  details: string;
}

export interface UserProfile {
  username: string;
  isLoggedIn: boolean;
  role: 'guest' | 'user' | 'admin';
}

export interface TaxTool {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'brutto_netto' | 'fristen' | 'custom';
  content?: string; // Rich text / instructions or external link for custom tools
}
