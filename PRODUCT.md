# Product

## Register

product

## Users

Self-hosters and homelab operators who run Flame as the browser start page / new-tab
page for their home server. They open it many times a day to jump to a self-hosted
service (Sonarr, Grafana, Pi-hole, etc.) or a bookmark. Context: a personal LAN
dashboard, often on a wall-mounted tablet or a desktop new-tab, sometimes phone.
Primary job: get to the right link in one glance and one click. Secondary job
(authenticated only): curate apps, bookmarks, categories, themes, and settings.

## Product Purpose

Flame is a self-hosted start page: an Express + SQLite backend serving a React/Redux
SPA. It replaces a wall of browser bookmarks with a clean, customizable launcher for
apps and bookmarks, with optional Docker/Kubernetes auto-discovery, a weather widget,
JWT auth, and custom theming. Success = the page loads instantly and the user reaches
their destination without thinking about the interface at all.

## Brand Personality

Quiet, near-invisible, utilitarian. The UI should disappear into the task: the user's
own apps, icons, and chosen theme are the content; Flame's chrome should recede. Three
words: calm, fast, unobtrusive. It is a launcher, not a destination — no dashboard
theater, no decorative motion, no demand for attention.

## Anti-references

- Heavy "admin dashboard" chrome (sidebars, KPI cards, busy toolbars) — Flame is a
  launcher, not an analytics product.
- The AI-SaaS look: hero-metric blocks, identical icon+title+text card grids,
  tracked-uppercase eyebrows, gradient accents, glassmorphism.
- Skinned consumer start pages that push widgets, news, and ads. Flame shows only what
  the user added.

## Design Principles

- **Disappear into the task.** Every pixel of chrome competes with the user's links.
  Default to removing, not adding.
- **One glance, one click.** The most common action (open a pinned app/bookmark) must
  be the most visually obvious and reachable.
- **The user's content is the brand.** Their icons, names, and chosen theme carry the
  personality; Flame stays neutral so any theme looks intentional.
- **Familiar over clever.** Standard affordances (links, search, forms) behave exactly
  as expected. Surprise is a cost here, not delight.
- **Fast and themeable.** Instant load and full color control matter more than fixed
  visual flourish.

## Accessibility & Inclusion

Target WCAG 2.1 AA. Because the palette is fully user-themeable, the *default* theme
must pass contrast (body text >=4.5:1, large text >=3:1) and the theme editor should
warn on failing combinations. Full keyboard operability for search, navigation, and
settings forms; visible focus indicators (currently weak). Respect
`prefers-reduced-motion`. Don't rely on color alone for state.
