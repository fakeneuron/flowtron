# Versioning

> Lazy-loaded SPEC module. Loaded by `/task` only for explicit version-bump tasks. See `SPEC.md` for the always-loaded core spec.

Flowtron uses semver tags. Each tagged release is consumable by adopting
projects via submodule checkout.

- **Patch** (`v1.2.0` → `v1.2.1`) — clarifications, doc fixes, no project-side
  changes needed.
- **Minor** (`v1.2.x` → `v1.3.0`) — additive features (new optional fields,
  new template sections). Adopting projects can ignore the new features and
  continue working.
- **Major** (`v1.x.y` → `v2.0.0`) — breaking change. The bump task's tasknote
  and the annotated tag message list explicit migration steps. Adopting
  projects must follow them when bumping.

Each adopting project's `_project/tasknote/README.md` records the
currently-pinned flowtron version. Bumping is a project-side task (e.g.,
`CORE-XYZ: Bump flowtron to vX.Y.Z`) that runs the migration steps from the
bump's annotated tag message (`git show vX.Y.Z` in the flowtron submodule)
and commits the new submodule SHA.
