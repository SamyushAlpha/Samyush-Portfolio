/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectCategory = 'all' | 'fullstack' | 'realtime_ai' | 'frontend_motion';

export interface Project {
  id: string;
  title: string;
  category: 'fullstack' | 'realtime_ai' | 'frontend_motion';
  tag: string;
  summary: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  metrics?: string;
  year: string;
  featured?: boolean;
}
