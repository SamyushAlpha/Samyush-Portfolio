/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types/project';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'nexus-collaboration',
    title: 'Nexus Realtime Collaboration Platform',
    category: 'fullstack',
    tag: 'Full-Stack / WebSockets',
    summary:
      'Multi-user collaborative infinite canvas and document sync engine powered by CRDTs, optimistic concurrency, and sub-30ms socket broadcasts.',
    description:
      'Engineered an enterprise-grade real-time collaboration ecosystem supporting synchronized vector rendering, presence cursors, and immutable revision timelines. Built with React 19 and custom WebSockets on Node.js, backed by Redis pub/sub clusters and PostgreSQL row-level security for team workspaces.',
    tech: ['React 19', 'TypeScript', 'Node.js', 'WebSockets', 'Redis', 'PostgreSQL', 'Tailwind CSS'],
    liveUrl: 'https://github.com/samyushgautam/nexus-realtime',
    githubUrl: 'https://github.com/samyushgautam/nexus-realtime',
    imageUrl: '',
    metrics: '<25ms P99 Sync Latency',
    year: '2026',
    featured: true,
  },
  {
    id: 'aria-orchestrator',
    title: 'A.R.I.A Agentic Workflow Orchestrator',
    category: 'realtime_ai',
    tag: 'AI / Distributed Systems',
    summary:
      'Autonomous multi-agent task execution environment with node-based visual pipelines, streaming LLM inference, and self-correcting code runtimes.',
    description:
      'Designed an autonomous pipeline where multi-step reasoning agents inspect codebases, execute sandbox tests, and generate production diffs. Features real-time token streaming via SSE, human-in-the-loop approvals, and Dockerized micro-vms for safe isolated evaluation.',
    tech: ['Next.js', 'Python', 'FastAPI', 'Docker', 'TypeScript', 'LangGraph', 'Tailwind CSS'],
    liveUrl: 'https://github.com/samyushgautam/aria-agentic-orchestrator',
    githubUrl: 'https://github.com/samyushgautam/aria-agentic-orchestrator',
    imageUrl: '',
    metrics: '99.4% Task Resolution',
    year: '2026',
    featured: true,
  },
  {
    id: 'hyperscale-commerce',
    title: 'HyperScale Headless Commerce Engine',
    category: 'fullstack',
    tag: 'Full-Stack / E-Commerce',
    summary:
      'Sub-50ms international commerce platform with distributed inventory locking, automated Stripe webhooks, and headless checkout.',
    description:
      'Constructed high-throughput transactional infrastructure capable of enduring flash-sale traffic surges. Implemented optimistic inventory locking with Redis Lua scripts, automated tax/shipping calculations, and customer telemetry dashboards.',
    tech: ['React', 'Express.js', 'PostgreSQL', 'Stripe API', 'Redis', 'Tailwind CSS', 'Docker'],
    liveUrl: 'https://github.com/samyushgautam/hyperscale-commerce',
    githubUrl: 'https://github.com/samyushgautam/hyperscale-commerce',
    imageUrl: '',
    metrics: '12k Daily Transactions',
    year: '2025',
    featured: false,
  },
  {
    id: 'pulse-telemetry',
    title: 'Pulse Distributed Observability Suite',
    category: 'realtime_ai',
    tag: 'Data Viz / Systems',
    summary:
      'Live metric tracking dashboard streaming real-time memory, CPU, and network traces with custom high-performance WebGL chart primitives.',
    description:
      'Developed real-time infrastructure diagnostics for distributed Kubernetes clusters. Renders 60fps telemetry charts without frame drops using custom WebGL canvas shaders, backed by TimescaleDB hyper-tables and Prometheus aggregators.',
    tech: ['TypeScript', 'WebGL', 'D3.js', 'Go', 'TimescaleDB', 'Prometheus', 'Tailwind CSS'],
    liveUrl: 'https://github.com/samyushgautam/pulse-telemetry',
    githubUrl: 'https://github.com/samyushgautam/pulse-telemetry',
    imageUrl: '',
    metrics: '100k data pts/sec @ 60fps',
    year: '2025',
    featured: false,
  },
  {
    id: 'chrono-kinetic',
    title: 'Chrono Spatial Motion & Type Engine',
    category: 'frontend_motion',
    tag: 'Frontend & Motion',
    summary:
      'Experimental browser canvas exploration pairing variable typography physics with hardware-accelerated video scrubbing and gesture interaction.',
    description:
      'An exploratory interactive experience demonstrating precision inertia easing, multi-touch horizontal video scrubbing, and custom GLSL chromatic aberration shaders running smoothly across mobile and high-refresh desktop displays.',
    tech: ['React', 'TypeScript', 'GLSL / Shaders', 'Tailwind CSS', 'Canvas API', 'Web Audio'],
    liveUrl: 'https://github.com/samyushgautam/chrono-motion',
    githubUrl: 'https://github.com/samyushgautam/chrono-motion',
    imageUrl: '',
    metrics: 'Zero dropped frames',
    year: '2026',
    featured: true,
  },
];
