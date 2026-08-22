import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseTasknote } from './tasknote-parse';
import { realpathWithin, safeReaddir, safeRealpath } from './fsSafe';
import type { Tasknote } from './tasknote';
import type { ProjectDescriptor } from './workspace';

async function readArchive(project: ProjectDescriptor): Promise<Tasknote[]> {
  // Containment base is the project root resolved through symlinks, not the
  // archive dir: if `archive/` (or `tasknote/`, or `.flowtron/`) is itself a
  // symlink, everything under its target is trivially "inside" it, so only the
  // root is a meaningful bound. Symlinked project roots stay legitimate
  // (CORE-222) — they resolve first, then nothing below may escape.
  const realRoot = await safeRealpath(project.root);
  if (realRoot === null) return [];
  const areas = (await safeReaddir(project.archiveDir)).filter((e) => e.isDirectory());
  const nested = await Promise.all(
    areas.map(async (area) => {
      const areaDir = join(project.archiveDir, area.name);
      const entries = await safeReaddir(areaDir);
      const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
      return Promise.all(
        files.map(async (e) => {
          const id = e.name.replace(/\.md$/, '');
          const path = join(areaDir, e.name);
          const realPath = await realpathWithin(realRoot, path);
          // Resolves outside the project root — drop it silently, same shape as
          // the malformed-YAML skip below. No user action is possible either way.
          if (realPath === null) return null;
          try {
            const text = await readFile(realPath, 'utf8');
            return parseTasknote(id, path, text);
          } catch {
            // Legacy archived tasknotes may have malformed YAML frontmatter (write-once policy in SPEC.md).
            // These are historical records; we must tolerate them. Failures are non-fatal (file is skipped).
            // Intentionally silent: emitting per-file warnings produces a wall of noise on every `npm run dev`
            // for anyone with old adopter checkouts (bananapeel, adppro, bidviz, etc.). No user action possible.
            return null;
          }
        }),
      );
    }),
  );
  return nested.flat().filter((t): t is Tasknote => t !== null);
}

export interface ArchiveCache {
  get(project: ProjectDescriptor): Promise<Tasknote[]>;
  invalidate(filepath: string, projects: Iterable<ProjectDescriptor>): boolean;
  invalidateProject(name: string): boolean;
  clear(): void;
}

export function createArchiveCache(): ArchiveCache {
  const cache = new Map<string, Promise<Tasknote[]>>();

  return {
    get(project) {
      let cached = cache.get(project.name);
      if (!cached) {
        cached = readArchive(project).catch((err) => {
          if (cache.get(project.name) === cached) cache.delete(project.name);
          throw err;
        });
        cache.set(project.name, cached);
      }
      return cached;
    },
    invalidate(filepath, projects) {
      for (const p of projects) {
        if (filepath.startsWith(p.archiveDir)) {
          cache.delete(p.name);
          return true;
        }
      }
      return false;
    },
    invalidateProject(name) {
      return cache.delete(name);
    },
    clear() {
      cache.clear();
    },
  };
}
