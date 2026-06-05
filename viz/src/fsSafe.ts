import { readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';

export async function safeReaddir(dir: string): Promise<Dirent[]> {
  try {
    return (await readdir(dir, { withFileTypes: true })) as Dirent[];
  } catch {
    return [];
  }
}
