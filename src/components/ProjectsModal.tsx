/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Project, ProjectCategory } from '../types/project';

interface ProjectsModalProps {
  projects: Project[];
  onClose: () => void;
  onOpenAdmin: () => void;
  onOpenContact: () => void;
}

// Card animation variants for opacity and translateY scroll-reveal
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: (index % 2) * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  projects,
  onClose,
  onOpenAdmin,
  onOpenContact,
}) => {
  const [filter, setFilter] = useState<ProjectCategory>('all');
  const [expandedProject, setExpandedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  return (
    <div className="relative w-full mx-auto">
      {/* Close Button top-right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-[#e5b364] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer focus:outline-none"
        aria-label="Close projects dialog"
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
            SELECTED WORKS
          </h1>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.34em] uppercase text-[#3f3f46] dark:text-[#a1a1aa] mt-2 sm:mt-2.5">
            FULL STACK SYSTEMS & ARCHITECTURAL ARTIFACTS
          </div>
        </div>

        {/* Toolbar: Category Filters & Verification Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[#18181b]/15 dark:border-neutral-800 pb-5 mb-7">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'fullstack', label: 'FULL-STACK' },
              { id: 'realtime_ai', label: 'REAL-TIME & AI' },
              { id: 'frontend_motion', label: 'MOTION & INTERACTIVE' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-[0.16em] uppercase border transition-all cursor-pointer font-bold ${
                  filter === cat.id
                    ? 'btn-3d-dark bg-[#18181b] dark:bg-[#e5b364] text-white dark:text-[#18181b] border-[#18181b]'
                    : 'btn-3d-white bg-white dark:bg-[#1c1c22] text-[#18181b] dark:text-[#e4e4e7] border-[#18181b]/30 dark:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Clean Status Metric */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#3f3f46] dark:text-[#d4d4d8] px-3 py-1.5 bg-white dark:bg-[#18181b] border border-[#18181b]/20 dark:border-neutral-700 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{filteredProjects.length} Verified Systems</span>
          </div>
        </div>

        {/* Expanded Project Case Study View */}
        <AnimatePresence>
          {expandedProject && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-6 shadow-[6px_6px_0px_var(--shadow-3d-main)]"
            >
              <div className="flex justify-between items-start gap-4 mb-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div>
                  <span className="text-xs font-mono uppercase bg-[#e5b364] px-2 py-0.5 rounded text-[#18181b] font-bold border border-[#18181b]">
                    {expandedProject.tag}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#18181b] dark:text-[#f4f4f5] mt-2">
                    {expandedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedProject(null)}
                  className="btn-3d-white text-xs font-mono uppercase border border-[#18181b] dark:border-neutral-700 px-3 py-1.5 rounded-lg bg-[#f4f4f5] dark:bg-[#27272a] cursor-pointer"
                >
                  Close Case Study ✕
                </button>
              </div>

              {expandedProject.imageUrl && (
                <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-4 border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={expandedProject.imageUrl}
                    alt={expandedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3 text-sm text-[#27272a] dark:text-[#d4d4d8] mb-5">
                <p className="font-medium text-base text-[#18181b] dark:text-[#f4f4f5]">
                  {expandedProject.summary}
                </p>
                <div className="text-xs text-[#52525b] dark:text-[#a1a1aa] leading-relaxed whitespace-pre-line bg-[#fbf9f5] dark:bg-[#121215] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <strong className="block text-black dark:text-white font-mono text-[11px] uppercase tracking-wider mb-1">
                    Architecture & Technical Implementation:
                  </strong>
                  {expandedProject.description}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {expandedProject.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded text-neutral-800 dark:text-neutral-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {expandedProject.liveUrl && (
                  <a
                    href={expandedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-3d-dark h-10 px-5 rounded-lg border-2 border-[#18181b] dark:border-[#e5b364] bg-[#18181b] text-white font-mono text-xs tracking-wider uppercase font-bold flex items-center gap-1.5"
                  >
                    Live Deployment ↗
                  </a>
                )}
                {expandedProject.githubUrl && (
                  <a
                    href={expandedProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-3d-white h-10 px-5 rounded-lg border-2 border-[#18181b] dark:border-neutral-700 bg-white dark:bg-[#27272a] text-[#18181b] dark:text-[#f4f4f5] font-mono text-xs tracking-wider uppercase font-bold flex items-center gap-1.5"
                  >
                    Source Repository ↗
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects Grid with Staggered Scroll-Reveal & 3D Lift */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout="position"
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -25px 0px' }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
                whileHover={{
                  y: -6,
                  boxShadow: '0 12px 0px var(--shadow-3d-main), 0 18px 24px var(--shadow-3d-ambient-hover)',
                  transition: { duration: 0.16, ease: [0.34, 1.56, 0.64, 1] },
                }}
                whileTap={{
                  y: 2,
                  boxShadow: '0 1px 0px var(--shadow-3d-main)',
                  transition: { duration: 0.08 },
                }}
                className="bg-white dark:bg-[#18181b] border-2 border-[#18181b] dark:border-[#3f3f46] rounded-2xl p-5 shadow-[4px_4px_0px_var(--shadow-3d-main)] flex flex-col justify-between group cursor-pointer will-change-transform text-neutral-900 dark:text-neutral-100"
                onClick={() => setExpandedProject(project)}
              >
                <div>
                  {/* Visual Header / Cover */}
                  <div className="w-full h-32 rounded-xl mb-4 overflow-hidden border border-[#18181b]/20 dark:border-neutral-700 bg-gradient-to-br from-[#18181b] to-[#27272a] relative flex items-center justify-center">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <div className="text-xl text-[#e5b364] mb-1 font-serif">✳︎</div>
                        <div className="text-[11px] font-mono tracking-widest uppercase text-white/80">
                          {project.tag}
                        </div>
                      </div>
                    )}

                    {project.metrics && (
                      <span className="absolute bottom-2 right-2 bg-white/95 dark:bg-[#18181b]/95 text-[#18181b] dark:text-[#f4f4f5] border border-[#18181b] dark:border-[#3f3f46] text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm">
                        {project.metrics}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase bg-[#f4f4f5] dark:bg-[#27272a] border border-[#e4e4e7] dark:border-neutral-700 px-2 py-0.5 rounded text-[#18181b] dark:text-[#f4f4f5] font-semibold">
                      {project.tag}
                    </span>
                    <span className="text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa]">
                      {project.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedProject(project);
                    }}
                    className="font-bold text-base text-[#18181b] dark:text-[#f4f4f5] group-hover:text-[#e5b364] transition-colors cursor-pointer mb-2"
                  >
                    {project.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] leading-relaxed mb-4 line-clamp-3">
                    {project.summary}
                  </p>
                </div>

                <div>
                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tech.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono bg-[#fbf9f5] dark:bg-[#27272a] border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.tech.length > 4 && (
                      <span className="text-[10px] font-mono text-neutral-400 self-center">
                        +{project.tech.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProject(project);
                      }}
                      className="text-xs font-mono uppercase tracking-wider underline text-[#18181b] dark:text-[#f4f4f5] hover:opacity-70 cursor-pointer font-bold"
                    >
                      Architecture Notes →
                    </button>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-mono bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#18181b] hover:text-white dark:hover:bg-white dark:hover:text-black border border-[#18181b]/30 dark:border-neutral-700 px-2 py-1 rounded transition-colors"
                          title="View GitHub Repository"
                        >
                          Code ↗
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-mono bg-[#e5b364] text-[#18181b] border border-[#18181b] px-2 py-1 rounded font-bold hover:bg-[#d8a553] transition-colors"
                          title="Visit Live System"
                        >
                          Live ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-[#18181b]/15 dark:border-neutral-800">
          <div className="text-xs text-[#71717a] dark:text-[#a1a1aa] font-mono">
            Displaying {filteredProjects.length} of {projects.length} artifacts
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onOpenContact}
              className="btn-3d-gold h-10 px-5 rounded-lg border-2 border-[#18181b] dark:border-[#e5b364] bg-[#e5b364] text-[#18181b] font-mono text-xs tracking-[0.2em] uppercase font-bold cursor-pointer"
            >
              Commission Project
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
