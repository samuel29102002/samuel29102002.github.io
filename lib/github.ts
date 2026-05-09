/**
 * Typed GitHub API utilities for client-side fetching.
 * No tokens — relies on the 60 req/h unauthenticated limit. On failure,
 * callers should fall back to FALLBACK_REPOS.
 */

export interface Repo {
  name: string;
  full_name?: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count?: number;
  topics: string[];
  pushed_at: string;
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
  /* enrichment */
  cover?: string | null;
  paperUrl?: string | null;
  tagline?: string;
}

export interface RepoMeta {
  tagline?: string;
  cover?: string | null;
  paperUrl?: string;
  tags?: string[];
  /* When a featured repo lives in a different owner (e.g. LEMON in nicola1702) */
  url?: string;
  apiOwner?: string;
}

export const USER = 'samuel29102002';

export const FEATURED: string[] = [
  'orderflow-lab',
  'MLES_IMU',
  'Continuous-Time-Derivatives-Pricing',
  'Energy_Data_Science',
  'LEMON-Love-Predictor',
];

export const META: Record<string, RepoMeta> = {
  'orderflow-lab': {
    tagline:
      'Self-contained market-microstructure simulator. Rust matching engine, DeepLOB forecaster, Almgren-Chriss execution agent — one live WebSocket firehose.',
    cover:
      'https://raw.githubusercontent.com/samuel29102002/orderflow-lab/main/docs/screenshots/landing-hero.png',
    tags: ['rust', 'pytorch', 'fastapi', 'nextjs', 'quant'],
  },
  MLES_IMU: {
    tagline:
      'Machine learning on inertial measurement unit (IMU) sensor data — embedded pipeline for activity inference.',
    cover: null,
    tags: ['embedded', 'sensor-ml', 'imu'],
  },
  'Continuous-Time-Derivatives-Pricing': {
    tagline:
      'Pricing pipeline for a Rheinmetall Express Certificate. Binomial tree, Bundesbank Svensson curves, rolling realized vol; reproducible model-vs-market diagnostics.',
    cover: null,
    paperUrl:
      'https://raw.githubusercontent.com/samuel29102002/Continuous-Time-Derivatives-Pricing/main/6972178_poster.pdf',
    tags: ['quant-finance', 'derivatives', 'binomial-tree'],
  },
  Energy_Data_Science: {
    tagline:
      'HEMS semester project — forecasting, ARMA + ML hybrid models, 24h optimal storage control under PV scenarios on residential data.',
    cover: null,
    paperUrl:
      'https://raw.githubusercontent.com/samuel29102002/Energy_Data_Science/main/ITS8080_project_2025.pdf',
    tags: ['energy', 'time-series', 'optimisation', 'forecasting'],
  },
  'LEMON-Love-Predictor': {
    tagline:
      'Predicting relationship status from the LEMON dataset — emotional, cognitive and behavioural traits run through interpretable ML with SHAP attribution.',
    cover:
      'https://raw.githubusercontent.com/nicola1702/LEMON-Love-Predictor/main/shap_values.png',
    /* repo lives in another account */
    url: 'https://github.com/nicola1702/LEMON-Love-Predictor',
    apiOwner: 'nicola1702',
    tags: ['causal', 'shap', 'classification'],
  },
};

export const LANG_COLOR: Record<string, string> = {
  Python: '#3b82f6',
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  HTML: '#e34f26',
  CSS: '#264de4',
  Rust: '#dea584',
  R: '#198ce7',
  'Jupyter Notebook': '#da5b0b',
  Shell: '#89e051',
  Go: '#00add8',
};

export function langColor(l: string | null | undefined): string {
  if (!l) return '#888';
  return LANG_COLOR[l] ?? '#888';
}

/* ────────────────────────────────────────────────────────────── */

export async function fetchRepos(username: string = USER): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=50`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return (await res.json()) as Repo[];
}

export async function fetchReadme(
  username: string,
  repo: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo}/readme`,
    { headers: { Accept: 'application/vnd.github.raw' } }
  );
  if (!res.ok) throw new Error(`README ${res.status}`);
  return await res.text();
}

const SCREENSHOT_DIRS = ['screenshots', 'assets', 'figures', 'images', 'docs'];
const IMG_RE = /\.(png|jpe?g|gif|webp)$/i;

interface ContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export async function fetchRepoScreenshots(
  username: string,
  repo: string,
  maxImages = 4
): Promise<string[]> {
  const out: string[] = [];

  /* root scan first — pick up orderflow-lab/docs etc. */
  const rootRes = await fetch(
    `https://api.github.com/repos/${username}/${repo}/contents/`
  );
  if (!rootRes.ok) return [];
  const root = (await rootRes.json()) as ContentItem[];

  /* root-level images */
  for (const f of root) {
    if (out.length >= maxImages) break;
    if (f.type === 'file' && IMG_RE.test(f.name) && f.download_url) {
      out.push(f.download_url);
    }
  }

  /* known screenshot directories — recursive one-level */
  for (const dir of SCREENSHOT_DIRS) {
    if (out.length >= maxImages) break;
    const hit = root.find((it) => it.type === 'dir' && it.name.toLowerCase() === dir);
    if (!hit) continue;
    try {
      const sub = await fetch(
        `https://api.github.com/repos/${username}/${repo}/contents/${dir}`
      );
      if (!sub.ok) continue;
      const items = (await sub.json()) as ContentItem[];
      for (const f of items) {
        if (out.length >= maxImages) break;
        if (f.type === 'file' && IMG_RE.test(f.name) && f.download_url) {
          out.push(f.download_url);
        } else if (f.type === 'dir') {
          /* one extra level (e.g., docs/screenshots/) */
          try {
            const deep = await fetch(
              `https://api.github.com/repos/${username}/${repo}/contents/${f.path}`
            );
            if (!deep.ok) continue;
            const deepItems = (await deep.json()) as ContentItem[];
            for (const g of deepItems) {
              if (out.length >= maxImages) break;
              if (g.type === 'file' && IMG_RE.test(g.name) && g.download_url) {
                out.push(g.download_url);
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  return out;
}

/* ────────────────────────────────────────────────────────────── */

export const FALLBACK_REPOS: Repo[] = FEATURED.map((name) => {
  const meta = META[name] ?? {};
  const owner = meta.apiOwner ?? USER;
  return {
    name,
    full_name: `${owner}/${name}`,
    html_url: meta.url ?? `https://github.com/${owner}/${name}`,
    description: meta.tagline ?? null,
    language:
      ({
        'orderflow-lab': 'Python',
        MLES_IMU: 'Python',
        'Continuous-Time-Derivatives-Pricing': 'Jupyter Notebook',
        Energy_Data_Science: 'Jupyter Notebook',
        'LEMON-Love-Predictor': 'Jupyter Notebook',
      } as Record<string, string>)[name] ?? null,
    stargazers_count: ['orderflow-lab', 'Energy_Data_Science', 'LEMON-Love-Predictor'].includes(
      name
    )
      ? 1
      : 0,
    topics: meta.tags ?? [],
    pushed_at: '2026-01-15T00:00:00Z',
    cover: meta.cover ?? null,
    paperUrl: meta.paperUrl ?? null,
    tagline: meta.tagline,
  };
});

/**
 * Convenience: fetch user repos, sort featured-first, enrich with META.
 * Returns FALLBACK_REPOS on failure — never throws to the caller.
 */
export async function loadProjects(opts?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Repo[]> {
  const { featuredOnly = false, limit = 0 } = opts ?? {};
  let repos: Repo[] = [];

  try {
    repos = await fetchRepos();
  } catch (err) {
    console.warn('[github] using fallback:', (err as Error).message);
    return featuredOnly
      ? limit
        ? FALLBACK_REPOS.slice(0, limit)
        : FALLBACK_REPOS
      : limit
      ? FALLBACK_REPOS.slice(0, limit)
      : FALLBACK_REPOS;
  }

  /* enrich + sort */
  const featured: Repo[] = [];
  FEATURED.forEach((name) => {
    const found = repos.find((r) => r.name === name);
    const meta = META[name] ?? {};
    if (found) {
      featured.push({ ...found, ...meta, html_url: meta.url ?? found.html_url });
    } else if (meta.url || meta.apiOwner) {
      const owner = meta.apiOwner ?? USER;
      featured.push({
        name,
        html_url: meta.url ?? `https://github.com/${owner}/${name}`,
        description: meta.tagline ?? null,
        language: null,
        stargazers_count: 0,
        topics: meta.tags ?? [],
        pushed_at: '2026-01-15T00:00:00Z',
        ...meta,
      });
    }
  });

  const others = repos
    .filter((r) => !FEATURED.includes(r.name) && !r.fork && !r.archived && !r.private)
    .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at));

  let final = featuredOnly ? featured : [...featured, ...others];
  if (limit > 0) final = final.slice(0, limit);
  return final;
}
