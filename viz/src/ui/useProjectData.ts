import { useCallback, useEffect, useRef, useState } from 'react';
import {
  parsePlanWithDiagnostics,
  type Task,
  type UnparsedLine,
  type NearMissHeading,
} from '../parser';
import { type Tasknote } from '../tasknote';
import { projectFromChangeData } from '../sseChange';

// Cadence for both halves of the degraded mode: how often the board re-polls
// while live updates are down, and how often a CLOSED stream is retried.
export const LIVE_RECOVERY_MS = 5000;

export function useProjectData(activeProject: string | null): {
  tasks: Task[];
  unparsed: UnparsedLine[];
  nearMissHeadings: NearMissHeading[];
  tasknotesById: Map<string, Tasknote>;
  loading: boolean;
  error: string | null;
  liveDisconnected: boolean;
  refresh: () => void;
  reset: () => void;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unparsed, setUnparsed] = useState<UnparsedLine[]>([]);
  const [nearMissHeadings, setNearMissHeadings] = useState<NearMissHeading[]>([]);
  const [tasknotesById, setTasknotesById] = useState<Map<string, Tasknote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveDisconnected, setLiveDisconnected] = useState(false);
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
    let disposed = false;
    let es: EventSource | null = null;
    let droppedSinceOpen = false;
    let recovery: ReturnType<typeof setInterval> | null = null;

    const stopRecovery = () => {
      if (recovery === null) return;
      clearInterval(recovery);
      recovery = null;
    };

    const onChange = (ev: Event) => {
      const data = 'data' in ev ? (ev as MessageEvent).data : undefined;
      const name = projectFromChangeData(data);
      if (name !== null && name !== activeProjectRef.current) return;
      refresh();
    };

    const onOpen = () => {
      stopRecovery();
      setLiveDisconnected(false);
      // On reconnect after a drop, reconcile changes missed during the gap.
      // The first connect has no prior drop, so no redundant initial refresh.
      if (droppedSinceOpen) {
        droppedSinceOpen = false;
        refresh();
      }
    };

    const onError = () => {
      // Two failures arrive on this one listener and they are not the same.
      // A mid-stream drop leaves readyState CONNECTING and the browser retries
      // on its own. A rejected handshake — the 503 from MAX_SSE_CLIENTS, or any
      // non-`text/event-stream` response — leaves it CLOSED, and the browser
      // never retries; without recovery here that tab's board freezes forever.
      // Flag the drop for the next 'open' to reconcile (FE-064), surface the
      // state, and poll until live updates come back.
      droppedSinceOpen = true;
      setLiveDisconnected(true);
      startRecovery();
    };

    const connect = () => {
      if (disposed) return;
      es?.close();
      es = new EventSource('/api/events');
      es.addEventListener('change', onChange);
      es.addEventListener('open', onOpen);
      es.addEventListener('error', onError);
    };

    function startRecovery(): void {
      if (recovery !== null || disposed) return;
      recovery = setInterval(() => {
        // Poll fallback: the board keeps moving on either failure shape.
        refresh();
        // Recovery: only when the browser has given up. Reconnecting while it
        // is still CONNECTING would race a socket it is already retrying.
        if (es === null || es.readyState === EventSource.CLOSED) connect();
      }, LIVE_RECOVERY_MS);
    }

    connect();
    return () => {
      disposed = true;
      stopRecovery();
      es?.close();
    };
  }, [refresh]);

  const reset = useCallback(() => {
    setTasks([]);
    setUnparsed([]);
    setNearMissHeadings([]);
    setTasknotesById(new Map());
    setLoading(true);
  }, []);

  return {
    tasks,
    unparsed,
    nearMissHeadings,
    tasknotesById,
    loading,
    error,
    liveDisconnected,
    refresh,
    reset,
  };
}
