# Samuel Heinrich · Personal Site

Editorial portfolio for Samuel Heinrich. Built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Framer Motion and a small set of bespoke components
adapted from 21st.dev / Aceternity. Deploys as a static export to GitHub Pages.

**Live:** [samuel29102002.github.io](https://samuel29102002.github.io/)

---

## Stack

| Layer       | Choice                                                    |
| ----------- | --------------------------------------------------------- |
| Framework   | Next.js 14 (App Router, `output: 'export'`)               |
| Language    | TypeScript (strict)                                       |
| Styling     | Tailwind CSS 3.4 + `tailwindcss-animate`                  |
| UI          | shadcn/ui patterns + 21st.dev-style cinematic components  |
| Animation   | Framer Motion (primary), GSAP ScrollTrigger (secondary)   |
| Fonts       | `next/font/google` — Cormorant Garamond, Syne, Fira Code  |
| Hosting     | GitHub Pages (user repo, static `out/`)                   |
| CI          | GitHub Actions (`.github/workflows/deploy.yml`)           |

---

## Getting started

```bash
# 1. Install deps
npm install

# 2. Develop
npm run dev          # http://localhost:3000

# 3. Build static export
npm run build        # output written to ./out
```

The build is fully static — no server-side runtime, no dynamic routes, all
GitHub data is fetched client-side at runtime.

---

## Project structure

```
.
├── app/
│   ├── layout.tsx                 # root layout, fonts, nav
│   ├── globals.css                # tailwind + tokens + utilities
│   ├── page.tsx                   # / — Prisma hero + about + skills cloud
│   ├── about/page.tsx             # /about — radial orbital timeline + stats
│   ├── projects/page.tsx          # /projects — ContainerScroll + grid
│   ├── hobbies/page.tsx           # /hobbies — Lamp + horizontal pinned scroll
│   └── contact/page.tsx           # /contact — form + cinematic footer
├── components/
│   ├── nav.tsx                    # sticky nav, mobile overlay
│   └── ui/
│       ├── animated-gradient.tsx       # WebGL Prism preset
│       ├── prisma-hero.tsx             # cinematic hero w/ WordsPullUp
│       ├── radial-orbital-timeline.tsx # orbital interactive timeline
│       ├── container-scroll-animation.tsx
│       ├── motion-footer.tsx           # magnetic CTA + glass pills + marquee
│       ├── lamp.tsx                    # amber lamp glow
│       └── button.tsx                  # shadcn-style button primitive
├── lib/
│   ├── github.ts                  # typed GitHub API utilities
│   └── utils.ts                   # cn() helper
├── public/
│   ├── favicon.svg
│   └── .nojekyll                  # disables Jekyll on GH Pages
├── .github/workflows/deploy.yml   # CI build + deploy to Pages
├── next.config.ts                 # output: 'export'
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Design system

| Token         | Value                              |
| ------------- | ---------------------------------- |
| Background    | `#0f0f0f` (near-black, not pure)   |
| Surface       | `#181818` (cards, inputs)          |
| Border        | `#252525`                          |
| Text          | `#f2ede7` (warm off-white)         |
| Muted text    | `#888880`                          |
| Accent        | `#d4a843` (amber-gold)             |
| Accent dim    | `#9a7830`                          |
| Display font  | Cormorant Garamond · 300 / 400 / 600 |
| Body font     | Syne · 400 / 500 / 700             |
| Mono font     | Fira Code · 400                    |

Tokens live in `tailwind.config.ts` (color names, fluid font sizes) and
`app/globals.css` (CSS variables + utility classes like `.glass-card`,
`.skill-pill`, `.img-slot`).

Image placeholder slots use `.img-slot` — drop a real image into `/public/assets/`
and replace the slot markup. Each slot includes the expected file path inline so
it's obvious what to add and where.

---

## GitHub data

`lib/github.ts` exposes a typed API:

```ts
fetchRepos(username): Promise<Repo[]>
fetchReadme(username, repo): Promise<string>
fetchRepoScreenshots(username, repo, max?): Promise<string[]>
loadProjects({ featuredOnly, limit }): Promise<Repo[]>
```

`loadProjects()` is the high-level helper used by the projects page. It:

1. Fetches `samuel29102002`'s repos.
2. Sorts the `FEATURED` list to the top (orderflow-lab, MLES_IMU, CTDP,
   Energy_Data_Science, LEMON-Love-Predictor).
3. Synthesises a stub for any featured repo that lives in another account —
   e.g. `LEMON-Love-Predictor` lives at
   [github.com/nicola1702/LEMON-Love-Predictor](https://github.com/nicola1702/LEMON-Love-Predictor).
4. Falls back to a hardcoded set on API failure (rate-limit, network) so the
   page is never blank.

To feature a new repo: add its name to `FEATURED` in `lib/github.ts` and a
matching entry in `META`.

---

## Deploy

The site auto-deploys on every push to `main` via GitHub Actions
(`.github/workflows/deploy.yml`):

1. Checkout
2. `npm ci`
3. `npm run build` (Next.js static export → `./out`)
4. Upload `out/` as a Pages artifact
5. `actions/deploy-pages@v4` publishes it

To enable: in the repo settings → **Pages** → **Source: GitHub Actions**.

For manual deploy:

```bash
npm ci
npm run build
# copy out/* to your gh-pages branch / hosting target
```

The repo `samuel29102002.github.io` is a **user page**, served at
`https://samuel29102002.github.io/`. No `basePath` is needed. For project pages,
set `basePath: '/repo-name'` and `assetPrefix: '/repo-name/'` in
`next.config.ts`.

---

## Polish checklist (all green)

- [x] WebGL gradient runs continuously — never paused by scroll
- [x] All GSAP ScrollTrigger instances killed in `useEffect` cleanup
- [x] Framer Motion respects `prefers-reduced-motion`
- [x] Skill pills fly in from 4 directions (GSAP, `back.out` / `power3.out`)
- [x] LEMON repo URL → `github.com/nicola1702/LEMON-Love-Predictor`
- [x] All inter-page links use Next.js `<Link>` with relative hrefs
- [x] `output: 'export'` builds without errors
- [x] `.nojekyll` shipped in `/public`
- [x] OG meta tags on every page (title, description, image)
- [x] Mobile: hamburger overlay nav, single column, `clamp()` font sizes

---

## License

Code: MIT. Content (text, photos, project descriptions): © Samuel Heinrich.
