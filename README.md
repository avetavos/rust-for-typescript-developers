# Rust for TypeScript Developers

A bilingual, interactive course that teaches Rust to TypeScript developers using a comparison-first approach. Every concept is introduced from the TypeScript perspective first, then mapped to the Rust equivalent. All runnable examples compile and run in the browser against the real Rust compiler — no backend or local Rust installation required for reading the course.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Site framework | [Astro 6](https://astro.build) + [Starlight 0.40](https://starlight.astro.build) |
| UI islands | [Preact](https://preactjs.com) (via `@astrojs/preact`) |
| In-browser Rust runner | The official [Rust Playground](https://play.rust-lang.org) API, called directly from the browser (CORS-open) |
| Unit tests | [Vitest](https://vitest.dev) + `@testing-library/preact` |
| Styling | Starlight default + custom CSS (`src/styles/custom.css`) |
| i18n | Starlight built-in, `defaultLocale: 'en'`, locales: `en` + `th` |

## Commands

Run all commands from the project root.

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Build production site to ./dist/
npm run preview    # Preview the production build locally
npm test           # Run Vitest unit tests
```

> There is **no build step for the runtime** — Rust compiles on the public Rust
> Playground at runtime, so there is nothing to compile, download, or commit.

## Content Structure

Lessons live at:

```
src/content/docs/
  en/              # English content — served at /en/...
    intro/
    rust-101/
    rs-only/
    concurrency/
    api-axum/
    advanced/
    tooling/
    index.mdx      # EN landing page (splash template)
  th/              # Thai content — served at /th/...
    (same module directories)
    index.mdx      # TH landing page (splash template)
```

### The 7 Modules

| Directory | Module | Topics |
| --------- | ------ | ------ |
| `intro` | Introduction & Setup | Why Rust for TS devs, mental-model shifts, toolchain setup |
| `rust-101` | Rust 101 — Fundamentals | Variables, functions, control flow, structs, enums, collections, Option/Result |
| `rs-only` | Rust You Won't Find in TypeScript | Ownership, borrowing, lifetimes, traits, ADTs, no-null, no-GC |
| `concurrency` | Concurrency | Threads, Send/Sync, channels, Arc/Mutex, async/await with Tokio |
| `api-axum` | Building an API with Axum | Routing, extractors, state, serde, middleware, errors, sqlx, testing (Express/Nest ↔ Axum) |
| `advanced` | Advanced Rust | Generics & trait bounds, trait objects, closures/iterators, `?`/thiserror, macros, smart pointers |
| `tooling` | Tooling, Testing & Deployment | cargo, clippy, rustfmt, cargo test, workspaces, cross-compile, Docker, CI |

### Lesson File IDs

Content IDs follow the `<module>/<slug>` convention, e.g. `rust-101/variables`. The Starlight sidebar uses `autogenerate: { directory }` per locale root, so new `.mdx` files are picked up automatically.

### 7-Section Lesson Template

Each lesson MDX file follows this structure:

1. **Intro** — one-paragraph framing of the concept, anchored in TypeScript
2. **Concept** — prose explanation
3. **TsGo** — `<TsGo ts={...} go={...} />` side-by-side comparison (left = TypeScript, right = Rust; the `go` prop carries the Rust code)
4. **Playground** — `<Playground code={...} />` runnable Rust snippet (omitted where it can't run, e.g. servers/multi-file crates, with a note)
5. **RsOnly** — `<RsOnly>` callout for Rust-only concepts with no TS equivalent
6. **Quiz** — `<Quiz questions={...} />` comprehension check
7. **ProgressTracker** — `<ProgressTracker id="module/slug" />` (always last)

Code snippets are hoisted into `export const` template literals and passed to the
components by reference (e.g. `export const fooCode = \`...\`` then `<Playground code={fooCode} />`).

> **⚠️ Authoring gotchas:**
> - **Frontmatter `title`/`description` are single-quoted** when they contain a colon,
>   backtick, or other YAML-significant character (e.g. a description mentioning
>   `` `<T: Display>` ``). Quote them or the build's YAML parser fails.
> - **Escape sequences in code template literals must be double-backslashed** —
>   write `\\n`, `\\t`. A single `\n` is consumed by JS template-literal parsing.
> - **Rust format strings use `{}` / `{var}`, never JS-style `${}`.** (TypeScript code
>   in the `ts` prop legitimately uses `\${...}` inside its template literals.)

## How Runnable Code Works

The runner calls the official [Rust Playground](https://play.rust-lang.org) `/execute` endpoint directly from the browser (it sends `Access-Control-Allow-Origin: *`). When a reader clicks "Run" in a `<Playground>`:

1. The snippet is POSTed to `play.rust-lang.org/execute` (stable channel, 2021 edition).
2. On success, `stdout` is shown inline; on failure, the **real `rustc` / borrow-checker error** (`stderr`) is shown — great for teaching.
3. On network failure, an "Open in Rust Playground" fallback link is offered.

**Coverage:** the full standard library, threads, `async`/Tokio, and popular crates (serde, rand, anyhow, thiserror) all run on the Playground. Code that **binds a network port** (an Axum server) or needs a **multi-file crate** cannot run — those lessons use code blocks with a "run locally" note. Lessons that teach a *compile error* (e.g. the borrow checker) show the failing code in a fenced block with the `// error[E....]` annotation, and keep the runnable `<Playground>` for the working version.

The endpoint lives in `src/components/rust-runner.ts`.

## Deployment

The site is fully static (`output: 'static'` in `astro.config.mjs`). Build output lands in `dist/`. The runner is just a `fetch`, so there is **no large committed asset** — deploy to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages all work).

### GitHub Pages (configured)

This repo deploys to GitHub Pages via `.github/workflows/deploy.yml` (build with
`withastro/action` on Node 22, publish with `actions/deploy-pages`).

One-time setup:

1. Create a GitHub repo and push (`main` branch).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Confirm the base path in `astro.config.mjs` matches your setup:
   - **Project site** (`https://USER.github.io/REPO/`): `site: 'https://USER.github.io'`, `base: '/REPO'` (currently `avetavos` / `rust-for-typescript-developers`).
   - **User/org site** (`USER.github.io` repo) or **custom domain**: set `site` and **remove `base`** (served at root).

If you change `base`, update the base-prefixed links in
`src/content/docs/{en,th}/index.mdx` (hero actions + cards) to match.

### Other static hosts (served at root — no `base` needed)

If deploying to Netlify, Vercel static, Cloudflare Pages, or a custom domain,
**remove the `base` option** from `astro.config.mjs` (and revert the landing-page
links to `/en/...`):

- **Netlify** — build command `npm run build`, publish dir `dist`
- **Vercel** — static preset, no serverless functions needed
- **Cloudflare Pages** — build command `npm run build`, output `dist`
