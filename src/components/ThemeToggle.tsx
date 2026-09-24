/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  showLabel = false,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode for low-light environment'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme (improved low-light accessibility)'}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b364] select-none ${
        isDark
          ? 'bg-[#18181b] border-[#e5b364] text-[#f4f4f5] shadow-[2px_2px_0px_#e5b364] hover:shadow-[3px_3px_0px_#e5b364] hover:-translate-y-0.5 active:translate-y-0.5'
          : 'bg-white border-[#18181b] text-[#18181b] shadow-[2px_2px_0px_#18181b] hover:shadow-[3px_3px_0px_#18181b] hover:-translate-y-0.5 active:translate-y-0.5'
      } ${className}`}
    >
      {/* Icon with smooth rotate / transition */}
      <span className="relative flex items-center justify-center w-5 h-5 text-sm transition-transform duration-300">
        {isDark ? (
          <span className="text-[#e5b364] text-base leading-none" role="img" aria-hidden="true">
            ☀️
          </span>
        ) : (
          <span className="text-[#18181b] text-sm leading-none" role="img" aria-hidden="true">
            🌙
          </span>
        )}
      </span>

      {showLabel ? (
        <span className="text-xs font-mono font-bold uppercase tracking-wider">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      ) : (
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
