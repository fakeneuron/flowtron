import { readdir, realpath } from 'node:fs/promises';
import { sep } from 'node:path';
import type { Dirent } from 'node:fs';

export async function safeReaddir(dir: string): Promise<Dirent[]> {
  try {
    return (await readdir(dir, { withFileTypes: true })) as Dirent[];
  } catch {
    return [];
  }
}

// Resolve `path` through symlinks. Null when it does not resolve (missing,
// broken link, unreadable) — the caller drops the row rather than throwing,
// matching safeReaddir's tolerance.
export async function safeRealpath(path: string): Promise<string | null> {
  try {
    return await realpath(path);
  } catch {
    return null;
  }
}

// Resolve `path` and return it only when it stays inside `realBase` — which
// must already be resolved (via safeRealpath), because containment is checked
// against a project's *resolved* root, never its workspace-relative one.
// Adopter roots under ~/code are routinely symlinks into other trees
// (CORE-222), so the root is resolved first and kept; what must not escape is
// everything below it. Null on an unresolvable path or an escape.
export async function realpathWithin(
  realBase: string,
  path: string,
): Promise<string | null> {
  const resolved = await safeRealpath(path);
  if (resolved === null) return null;
  if (resolved !== realBase && !resolved.startsWith(realBase + sep)) return null;
  return resolved;
}
