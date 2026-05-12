import { readdir, readFile } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { parseTasknote } from './tasknote-parse';
import type { Tasknote } from './tasknote';
import type { ProjectDescriptor } from './workspace';

async function safeReaddir(dir: string): Promise<Dirent[]> {
  try {
    return (await readdir(dir, { withFileTypes: true })) as Dirent[];
  } catch {
    return [];
  }
}

async function readArchive(project: ProjectDescriptor): Promise<Tasknote[]> {
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
          try {
            const text = await readFile(path, 'utf8');
            return parseTasknote(id, path, text);
          } catch (err) {
            console.error(
              `[archiveCache] failed to read/parse ${path}: ${(err as Error).message}`,
            );
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
    clear() {
      cache.clear();
    },
  };
}
