/* ============================================================
   github.js · live GitHub fetch + project card renderer
   ============================================================ */
(function () {
  'use strict';

  const USER = 'samuel29102002';
  const FEATURED = ['orderflow-lab', 'MLES_IMU', 'Continuous-Time-Derivatives-Pricing', 'Energy_Data_Science', 'LEMON-Love-Predictor'];

  /* ---------- Hardcoded fallback (also used to enrich live data) ---------- */
  const META = {
    'orderflow-lab': {
      tagline: 'Self-contained market-microstructure simulator. 2M-ops/sec Rust matching engine, DeepLOB forecaster and Almgren-Chriss execution agent stitched into one live WebSocket firehose.',
      cover: 'https://raw.githubusercontent.com/samuel29102002/orderflow-lab/main/docs/screenshots/landing-hero.png',
      tags: ['rust', 'pytorch', 'fastapi', 'nextjs', 'quant'],
      hasPdf: false
    },
    'MLES_IMU': {
      tagline: 'Machine learning on inertial-measurement-unit sensor data. Embedded C pipeline for activity inference on a microcontroller-grade footprint.',
      cover: null,
      tags: ['embedded', 'sensor-ml', 'c', 'imu'],
      hasPdf: false
    },
    'Continuous-Time-Derivatives-Pricing': {
      tagline: 'CTDP — full pricing pipeline for a Rheinmetall Express Certificate. Binomial tree, Bundesbank Svensson curves, rolling realized vol; reproducible model-vs-market diagnostics.',
      cover: null,
      tags: ['quant-finance', 'derivatives', 'python', 'binomial-tree'],
      pdf: 'https://raw.githubusercontent.com/samuel29102002/Continuous-Time-Derivatives-Pricing/main/6972178_poster.pdf',
      hasPdf: true
    },
    'Energy_Data_Science': {
      tagline: 'HEMS semester project — forecasting, ARMA + ML hybrid models, and 24h optimal storage control under PV scenarios on real residential data.',
      cover: null,
      tags: ['energy', 'time-series', 'optimisation', 'forecasting'],
      pdf: 'https://raw.githubusercontent.com/samuel29102002/Energy_Data_Science/main/ITS8080_project_2025.pdf',
      hasPdf: true
    },
    'LEMON-Love-Predictor': {
      tagline: 'Predicting relationship status from the LEMON dataset — emotional, cognitive and behavioural traits run through interpretable ML with SHAP attribution.',
      cover: 'https://raw.githubusercontent.com/samuel29102002/LEMON-Love-Predictor/main/shap_values.png',
      tags: ['causal', 'shap', 'classification', 'psychometrics'],
      hasPdf: false
    }
  };

  const LANG_COLOR = {
    'Python': '#3b82f6',
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'HTML': '#e34f26',
    'CSS': '#264de4',
    'C': '#a8b9cc',
    'C++': '#00599c',
    'Rust': '#dea584',
    'R': '#198ce7',
    'Jupyter Notebook': '#da5b0b',
    'Shell': '#89e051',
    'Go': '#00add8',
    'Java': '#b07219'
  };

  /* ---------- Helpers ---------- */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function escapeHTML(s) {
    return (s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function langColor(l) { return LANG_COLOR[l] || '#888'; }

  /* ---------- Render one card ---------- */
  function renderCard(repo, isFeatured) {
    const meta = META[repo.name] || {};
    const card = el('article', 'project-card tilt' + (isFeatured ? ' featured' : ''));

    /* Cover */
    const cover = el('div', 'project-cover');
    if (meta.cover) {
      const img = el('img');
      img.loading = 'lazy';
      img.width = 800; img.height = 450;
      img.alt = repo.name + ' preview';
      img.src = meta.cover;
      img.onerror = () => { cover.innerHTML = '<div class="placeholder">' + escapeHTML(repo.language || 'CODE') + '</div>'; };
      cover.appendChild(img);
    } else {
      cover.appendChild(el('div', 'placeholder', escapeHTML(repo.language || 'CODE')));
    }

    /* Badges */
    const badges = el('div', 'badge-row');
    if (isFeatured) badges.appendChild(el('span', 'badge', '★ Featured'));
    if (meta.hasPdf) {
      const pdf = el('a', 'badge pdf', '📄 Paper');
      pdf.href = meta.pdf;
      pdf.target = '_blank'; pdf.rel = 'noopener';
      pdf.addEventListener('click', e => e.stopPropagation());
      badges.appendChild(pdf);
    }
    cover.appendChild(badges);
    card.appendChild(cover);

    /* Body */
    const body = el('div', 'project-body');

    const title = el('h3', 'project-title', escapeHTML(repo.name.replace(/[-_]/g, ' ')));
    body.appendChild(title);

    const desc = el('p', 'project-desc');
    desc.textContent = meta.tagline || repo.description || 'Repository on GitHub.';
    body.appendChild(desc);

    /* Meta */
    const m = el('div', 'project-meta');
    if (repo.language) {
      const lang = el('span', 'stat');
      lang.innerHTML = '<span class="lang-dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + langColor(repo.language) + '"></span>' + escapeHTML(repo.language);
      m.appendChild(lang);
    }
    if (typeof repo.stargazers_count === 'number') {
      m.appendChild(el('span', 'stat', '★ ' + repo.stargazers_count));
    }
    const updated = repo.pushed_at ? new Date(repo.pushed_at).getFullYear() : '';
    if (updated) m.appendChild(el('span', 'stat', updated));
    body.appendChild(m);

    /* Tags */
    const tags = el('div', 'tags');
    const tagPool = (repo.topics && repo.topics.length ? repo.topics : (meta.tags || [])).slice(0, 5);
    tagPool.forEach(t => tags.appendChild(el('span', 'tag', '#' + escapeHTML(t))));
    if (tagPool.length) body.appendChild(tags);

    /* Link */
    const link = el('a', 'project-link', 'View Repo');
    link.href = repo.html_url || ('https://github.com/' + USER + '/' + repo.name);
    link.target = '_blank'; link.rel = 'noopener';
    body.appendChild(link);

    card.appendChild(body);

    /* Tilt mousemove (also bound by scroll.js but safe to add) */
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });

    return card;
  }

  /* ---------- Skeletons ---------- */
  function showSkeletons(grid, n) {
    grid.innerHTML = '';
    for (let i = 0; i < n; i++) grid.appendChild(el('div', 'skeleton'));
  }

  /* ---------- Fallback data when API fails ---------- */
  function fallbackRepos() {
    return FEATURED.map(name => ({
      name,
      html_url: 'https://github.com/' + USER + '/' + name,
      description: META[name] ? META[name].tagline : '',
      language: ({
        'orderflow-lab': 'Python',
        'MLES_IMU': 'C',
        'Continuous-Time-Derivatives-Pricing': 'Jupyter Notebook',
        'Energy_Data_Science': 'Jupyter Notebook',
        'LEMON-Love-Predictor': 'Jupyter Notebook'
      })[name] || null,
      stargazers_count: name === 'orderflow-lab' || name === 'Energy_Data_Science' || name === 'LEMON-Love-Predictor' ? 1 : 0,
      topics: META[name] ? META[name].tags : [],
      pushed_at: '2025-12-01T00:00:00Z'
    }));
  }

  /* ---------- Main ---------- */
  async function loadProjects(gridSelector, opts) {
    opts = opts || {};
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    const onlyFeatured = !!opts.featuredOnly;
    const limit = opts.limit || 0;

    showSkeletons(grid, onlyFeatured ? 3 : 6);

    let repos = [];
    try {
      const res = await fetch('https://api.github.com/users/' + USER + '/repos?sort=updated&per_page=50', {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if (!res.ok) throw new Error('rate-limit or network');
      repos = await res.json();
    } catch (err) {
      console.warn('[github.js] using fallback:', err.message);
      repos = fallbackRepos();
    }

    /* Sort: featured first (in declared order), then rest by updated desc */
    const featuredRepos = [];
    FEATURED.forEach(name => {
      const r = repos.find(x => x.name === name);
      if (r) featuredRepos.push(r);
    });
    const others = repos
      .filter(r => !FEATURED.includes(r.name) && !r.fork && !r.archived && !r.private)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    let final = onlyFeatured ? featuredRepos : [...featuredRepos, ...others];
    if (limit) final = final.slice(0, limit);

    grid.innerHTML = '';
    final.forEach(r => grid.appendChild(renderCard(r, FEATURED.includes(r.name))));
  }

  /* Expose */
  window.SHGitHub = { loadProjects };

  /* Auto-init based on data attrs */
  document.addEventListener('DOMContentLoaded', () => {
    const all = document.querySelector('[data-github-grid]');
    if (all) loadProjects('[data-github-grid]', { featuredOnly: all.dataset.featuredOnly === 'true', limit: parseInt(all.dataset.limit || '0', 10) });
  });
})();
