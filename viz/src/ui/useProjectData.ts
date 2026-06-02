import { useCallback, useEffect, useRef, useState } from 'react';
import { parsePlan, type Task } from '../parser';
import { type Tasknote } from '../tasknote';

export function useProjectData(activeProject: string | null): {
  tasks: Task[];
  tasknotesById: Map<string, Tasknote>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  reset: () => void;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasknotesById, setTasknotesById] = useState<Map<string, Tasknote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeProjectRef = useRef<string | null>(null);
  activeProjectRef.current = activeProject;

  const load = useCallback(async (project: string, showSkeleton = true) => {
    setError(null);
    if (showSkeleton) setLoading(true);
    try {
      const q = `?project=${encodeURIComponent(project)}`;
      const [planRes, activeRes, archiveRes] = await Promise.all([
        fetch(`/api/plan${q}`),
        fetch(`/api/active${q}`),
        fetch(`/api/archive${q}`),
      ]);
      if (!planRes.ok) throw new Error(`PLAN.md fetch failed: HTTP ${planRes.status}`);
      if (!activeRes.ok) throw new Error(`Tasknote list failed: HTTP ${activeRes.status}`);
      if (!archiveRes.ok) throw new Error(`Archive list failed: HTTP ${archiveRes.status}`);
      const md = await planRes.text();
      const active = (await activeRes.json()) as Tasknote[];
      const archived = (await archiveRes.json()) as Tasknote[];
      if (activeProjectRef.current !== project) {
        return;
      }
      setTasks(parsePlan(md));
      const merged = new Map<string, Tasknote>(archived.map((t) => [t.id, t]));
      for (const t of active) merged.set(t.id, t);
      setTasknotesById(merged);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (activeProjectRef.current === project) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    void load(activeProject);
  }, [activeProject, load]);

  const refresh = useCallback(() => {
    const current = activeProjectRef.current;
    if (current) void load(current, false);
  }, [load]);

  useEffect(() => {
    const es = new EventSource('/api/events');
    es.addEventListener('change', refresh);
    return () => es.close();
  }, [refresh]);

  const reset = useCallback(() => {
    setTasks([]);
    setTasknotesById(new Map());
    setLoading(true);
  }, []);

  return { tasks, tasknotesById, loading, error, refresh, reset };
}
