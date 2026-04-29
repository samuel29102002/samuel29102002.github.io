/* ============================================================
   nav.js · mobile menu + active link state + page transitions
   ============================================================ */
(function () {
  'use strict';

  function setActive() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-link').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const match = href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === './') || href === './' + path;
      if (match) a.classList.add('active');
    });
  }

  function burger() {
    const btn = document.querySelector('.nav-burger');
    const links = document.querySelector('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        btn.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  function softTransitions() {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
        e.preventDefault();
        document.body.classList.add('page-leave');
        document.body.style.transition = 'opacity 0.28s ease';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 240);
      });
    });
  }

  function pageEnter() {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    });
  }

  function boot() {
    setActive();
    burger();
    softTransitions();
    pageEnter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
