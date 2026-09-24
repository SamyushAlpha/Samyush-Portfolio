/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface AboutModalProps {
  onClose: () => void;
  onOpenContact: () => void;
  onOpenProjects: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  onClose,
  onOpenContact,
  onOpenProjects,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'principles' | 'experience'>('overview');

  return (
    <div className="relative w-full mx-auto">
      {/* Close Button top-right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-[#e5b364] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer focus:outline-none"
        aria-label="Close about dialog"
      >
        ✕
      </button>

      {/* Outer Neobrutalist Shadow Box Wrapper */}
      <div
        className="w-full bg-[#fbf9f5] dark:bg-[#121215] border-[2.5px] sm:border-[3px] border-[#18181b] dark:border-[#3f3f46] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 md:p-12 transition-all text-neutral-900 dark:text-neutral-100"
        style={{
          boxShadow: '12px 14px 0px var(--shadow-3d-main)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-7 sm:mb-9">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-[#18181b] dark:text-[#f4f4f5] uppercase"
            style={{
              fontFamily: 'var(--font-heading)',
            }}
          >
            SAMYUSH GAUTAM
          </h1>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.34em] uppercase text-[#3f3f46] dark:text-[#a1a1aa] mt-2 sm:mt-2.5">
            FULL STACK DEVELOPER & INTERACTION ARCHITECT
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 border-b border-[#18181b]/15 dark:border-neutral-800 pb-4">
          {[
            { id: 'overview', label: '01. BIOGRAPHY' },
            { id: 'skills', label: '02. TECH ARSENAL' },
            { id: 'principles', label: '03. PRINCIPLES' },
            { id: 'experience', label: '04. TIMELINE' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-[0.16em] uppercase border transition-all cursor-pointer font-bold ${
                activeTab === tab.id
                  ? 'btn-3d-dark bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] border-[#18181b]'
                  : 'btn-3d-white bg-white dark:bg-[#1c1c22] text-[#18181b] dark:text-[#e4e4e7] border-[#18181b]/30 dark:border-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-sm text-[#27272a] dark:text-[#d4d4d8] leading-relaxed">
            <p className="text-base font-medium text-[#18181b] dark:text-[#f4f4f5] leading-snug">
              I am an engineer and interface builder focused on the intersection of
              rigorous distributed system backends and tactile, high-refresh frontends.
            </p>
            <p>
              Over the years, I've designed and delivered full-stack architectures
              ranging from high-concurrency WebSocket canvas engines to zero-downtime
              microservices and agentic artificial intelligence pipelines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] mb-1">
                  Primary Specialization
                </div>
                <div className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                  Full-Lifecycle Web Systems
                </div>
                <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-1">
                  From initial database schema blueprints and API contracts to production deployments.
                </p>
              </div>
              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] mb-1">
                  Design & Ergonomics
                </div>
                <div className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                  Micro-Interaction Polish
                </div>
                <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-1">
                  Sub-16ms compositor frame budgets, smooth gesture physics, and typographic hierarchy.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#52525b] dark:text-[#a1a1aa]">
              Located in the timezone of curiosity, partnering with ambitious founders, startups, and open-source teams globally.
            </p>
          </div>
        )}

        {/* Tab 2: Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#18181b] dark:text-[#f4f4f5]">
                    Frontend & Interactive
                  </span>
                  <span className="text-[10px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] text-[#18181b] dark:text-[#e4e4e7] px-1.5 py-0.5 rounded">
                    Client Tier
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React 19', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'Canvas API', 'WebGL / Shaders', 'WebSockets'].map((item) => (
                    <span key={item} className="text-[11px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-neutral-700 px-2 py-0.5 rounded text-[#27272a] dark:text-[#e4e4e7]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#18181b] dark:text-[#f4f4f5]">
                    Backend & Services
                  </span>
                  <span className="text-[10px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] text-[#18181b] dark:text-[#e4e4e7] px-1.5 py-0.5 rounded">
                    Server Tier
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Node.js', 'Express', 'Python', 'FastAPI', 'Go', 'REST APIs', 'GraphQL', 'SSE Streaming'].map((item) => (
                    <span key={item} className="text-[11px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-neutral-700 px-2 py-0.5 rounded text-[#27272a] dark:text-[#e4e4e7]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#18181b] dark:text-[#f4f4f5]">
                    Databases & Caches
                  </span>
                  <span className="text-[10px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] text-[#18181b] dark:text-[#e4e4e7] px-1.5 py-0.5 rounded">
                    Data Tier
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['PostgreSQL', 'Redis', 'MongoDB', 'Drizzle ORM', 'Prisma', 'TimescaleDB', 'Transactions'].map((item) => (
                    <span key={item} className="text-[11px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-neutral-700 px-2 py-0.5 rounded text-[#27272a] dark:text-[#e4e4e7]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-4 rounded-xl shadow-[3px_3px_0px_var(--shadow-3d-main)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#18181b] dark:text-[#f4f4f5]">
                    DevOps & Cloud
                  </span>
                  <span className="text-[10px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] text-[#18181b] dark:text-[#e4e4e7] px-1.5 py-0.5 rounded">
                    Operations
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Docker', 'CI/CD Pipelines', 'Cloud Run', 'Linux Bash', 'Vercel', 'Stripe Payments', 'Git'].map((item) => (
                    <span key={item} className="text-[11px] font-mono bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-neutral-700 px-2 py-0.5 rounded text-[#27272a] dark:text-[#e4e4e7]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Principles */}
        {activeTab === 'principles' && (
          <div className="space-y-3">
            {[
              {
                idx: '01',
                title: 'Latency Is Fundamental to Design',
                desc: 'A user feels 50 milliseconds of lag before they notice typography. Performant architecture and optimistic UI states precede all decorative styling.',
              },
              {
                idx: '02',
                title: 'Autonomous Realism Over Mock Data',
                desc: 'Real software must endure malformed network requests, unexpected empty states, and concurrency races without failing the user.',
              },
              {
                idx: '03',
                title: 'Type Safety from Database to DOM',
                desc: 'End-to-end typed schemas with TypeScript and strict ORM models eliminate an entire class of runtime regressions before deploy.',
              },
              {
                idx: '04',
                title: 'Tactile Physicality in Digital Spaces',
                desc: 'Hardware-accelerated transforms, natural gesture inertia, and crisp visual weights turn passive browsing into a memorable encounter.',
              },
            ].map((principle) => (
              <div
                key={principle.idx}
                className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-3.5 rounded-xl shadow-[2px_2px_0px_var(--shadow-3d-main)] flex items-start gap-3.5"
              >
                <span className="font-mono text-xs font-bold text-[#18181b] bg-[#e5b364] px-2 py-0.5 rounded border border-[#18181b]">
                  {principle.idx}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                    {principle.title}
                  </h3>
                  <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-0.5 leading-relaxed">
                    {principle.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-3">
            {[
              {
                period: '2024 — Present',
                role: 'Senior Full-Stack Architect',
                org: 'Independent Systems & Engineering',
                detail: 'Architecting distributed platforms, real-time collaboration engines, and interactive web products for tech startups.',
              },
              {
                period: '2022 — 2024',
                role: 'Lead Frontend & API Engineer',
                org: 'Next-Gen Web Technologies',
                detail: 'Spearheaded scalable React & Node.js application suites, sub-50ms API gateways, and component design systems.',
              },
              {
                period: '2020 — 2022',
                role: 'Software Engineer',
                org: 'Full-Stack Applications',
                detail: 'Engineered RESTful backends, database schema migrations, and high-conversion client-side user workflows.',
              },
            ].map((exp) => (
              <div
                key={exp.role}
                className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] p-3.5 rounded-xl shadow-[2px_2px_0px_var(--shadow-3d-main)]"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-sm text-[#18181b] dark:text-[#f4f4f5]">
                    {exp.role}
                  </span>
                  <span className="text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa]">
                    {exp.period}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#e5b364] font-mono mt-0.5">
                  {exp.org}
                </div>
                <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-1.5 leading-relaxed">
                  {exp.detail}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-6 mt-6 border-t border-[#18181b]/15 dark:border-neutral-800">
          <button
            type="button"
            onClick={onOpenProjects}
            className="text-xs font-mono tracking-[0.18em] uppercase font-bold text-[#18181b] dark:text-[#f4f4f5] underline underline-offset-4 hover:opacity-70 cursor-pointer"
          >
            Explore Selected Projects →
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onOpenContact}
              className="btn-3d-gold h-10 px-5 rounded-lg border-2 border-[#18181b] dark:border-[#e5b364] text-[#18181b] font-mono text-xs tracking-[0.2em] uppercase font-bold cursor-pointer"
            >
              Get In Touch
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-white h-10 px-4 rounded-lg border-2 font-mono text-xs tracking-[0.16em] uppercase font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
