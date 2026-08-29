import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  parsePlanWithDiagnostics,
  type Task,
  type UnparsedLine,
  type NearMissHeading,
} from '../parser';
import { type Tasknote } from '../tasknote';
import { ALL_CHANGE_SCOPES, parseChangeData, type ChangeScope } from '../sseChange';

// Cadence for both halves of the degraded mode: how often the board re-polls
// while live updates are down, and how often a CLOSED stream is retried.
export const LIVE_RECOVERY_MS = 5000;

type ScopeSeqs = Record<ChangeScope, number>;

export function useProjectData(activeProject: string | null): {
  tasks: Task[];
  unparsed: UnparsedLine[];
  nearMissHeadings: NearMissHeading[];
  tasknotesById: Map<string, Tasknote>;
  loading: boolean;
  error: string | null;
  liveDisconnected: boolean;
  refresh: (scopes?: readonly ChangeScope[]) => void;
  reset: () => void;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unparsed, setUnparsed] = useState<UnparsedLine[]>([]);
  const [nearMissHeadings, setNearMissHeadings] = useState<NearMissHeading[]>([]);
  // Held as two slices rather than one merged map so a scope-targeted refetch
  // can replace just its own half. A merged map updated in place could not
  // express deletion: a tasknote that vanished from /api/active would linger
  // forever, since only a full rebuild of that slice can drop it.
  const [activeById, setActiveById] = useState<Map<string, Tasknote>>(new Map());
  const [archivedById, setArchivedById] = useState<Map<string, Tasknote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveDisconnected, setLiveDisconnected] = useState(false);
  const activeProjectRef = useRef<string | null>(null);
  activeProjectRef.current = activeProject;
  // Monotonic load counters, one per scope: two rapid refreshes on the same
  // project each fire a load, and the older response can resolve last. The
  // activeProjectRef guard can't catch that (same project), so a stale response
  // would overwrite fresh data. Each load stamps a seq per scope it requested
  // and commits a slice only while that slice's seq is still the latest.
  //
  // Per-scope rather than one counter (FE-072 had one) because loads are no
  // longer complete: a narrow `archive` load starting after a broad one must
  // not invalidate the broad one's still-unresolved `active` half.
  const loadSeqRef = useRef<ScopeSeqs>({ plan: 0, active: 0, archive: 0 });

  const load = useCallback(
    async (
      project: string,
      showSkeleton = true,
      scopes: readonly ChangeScope[] = ALL_CHANGE_SCOPES,
    ) => {
      const want = new Set(scopes);
      if (want.size === 0) return;
      const seqs = {} as ScopeSeqs;
      for (const scope of want) seqs[scope] = ++loadSeqRef.current[scope];
      // A slice is still ours to commit while nothing newer has been stamped
      // for it. `some` for the shared error/loading writes: the load is stale
      // only once every scope it asked for has been superseded.
      const stillLatest = (scope: ChangeScope) => loadSeqRef.current[scope] === seqs[scope];
      const anyStillLatest = () => [...want].some(stillLatest);
      setError(null);
      if (showSkeleton) setLoading(true);
      try {
        const q = `?project=${encodeURIComponent(project)}`;
        // `plan` owns both PLAN.md and its rotated sibling. PLAN-ARCHIVE.md is
        // deliberately unwatched (FE-094): rotation always edits PLAN.md in the
        // same motion, so the planPath event is the only signal that rotated
        // history moved, and splitting these two apart would strand it.
        const [planRes, planArchiveRes, activeRes, archiveRes] = await Promise.all([
          want.has('plan') ? fetch(`/api/plan${q}`) : undefined,
          want.has('plan') ? fetch(`/api/plan-archive${q}`) : undefined,
          want.has('active') ? fetch(`/api/active${q}`) : undefined,
          want.has('archive') ? fetch(`/api/archive${q}`) : undefined,
        ]);
        if (planRes && !planRes.ok) throw new Error(`PLAN.md fetch failed: HTTP ${planRes.status}`);
        if (activeRes && !activeRes.ok) {
          throw new Error(`Tasknote list failed: HTTP ${activeRes.status}`);
        }
        if (archiveRes && !archiveRes.ok) {
          throw new Error(`Archive list failed: HTTP ${archiveRes.status}`);
        }
        const md = planRes ? await planRes.text() : null;
        // Rotated `## Completed` history. Unlike the three above this one never
        // throws: the endpoint already answers an absent archive with an empty
        // body, and a board that PLAN.md alone can render must not be taken down
        // by supplementary history.
        const archiveMd = planArchiveRes?.ok ? await planArchiveRes.text() : '';
        const active = activeRes ? ((await activeRes.json()) as Tasknote[]) : null;
        const archived = archiveRes ? ((await archiveRes.json()) as Tasknote[]) : null;
        if (activeProjectRef.current !== project) return;
        if (md !== null && stillLatest('plan')) {
          const parsed = parsePlanWithDiagnostics(md, archiveMd);
          setTasks(parsed.tasks);
          setUnparsed(parsed.unparsed);
          setNearMissHeadings(parsed.nearMissHeadings);
        }
        if (active !== null && stillLatest('active')) {
          setActiveById(new Map(active.map((t) => [t.id, t])));
        }
        if (archived !== null && stillLatest('archive')) {
          setArchivedById(new Map(archived.map((t) => [t.id, t])));
        }
      } catch (e) {
        if (anyStillLatest()) setError((e as Error).message);
      } finally {
        // Only the load that raised the skeleton lowers it. A scoped refresh can
        // now outrun an in-flight initial load, and clearing the flag from there
        // would flash an empty board before the first full load commits.
        if (showSkeleton && activeProjectRef.current === project && anyStillLatest()) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!activeProject) return;
    void load(activeProject);
  }, [activeProject, load]);

  // Omitting `scopes` refetches everything — the fail-open default every caller
  // but the attributed-change handler wants.
  const refresh = useCallback(
    (scopes?: readonly ChangeScope[]) => {
      const current = activeProjectRef.current;
      if (current) void load(current, false, scopes);
    },
    [load],
  );

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
      const { project, scopes } = parseChangeData(data);
      if (project !== null && project !== activeProjectRef.current) return;
      // `scopes === null` is unscoped — an unattributed payload, an older
      // server, or a scope value this client does not know. Refetch everything.
      refresh(scopes ?? undefined);
    };

    const onOpen = () => {
      stopRecovery();
      setLiveDisconnected(false);
      // On reconnect after a drop, reconcile changes missed during the gap.
      // The first connect has no prior drop, so no redundant initial refresh.
      // Deliberately unscoped: what fired during the gap is unknowable (FE-064).
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
        // Poll fallback: the board keeps moving on either failure shape. Stays
        // unscoped — this fires precisely when the stream is down, so there is
        // no event to scope it by (FE-088.3).
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
    setActiveById(new Map());
    setArchivedById(new Map());
    setLoading(true);
  }, []);

  // Active wins on an id present in both — a tasknote mid-archive-move is
  // briefly in each slice, and the active copy is the live one.
  const tasknotesById = useMemo(() => {
    const merged = new Map(archivedById);
    for (const [id, t] of activeById) merged.set(id, t);
    return merged;
  }, [activeById, archivedById]);

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
