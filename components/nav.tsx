'use client';

/**
 * Top navigation — sticky, backdrop-blur, semi-transparent.
 * Mobile: hamburger → full-screen overlay menu (framer-motion slide-in).
 * Active link: animated 2px accent underline.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/hobbies', label: 'Hobbies' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    /* close mobile menu on route change */
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-soft',
          scrolled
            ? 'bg-bg/85 backdrop-blur-xl border-b border-border'
            : 'bg-bg/40 backdrop-blur-md border-b border-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-display text-xl tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-sm font-medium text-accent transition-colors group-hover:border-accent">
              SH
            </span>
            <span className="hidden text-text sm:inline">Samuel Heinrich</span>
          </Link>

          {/* desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  className={cn(
                    'font-mono text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-300',
                    isActive(l.href)
                      ? 'text-text'
                      : 'text-muted hover:text-text'
                  )}
                >
                  {l.label}
                </Link>
                {isActive(l.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-accent"
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-text transition-colors hover:border-accent hover:text-accent md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </header>

      {/* mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="h-16" />
            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-1 flex-col gap-1 px-6 pt-12"
            >
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.06,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={l.href}
                    className={cn(
                      'block border-b border-border py-5 font-display text-3xl transition-colors',
                      isActive(l.href) ? 'text-accent' : 'text-text hover:text-accent'
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-6 py-8 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
              samuelheinrich2002@gmail.com
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
