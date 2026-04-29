/* ============================================================
   scroll.js · Lenis smooth scroll + GSAP ScrollTrigger experiences
   Requires: window.Lenis, window.gsap, window.ScrollTrigger
   ============================================================ */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  function bootLenis() {
    if (REDUCED || typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    window.lenis = lenis;
  }

  /* ---------- IntersectionObserver fallback reveal ---------- */
  function ioReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('in')); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Hero split chars (manual, no SplitText plugin) ---------- */
  function splitHero() {
    const t = document.querySelector('.hero-title');
    if (!t || t.dataset.split === '1') return;
    const text = t.textContent;
    t.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char split-char';
      span.style.animationDelay = (0.04 * i) + 's';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      t.appendChild(span);
    });
    t.dataset.split = '1';
  }

  /* ---------- Hero typewriter ---------- */
  function typewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const words = JSON.parse(el.dataset.words || '["Data Engineer"]');
    const cursor = '<span class="cursor">_</span>';
    let i = 0, j = 0, deleting = false;
    function tick() {
      const w = words[i % words.length];
      if (!deleting) {
        j++;
        if (j > w.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        j--;
        if (j === 0) { deleting = false; i++; }
      }
      el.innerHTML = w.slice(0, j) + cursor;
      setTimeout(tick, deleting ? 38 : 80);
    }
    tick();
  }

  /* ---------- GSAP ScrollTrigger experiences ---------- */
  function gsapScenes() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero parallax + chars drift on scroll */
    const heroChars = gsap.utils.toArray('.hero-title .char');
    if (heroChars.length) {
      gsap.to(heroChars, {
        y: (i) => (i % 2 ? -120 : -60),
        x: (i) => (i % 3 === 0 ? 40 : -20),
        rotation: (i) => (i % 2 ? 8 : -4),
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    /* Hero canvas scale + fade — handled in three-scene too, but also via GSAP */
    const heroCanvas = document.querySelector('.hero-canvas');
    if (heroCanvas) {
      gsap.to(heroCanvas, {
        scale: 0.85,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=600',
          scrub: 0.6
        }
      });
    }

    /* Project cards tilt on hover (mousemove based) */
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });

    /* Project cards stagger from alternating sides */
    const cards = gsap.utils.toArray('.project-card');
    cards.forEach((c, idx) => {
      const fromLeft = idx % 2 === 0;
      gsap.from(c, {
        x: fromLeft ? -60 : 60,
        opacity: 0,
        rotationY: fromLeft ? 15 : -15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: c, start: 'top 88%' },
        delay: (idx % 3) * 0.08
      });
    });

    /* Skill bars width animate */
    document.querySelectorAll('.skill').forEach(s => {
      const fill = s.querySelector('.skill-bar > span');
      const target = s.dataset.pct || '60';
      ScrollTrigger.create({
        trigger: s,
        start: 'top 90%',
        once: true,
        onEnter: () => { if (fill) fill.style.width = target + '%'; }
      });
    });

    /* Lang chips spring in */
    const chips = gsap.utils.toArray('.lang-chip');
    if (chips.length) {
      gsap.from(chips, {
        y: 30,
        opacity: 0,
        scale: 0.85,
        duration: 0.8,
        ease: 'elastic.out(1, 0.65)',
        stagger: 0.06,
        scrollTrigger: { trigger: chips[0].parentElement, start: 'top 85%' }
      });
    }

    /* Timeline draw + items pop */
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 80%',
        once: true,
        onEnter: () => timeline.classList.add('in')
      });
      gsap.utils.toArray('.tl-item').forEach((it, i) => {
        ScrollTrigger.create({
          trigger: it,
          start: 'top 85%',
          once: true,
          onEnter: () => setTimeout(() => it.classList.add('in'), i * 80)
        });
      });
    }

    /* Hobbies horizontal pinned scroll */
    const track = document.querySelector('.hobbies-track');
    const wrap  = document.querySelector('.hobbies-wrap');
    if (track && wrap && window.innerWidth > 760) {
      const panels = gsap.utils.toArray('.hobby-panel');
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth) + 'px',
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          pin: true,
          scrub: 0.8,
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          invalidateOnRefresh: true
        }
      });
      panels.forEach((p) => {
        const inner = p.querySelector('.hobby-inner');
        if (inner) {
          gsap.from(inner, {
            opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: p, containerAnimation: ScrollTrigger.getAll().find(s => s.pin === wrap) }
          });
        }
      });
    }

    /* Section heads fade on enter (numerated) */
    gsap.utils.toArray('.section-head').forEach(h => {
      gsap.from(h, {
        opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 90%' }
      });
    });
  }

  /* ---------- Nav active scroll state ---------- */
  function navScrollState() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    function tick() {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ---------- Boot ---------- */
  function boot() {
    bootLenis();
    splitHero();
    typewriter();
    ioReveal();
    gsapScenes();
    navScrollState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
