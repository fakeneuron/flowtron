import { useCallback, useEffect, useState } from 'react';
import { readStoredProject, writeStoredProject } from '../projectStorage';

export function useProjects(): {
  projects: string[];
  activeProject: string | null;
  setActiveProject: (name: string | null) => void;
  initialLoading: boolean;
  error: string | null;
} {
  const [projects, setProjects] = useState<string[]>([]);
  const [activeProject, setActiveProjectState] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error(`Project list failed: HTTP ${res.status}`);
        const list = (await res.json()) as Array<{ name: string }>;
        if (cancelled) return;
        const names = list.map((p) => p.name);
        setProjects(names);
        const stored = readStoredProject();
        const initial = stored && names.includes(stored) ? stored : (names[0] ?? null);
        setActiveProjectState(initial);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveProject = useCallback((name: string | null) => {
    setActiveProjectState(name);
    if (name) writeStoredProject(name);
  }, []);

  return { projects, activeProject, setActiveProject, initialLoading, error };
}
