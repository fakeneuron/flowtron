import { useCallback, useEffect, useRef, useState } from 'react';
import {
  parsePlanWithDiagnostics,
  type Task,
  type UnparsedLine,
  type NearMissHeading,
} from '../parser';
import { type Tasknote } from '../tasknote';

export function useProjectData(activeProject: string | null): {
  tasks: Task[];
  unparsed: UnparsedLine[];
  nearMissHeadings: NearMissHeading[];
  tasknotesById: Map<string, Tasknote>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  reset: () => void;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unparsed, setUnparsed] = useState<UnparsedLine[]>([]);
  const [nearMissHeadings, setNearMissHeadings] = useState<NearMissHeading[]>([]);
  const [tasknotesById, setTasknotesById] = useState<Map<string, Tasknote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeProjectRef = useRef<string | null>(null);
  activeProjectRef.current = activeProject;
  // Monotonic load counter: two rapid refreshes on the same project each fire a
  // load, and the older response can resolve last. The activeProjectRef guard
  // can't catch that (same project), so a stale response would overwrite fresh
  // data. Each load stamps a seq and only commits when it's still the latest.
  const loadSeqRef = useRef(0);

  const load = useCallback(async (project: string, showSkeleton = true) => {
    const seq = ++loadSeqRef.current;
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
      if (activeProjectRef.current !== project || loadSeqRef.current !== seq) {
        return;
      }
      const parsed = parsePlanWithDiagnostics(md);
      setTasks(parsed.tasks);
      setUnparsed(parsed.unparsed);
      setNearMissHeadings(parsed.nearMissHeadings);
      const merged = new Map<string, Tasknote>(archived.map((t) => [t.id, t]));
      for (const t of active) merged.set(t.id, t);
      setTasknotesById(merged);
    } catch (e) {
      if (loadSeqRef.current === seq) setError((e as Error).message);
    } finally {
      if (activeProjectRef.current === project && loadSeqRef.current === seq) setLoading(false);
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
    let droppedSinceOpen = false;
    es.addEventListener('change', refresh);
    es.addEventListener('open', () => {
      // On reconnect after a drop, reconcile changes missed during the gap.
      // The first connect has no prior drop, so no redundant initial refresh.
      if (droppedSinceOpen) {
        droppedSinceOpen = false;
        refresh();
      }
    });
    es.addEventListener('error', () => {
      // Connection dropped; the browser auto-reconnects. Flag so the next
      // 'open' reconciles any changes missed while disconnected, rather than
      // letting the board go silently stale.
      droppedSinceOpen = true;
    });
    return () => es.close();
  }, [refresh]);

  const reset = useCallback(() => {
    setTasks([]);
    setUnparsed([]);
    setNearMissHeadings([]);
    setTasknotesById(new Map());
    setLoading(true);
  }, []);

  return { tasks, unparsed, nearMissHeadings, tasknotesById, loading, error, refresh, reset };
}
