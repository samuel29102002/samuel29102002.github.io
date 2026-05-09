'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CinematicFooter from '@/components/ui/motion-footer';

function ContactForm() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = encodeURIComponent(subject || 'Hello');
    const text = (body || '') + (name ? `\n\n— ${name}` : '');
    window.location.href = `mailto:samuelheinrich2002@gmail.com?subject=${subj}&body=${encodeURIComponent(
      text
    )}`;
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="f-name" className="mb-1 text-[0.85rem] text-muted">
          Name
        </label>
        <input
          id="f-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full rounded-md border border-border bg-surface px-4 py-3 font-body text-sm text-text transition-all duration-300 ease-soft focus:border-accent focus:shadow-[0_0_0_1px_#d4a843] focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="f-subject" className="mb-1 text-[0.85rem] text-muted">
          Subject
        </label>
        <input
          id="f-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-3 font-body text-sm text-text transition-all duration-300 ease-soft focus:border-accent focus:shadow-[0_0_0_1px_#d4a843] focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="f-body" className="mb-1 text-[0.85rem] text-muted">
          Message
        </label>
        <textarea
          id="f-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-md border border-border bg-surface px-4 py-3 font-body text-sm leading-relaxed text-text transition-all duration-300 ease-soft focus:border-accent focus:shadow-[0_0_0_1px_#d4a843] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="self-start rounded-md bg-accent px-8 py-3 font-body text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-[1px] hover:opacity-90"
      >
        Send
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="pt-32">
      <section className="mx-auto max-w-[600px] px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-fluid-3xl tracking-tighter"
        >
          Contact
        </motion.h1>

        <div className="mt-12">
          <p className="mb-6 font-mono text-[0.66rem] uppercase tracking-[0.24em] text-muted">
            Or send a quick note
          </p>
          <ContactForm />
        </div>
      </section>

      <div className="mt-24">
        <CinematicFooter />
      </div>
    </div>
  );
}
