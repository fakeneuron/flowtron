# Flowtron visualizer (`viz/`)

Read-only Vite/React/TypeScript view of every flowtron-adopting project under
`${FLOWTRON_VIZ_WORKSPACE:-~/code}`. Operator-facing runbook (workspace scan,
port, adopter submodule path) lives in the repo-root
[`README.md` §Visualizer](../README.md#visualizer); threat model in
[`SECURITY.md` §Visualizer](../SECURITY.md#visualizer-viz-dev-server-scope).
This file declares the **module architecture** structural audits judge against.

## Commands

From the repository root (parent of `viz/`):

```sh
npm --prefix viz install
npm --prefix viz run dev        # http://localhost:5120 (strictPort)
npm --prefix viz test
npm --prefix viz run typecheck
npm --prefix viz run lint
```

Inside `viz/`, drop the `--prefix viz`.

## Architecture — three tiers

`viz/src` is split into three tiers. Dependency direction is one-way down the
table: a tier may import from tiers below it, never above.

| Tier | Where | Role |
|---|---|---|
| **Browser UI** | `src/ui/` | React components, hooks, and browser-view selectors. |
| **Shared pure** | `src/*.ts` with no `node:` imports | Parsing (`parser`, `tasknote`, `tasknote-parse`) plus other Node-free shared modules (`sseChange`, `viewMode`, `visibilityPrefs`, `projectStorage`). Usable from the browser bundle and, where relevant, from the Node plugin. |
| **Node-only dev API** | `src/*.ts` with `node:` imports + `vite.config.ts` | Filesystem scan, archive cache, watchers, `/api/*` handlers, origin guard. Hosted only by the Vite plugin — never shipped to the browser. |

### Hard rule: no Node imports under `src/ui/`

Files under `src/ui/` **must not** import `node:*` builtins or any Node-only
tier module (`devApi`, `workspace`, `fsSafe`, `archiveCache`, `flowtronWatch`,
`watchSet`, `originGuard`, `apiResponse`). They import shared pure modules via
`../…` and sibling UI modules via `./…` only.

This is a **convention held by the import graph today**, not yet an eslint
`no-restricted-imports` rule. Audits and reviews treat a violation as a
boundary break even without a linter hit.

### Dependency direction

```text
src/ui/*          →  shared pure (../parser, ../tasknote, …)
                     ✗ never → Node-only

Node-only         →  shared pure (./tasknote-parse, ./sseChange, …)
                     ✗ never → src/ui/*

shared pure       →  other shared pure only
                     ✗ never → Node-only or src/ui/*
```

`sseChange.ts` is the canonical shared example: its header states it stays
Node-free so the browser client and the Vite plugin share one SSE wire-format
encoder/decoder without pulling `node:path` into the bundle.

### Entrypoints

- **Browser:** `src/main.tsx` mounts `ui/App` into `#root`.
- **Node:** `vite.config.ts` registers the `flowtron-api` plugin, which wires
  `workspace` / `devApi` / `flowtronWatch` / `archiveCache` onto the dev server.

### Layout sketch

```text
viz/
  vite.config.ts          Node-only plugin host
  src/
    main.tsx              browser entry
    ui/                   Browser UI tier
    parser.ts             Shared pure (PLAN parsing)
    tasknote.ts           Shared pure (tasknote model + section helpers)
    tasknote-parse.ts     Shared pure (gray-matter frontmatter parse)
    sseChange.ts          Shared pure (SSE payload codec)
    viewMode.ts           Shared pure (localStorage view mode)
    visibilityPrefs.ts    Shared pure (localStorage visibility prefs)
    projectStorage.ts     Shared pure (localStorage active project)
    devApi.ts             Node-only (/api handlers)
    workspace.ts          Node-only (project discovery)
    fsSafe.ts             Node-only (path-safe fs helpers)
    archiveCache.ts       Node-only
    flowtronWatch.ts      Node-only
    watchSet.ts           Node-only
    originGuard.ts        Node-only
    apiResponse.ts        Node-only
```
