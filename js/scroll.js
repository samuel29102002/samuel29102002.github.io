/* ============================================================
   scroll.js · Lenis smooth scroll + GSAP ScrollTrigger experiences
   - All ScrollTrigger instances killed on pagehide / beforeunload
   - Premium easings only (power3.out, power4.out, expo.out, back.out)
   - Skill pills fly in from 4 directions
   - Hobbies horizontal pinned scroll uses scrub: 1 (no trackpad jitter)
   Requires: window.Lenis, window.gsap, window.ScrollTrigger
   ============================================================ */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenis = null;
  let cleanedUp = false;

  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    try {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach((t) => { try { t.kill(); } catch (e) {} });
        if (typeof gsap !== 'undefined' && gsap.ticker) {
          /* Lenis ticker fn was added below — clear known handlers */
          gsap.ticker.remove(window.__lenisTickerFn);
        }
      }
    } catch (e) {}
    try {
      if (lenis && typeof lenis.destroy === 'function') {
        lenis.destroy();
      }
    } catch (e) {}
    lenis = null;
  }

  /* ---------- Lenis smooth scroll ---------- */
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
    function raf(time) {
      if (!lenis) return;
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      const tickerFn = (time) => { if (lenis) lenis.raf(time * 1000); };
      window.__lenisTickerFn = tickerFn;
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }
    window.lenis = lenis;
  }

  /* ---------- IntersectionObserver fallback reveal ---------- */
  function ioReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Hero split chars ---------- */
  function splitHero() {
    const t = document.querySelector('.hero-title');
    if (!t || t.dataset.split === '1') return;
    const text = t.textContent;
    t.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char split-char';
      span.style.animationDelay = (0.04 * i) + 's';
      span.textContent = ch === ' ' ? ' ' : ch;
      t.appendChild(span);
    });
    t.dataset.split = '1';
  }

  /* ---------- Hero typewriter ---------- */
  function typewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    let words;
    try { words = JSON.parse(el.dataset.words || '["Quantitative Data Science"]'); }
    catch (e) { words = ['Quantitative Data Science']; }
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

  /* ---------- Skill pills fly-in (4 directions, premium eases) ---------- */
  function skillPillsAnimation() {
    const pills = document.querySelectorAll('.skill-pill');
    if (!pills.length) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      /* CSS fallback via .in class */
      pills.forEach((p) => p.classList.add('in'));
      return;
    }

    /* Group by parent cluster, animate each cluster on its own trigger */
    const clusters = new Map();
    pills.forEach((p) => {
      const cluster = p.closest('.skill-cluster') || p.parentElement;
      if (!clusters.has(cluster)) clusters.set(cluster, []);
      clusters.get(cluster).push(p);
    });

    clusters.forEach((groupPills, cluster) => {
      groupPills.forEach((pill, idx) => {
        const dir = pill.dataset.from || ['left', 'right', 'top', 'bottom'][idx % 4];
        let fromX = 0, fromY = 0;
        if (dir === 'left')   fromX = -200;
        if (dir === 'right')  fromX =  200;
        if (dir === 'top')    fromY = -150;
        if (dir === 'bottom') fromY =  150;

        const ease = (dir === 'top' || dir === 'bottom') ? 'back.out(1.4)' : 'power3.out';

        gsap.fromTo(pill,
          { x: fromX, y: fromY, opacity: 0 },
          {
            x: 0, y: 0, opacity: 1,
            duration: 0.85,
            ease,
            delay: idx * 0.06,
            scrollTrigger: {
              trigger: cluster,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    });
  }

  /* ---------- GSAP ScrollTrigger experiences ---------- */
  function gsapScenes() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero chars drift on scroll */
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

    /* Hero canvas — gentle dim on scroll, NEVER fades to 0
       (animation loop runs continuously in three-scene.js) */
    const heroCanvas = document.querySelector('.hero-canvas');
    if (heroCanvas) {
      gsap.to(heroCanvas, {
        opacity: 0.3,
        scale: 0.92,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=600',
          scrub: 1
        }
      });
    }

    /* Project cards stagger from alternating sides */
    const cards = gsap.utils.toArray('.project-card');
    cards.forEach((c, idx) => {
      const fromLeft = idx % 2 === 0;
      gsap.from(c, {
        x: fromLeft ? -60 : 60,
        opacity: 0,
        rotationY: fromLeft ? 12 : -12,
        duration: 0.95,
        ease: 'power4.out',
        scrollTrigger: { trigger: c, start: 'top 88%' },
        delay: (idx % 3) * 0.08
      });
    });

    /* Tilt cards on hover */
    document.querySelectorAll('.tilt').forEach((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      };
      const onLeave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });

    /* Timeline draw + items pop */
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 85%',
        once: true,
        onEnter: () => timeline.classList.add('in')
      });
      gsap.utils.toArray('.tl-item').forEach((it, i) => {
        ScrollTrigger.create({
          trigger: it,
          start: 'top 88%',
          once: true,
          onEnter: () => setTimeout(() => it.classList.add('in'), i * 70)
        });
      });
    }

    /* Hobbies horizontal pinned scroll — scrub 1 for trackpad smoothness */
    const track = document.querySelector('.hobbies-track');
    const wrap  = document.querySelector('.hobbies-wrap');
    if (track && wrap && window.innerWidth > 760) {
      const totalScroll = () => track.scrollWidth - window.innerWidth;
      const horizontalTween = gsap.to(track, {
        x: () => -totalScroll() + 'px',
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          pin: true,
          scrub: 1,
          end: () => '+=' + totalScroll(),
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      gsap.utils.toArray('.hobby-panel').forEach((p) => {
        const inner = p.querySelector('.hobby-inner');
        if (!inner) return;
        gsap.from(inner, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: p,
            containerAnimation: horizontalTween,
            start: 'left 70%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    }

    /* Section heads fade on enter */
    gsap.utils.toArray('.section-head').forEach((h) => {
      gsap.from(h, {
        opacity: 0, y: 28,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 90%' }
      });
    });
  }

  /* ---------- Nav scroll state ---------- */
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
    skillPillsAnimation();
    navScrollState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Cleanup on navigation/unload */
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('beforeunload', cleanup);

  /* bfcache restore — reload to reinitialise cleanly */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.location.reload();
  });
})();
