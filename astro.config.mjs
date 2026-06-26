// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site. Update `site` to your GitHub username and `base`
  // to your repo name if they differ.
  site: 'https://avetavos.github.io',
  base: '/rust-for-typescript-developers',
  output: 'static',
  integrations: [starlight({
      title: 'Rust for TypeScript Developers',
      head: [
        { tag: 'script', attrs: { type: 'module', src: '/rust-for-typescript-developers/enhance.js' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/rust-for-typescript-developers/manifest.webmanifest' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/rust-for-typescript-developers/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/rust-for-typescript-developers/icon-192.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#CE422B' } },
        { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: "Rust for TypeScript Developers" } },
        { tag: 'script', content: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/rust-for-typescript-developers/sw.js',{scope:'/rust-for-typescript-developers/'}).catch(function(){})})}" },
      ],
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        th: { label: 'ไทย', lang: 'th' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/avetavos/rust-for-typescript-developers' }],
      sidebar: [
        { label: 'Introduction & Setup', items: [{ autogenerate: { directory: 'intro' } }] },
        { label: 'Rust 101 — Fundamentals', items: [{ autogenerate: { directory: 'rust-101' } }] },
        { label: "Rust You Won't Find in TypeScript", items: [{ autogenerate: { directory: 'rs-only' } }] },
        { label: 'Concurrency', items: [{ autogenerate: { directory: 'concurrency' } }] },
        { label: 'Building an API with Axum', items: [{ autogenerate: { directory: 'api-axum' } }] },
        { label: 'Advanced Rust', items: [{ autogenerate: { directory: 'advanced' } }] },
        { label: 'Tooling, Testing & Deployment', items: [{ autogenerate: { directory: 'tooling' } }] },
      ],
      }), preact()],
});