/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface ContactModalProps {
  onClose: () => void;
  onCopyEmail: (e: React.MouseEvent) => void;
  copied: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  onClose,
  onCopyEmail,
  copied,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMessage('');
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Close Button top-right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-[#e5b364] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_var(--shadow-3d-main)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer focus:outline-none"
        aria-label="Close contact dialog"
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
        {/* Header: SAMYUSH GAUTAM & SUBTITLE */}
        <div className="text-center mb-8 sm:mb-10">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-[#18181b] dark:text-[#f4f4f5] uppercase"
            style={{
              fontFamily: 'var(--font-heading)',
            }}
          >
            SAMYUSH GAUTAM
          </h1>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.38em] uppercase text-[#3f3f46] dark:text-[#a1a1aa] mt-2.5 sm:mt-3">
            FULL STACK & INTERACTION DESIGN
          </div>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <div className="text-3xl sm:text-4xl mb-4 font-mono text-[#e5b364]">✳︎</div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#18181b] dark:text-[#f4f4f5] tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Message Dispatched
            </h2>
            <p className="text-sm text-[#52525b] dark:text-[#a1a1aa] max-w-md mx-auto mb-8 font-sans">
              Thank you, <strong className="text-black dark:text-white">{contactName || 'friend'}</strong>. Your transmission has been delivered to <span className="underline underline-offset-2">samyushgautam5@gmail.com</span>. I will be in touch shortly.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="btn-3d-gold h-11 sm:h-12 px-8 rounded-lg border-[2px] border-[#18181b] dark:border-[#e5b364] bg-[#e5b364] text-[#18181b] font-mono text-xs tracking-[0.2em] uppercase font-bold cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Row 1: NAME and EMAIL side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-[11px] sm:text-[12px] font-mono tracking-[0.24em] uppercase text-[#18181b] dark:text-[#f4f4f5] font-semibold mb-2">
                  NAME
                </label>
                <input
                  required
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-12 sm:h-13 bg-white dark:bg-[#18181b] border-[2px] border-[#18181b] dark:border-[#3f3f46] rounded-none px-4 text-sm text-[#18181b] dark:text-[#f4f4f5] placeholder-[#a1a1aa] dark:placeholder-[#71717a] focus:outline-none focus:border-[#e5b364] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-[12px] font-mono tracking-[0.24em] uppercase text-[#18181b] dark:text-[#f4f4f5] font-semibold mb-2">
                  EMAIL
                </label>
                <input
                  required
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 sm:h-13 bg-white dark:bg-[#18181b] border-[2px] border-[#18181b] dark:border-[#3f3f46] rounded-none px-4 text-sm text-[#18181b] dark:text-[#f4f4f5] placeholder-[#a1a1aa] dark:placeholder-[#71717a] focus:outline-none focus:border-[#e5b364] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: CONTACT (phone number) */}
            <div>
              <label className="block text-[11px] sm:text-[12px] font-mono tracking-[0.24em] uppercase text-[#18181b] dark:text-[#f4f4f5] font-semibold mb-2">
                CONTACT
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full h-12 sm:h-13 bg-white dark:bg-[#18181b] border-[2px] border-[#18181b] dark:border-[#3f3f46] rounded-none px-4 text-sm text-[#18181b] dark:text-[#f4f4f5] placeholder-[#a1a1aa] dark:placeholder-[#71717a] focus:outline-none focus:border-[#e5b364] transition-colors"
              />
            </div>

            {/* Row 3: MESSAGE */}
            <div>
              <label className="block text-[11px] sm:text-[12px] font-mono tracking-[0.24em] uppercase text-[#18181b] dark:text-[#f4f4f5] font-semibold mb-2">
                MESSAGE
              </label>
              <textarea
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Tell us about your project..."
                className="w-full bg-white dark:bg-[#18181b] border-[2px] border-[#18181b] dark:border-[#3f3f46] rounded-none p-4 text-sm text-[#18181b] dark:text-[#f4f4f5] placeholder-[#a1a1aa] dark:placeholder-[#71717a] focus:outline-none focus:border-[#e5b364] transition-colors resize-y min-h-[110px]"
              />
            </div>

            {/* Direct Email & Instagram Link Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-1 text-xs font-mono text-[#71717a] dark:text-[#a1a1aa]">
              <div className="flex items-center gap-3">
                <span>Direct: <a href="mailto:samyushgautam5@gmail.com" className="underline text-black dark:text-white font-semibold">samyushgautam5@gmail.com</a></span>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.instagram.com/samyush_gautam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#18181b] dark:text-[#f4f4f5] hover:text-[#e1306c] dark:hover:text-[#e5b364] font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <span>IG: @samyush_gautam</span>
                  <span className="text-[10px]" aria-hidden="true">↗</span>
                </a>
              </div>
              <button
                type="button"
                onClick={onCopyEmail}
                className="underline hover:text-black dark:hover:text-white cursor-pointer"
              >
                {copied ? '✓ Copied' : 'Copy Email'}
              </button>
            </div>

            {/* Row 4: Two bottom buttons (SUBMIT mustard yellow & RESET with 3D lift) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {/* SUBMIT BUTTON */}
              <div>
                <button
                  type="submit"
                  className="btn-3d-gold w-full h-12 sm:h-13 border-[2px] border-[#18181b] dark:border-[#e5b364] bg-[#e5b364] text-[#18181b] font-mono text-[12px] sm:text-[13px] font-bold tracking-[0.26em] uppercase flex items-center justify-center cursor-pointer"
                >
                  SUBMIT
                </button>
              </div>

              {/* RESET BUTTON */}
              <div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-3d-white w-full h-12 sm:h-13 border-[2px] border-[#18181b] dark:border-neutral-700 font-mono text-[12px] sm:text-[13px] font-bold tracking-[0.26em] uppercase flex items-center justify-center cursor-pointer"
                >
                  RESET
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
