---
title: brand-kit-back-port
status: starter
tags: [brand]
created: 2026-09-20
touches:
  - brand/BRAND.md
  - brand/logo.svg
  - brand/favicon.svg
  - brand/README.md
---

# CORE-643 | brand-kit-back-port

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-09-20)

## 🌱 Starter context

_Captured 2026-09-20 during natabula fleet-audit — promote to full tasknote at `/ft-task` checkout._

### Why this exists

fakeneuron.com already shows a Flowtron card (`/projects/flowtron-logo.webp`). The producer has no `brand/` kit, so fleet-brand and `/natabula-fleet-audit` read 0/4. The site copy was harvested from `LOGO.png` (now gone); `LOGO.webp` remains at repo root. NAT-297's kit is the contracted home — do not invent a third path.

### Solution shape

- Copy `templates/brand/{BRAND.md,README.md}` from natabula into `brand/`.
- Trace or convert `LOGO.webp` (and `viz/public/LOGO.webp` if that is the sharper original) into `brand/logo.svg` + `brand/favicon.svg`. No embedded raster. Logo legible at 32 px; favicon square and readable at 16 px.
- Fill `BRAND.md` front-matter (`tagline` ≤8 words, `one_liner` ≤25, `description` ≤80). Public-safe. Site card copy is art-piece voice — fact-check against it, do not paste it.
- Add `brand/promo-16x9.webp` only if a real 1600×900 still exists in this repo. Do not upscale the site's 640×360 card shot.

### Files to touch (preliminary survey — drift-check at promotion)

- `LOGO.webp` — current producer mark (raster)
- `viz/public/LOGO.webp` — viz copy; compare, pick the better original
- `brand/` — create kit

### Explicitly out of scope

- fakeneuron.com `public/projects/flowtron-*.webp` — lens copies; never mine these back
- Deleting `LOGO.webp` / viz copy — leave until something still imports them
- Rewriting `viz/` favicon chrome
- Inventing a new mark

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Standard | Existing `brand/` four-file kit | NAT-297; no third location |
| Source | Producer original, never the site | FLEET-ARCHITECTURE rule 1 |
| Promo | Optional, only a real 1600×900 | Card shots are 640×360 |

### Open at promotion (Phase 1 should resolve)

- Trace vs redraw for SVG. Lean: trace `LOGO.webp` if the cog/mascot survives at 32 px; otherwise a simplified mark derived from it.
- Whether `viz/public/favicon.png` should later be recut from `brand/favicon.svg` (separate, optional).

### Related

- natabula [[NAT-306]] — featured-set index
- natabula `docs/DESIGN-STANDARDS.md` §Brand kit
---
