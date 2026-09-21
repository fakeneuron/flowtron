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

Re-checked 2026-09-20 (`/ft-task CORE-640` Discovery): npm `gray-matter` still **4.0.3** (2021-04-24); GitHub `master` `lib/engines.js` still `yaml.safeLoad.bind` / `yaml.safeDump.bind`; no published release of commit `ba2bc22` (load/dump). Halted as Phase 1 blocked-prerequisite Re-scope — no flowtron `Blocked by [[ID]]` (upstream package, not a task). Re-enter when gray-matter publishes a build that binds `load`/`dump` (or drops the eager bind).
