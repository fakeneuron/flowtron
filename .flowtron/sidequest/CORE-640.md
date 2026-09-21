---
title: js-yaml-5-gray-matter
status: sidequest
priority: Low
pickup: next-chat
created: 2026-09-20
parent: CORE-639.3
---

# CORE-640 | js-yaml-5-gray-matter

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-20)

## Idea

Bump `js-yaml` 4→5 after gray-matter stops calling `yaml.safeLoad.bind` at import (`gray-matter/lib/engines.js`). CORE-639.3's isolate bump failed immediately: `TypeError: Cannot read properties of undefined (reading 'bind')` loading `vite.config.ts`. The `$js-yaml` override (CORE-575.3) forces gray-matter onto the root spec, so a root 5.x bump cannot hide behind nested 3.x. Keep the override; do not wipe the lockfile. Empty-input `load('')` throw and CORE_SCHEMA default are secondary once import works.

## Resume anchor

CORE-639.3 viz-majors-triage, after reverting js-yaml 5 and keeping the other green majors.
