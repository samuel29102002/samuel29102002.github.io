'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SiteFooter from '@/components/ui/motion-footer';

/* ─── Floating-label input ─── */

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pt-7">
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-0 font-body transition-all duration-200 ${
          active ? 'top-0 text-xs tracking-[0.1em] text-accent' : 'top-7 text-2xl text-muted'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full border-0 border-b border-border bg-transparent pb-3 font-body text-base text-text transition-colors duration-200 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pt-7">
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-0 font-body transition-all duration-200 ${
          active ? 'top-0 text-xs tracking-[0.1em] text-accent' : 'top-7 text-2xl text-muted'
        }`}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={5}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full resize-y border-0 border-b border-border bg-transparent pb-3 font-body text-base leading-relaxed text-text transition-colors duration-200 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

/* ─── Contact form ─── */

function ContactForm() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = encodeURIComponent(subject || 'Hello');
    const text = (body || '') + (name ? `\n\n— ${name}` : '');
    window.location.href = `mailto:samuelheinrich2002@gmail.com?subject=${subj}&body=${encodeURIComponent(text)}`;
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10">
      <FloatingInput id="f-name" label="Name" value={name} onChange={setName} autoComplete="name" />
      <FloatingInput id="f-subject" label="Subject" value={subject} onChange={setSubject} />
      <FloatingTextarea id="f-body" label="Message" value={body} onChange={setBody} />

      <button
        type="submit"
        className="w-full bg-accent py-4 font-body text-sm font-semibold uppercase tracking-[0.16em] text-bg transition-all duration-200 hover:opacity-85 active:scale-[0.99]"
      >
        Send Message
      </button>
    </form>
  );
}

/* ─── Page ─── */

export default function ContactPage() {
  return (
    <div className="pt-32">
      <section className="mx-auto max-w-[580px] px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
            Contact
          </span>
          <h1 className="mt-3 font-display text-fluid-3xl tracking-tighter">Get in touch.</h1>
          <p className="mt-5 font-mono text-sm text-muted">
            Email reaches me fastest. For project work, open an issue on the relevant repo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <ContactForm />
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
