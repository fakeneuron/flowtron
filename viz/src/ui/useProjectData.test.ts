import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { useProjectData } from './useProjectData';

// The upgraded MockEventSource (src/test/setup.ts) records every instance and
// exposes emit(type). Reach the EventSource a hook mounted to drive its SSE
// branches. Tests clear the registry in beforeEach so `.at(-1)` is the current one.
interface MockES {
  url: string;
  emit(type: string, data?: string): void;
}
const esRegistry = () =>
  (globalThis.EventSource as unknown as { instances: MockES[] }).instances;
const latestES = () => esRegistry().at(-1)!;

const planRes = (md: string) => ({ ok: true, status: 200, text: async () => md });
const jsonRes = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const planWith = (id: string) => `## Low\n\n- [ ] **${id}** | t — desc\n`;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

beforeEach(() => {
  esRegistry().length = 0;
});

describe('useProjectData — same-project load race', () => {
  it('ignores a stale same-project load that resolves after a newer one', async () => {
    // Gate every load generation so the test controls resolution order. A new
    // generation begins on each /api/plan fetch; active/archive reuse it.
    const gates = new Map<number, Promise<void>>();
    const releases = new Map<number, () => void>();
    const planTextByGen = new Map<number, string>();
    let currentGen = 0;
    const ensureGate = (gen: number) => {
      if (gates.has(gen)) return;
      gates.set(
        gen,
        new Promise<void>((resolve) => releases.set(gen, resolve)),
      );
    };

    const fetchMock = vi.fn((url: string) => {
      if (url.startsWith('/api/plan')) {
        currentGen++;
        ensureGate(currentGen);
      }
      const gen = currentGen;
      return gates.get(gen)!.then(() => {
        if (url.startsWith('/api/plan')) return planRes(planTextByGen.get(gen) ?? '');
        return jsonRes([]);
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    planTextByGen.set(1, planWith('FE-1')); // initial mount
    planTextByGen.set(2, planWith('FE-2')); // older refresh
    planTextByGen.set(3, planWith('FE-3')); // newer refresh

    const { result } = renderHook(() => useProjectData('p1'));

    // Let the initial load (gen 1) settle.
    await act(async () => {
      releases.get(1)!();
    });
    await waitFor(() => expect(result.current.tasks[0]?.id).toBe('FE-1'));

    // Fire two same-project refreshes: gen 2 (older) then gen 3 (newer).
    act(() => {
      result.current.refresh();
      result.current.refresh();
    });

    // Newer resolves first, older resolves last — the classic overwrite race.
    await act(async () => {
      releases.get(3)!();
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => expect(result.current.tasks[0]?.id).toBe('FE-3'));

    await act(async () => {
      releases.get(2)!();
      await new Promise((r) => setTimeout(r, 0));
    });

    // The stale gen-2 response must NOT overwrite the newer gen-3 data.
    expect(result.current.tasks[0]?.id).toBe('FE-3');
  });
});

describe('useProjectData — SSE branches', () => {
  let currentPlan: string;

  const mountWithLivePlan = () => {
    currentPlan = planWith('FE-1');
    const fetchMock = vi.fn((url: string) => {
      if (url.startsWith('/api/plan')) return Promise.resolve(planRes(currentPlan));
      return Promise.resolve(jsonRes([]));
    });
    vi.stubGlobal('fetch', fetchMock);
    const hook = renderHook(() => useProjectData('p1'));
    return { hook, fetchMock };
  };

  it('refreshes on a "change" event', async () => {
    const { hook } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    currentPlan = planWith('FE-2');
    await act(async () => {
      latestES().emit('change');
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-2'));
  });

  it('refreshes on an unattributed {} payload', async () => {
    const { hook } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    currentPlan = planWith('FE-2');
    await act(async () => {
      latestES().emit('change', '{}');
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-2'));
  });

  it('reconciles on reconnect: "error" then "open" triggers a refresh', async () => {
    const { hook } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    currentPlan = planWith('FE-2');

    // A drop alone must not refresh — it only flags droppedSinceOpen.
    await act(async () => {
      latestES().emit('error');
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(hook.result.current.tasks[0]?.id).toBe('FE-1');

    // The following reconnect reconciles the change missed during the gap.
    await act(async () => {
      latestES().emit('open');
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-2'));
  });

  it('does not refresh on the first "open" (no prior drop)', async () => {
    const { hook, fetchMock } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    const callsAfterLoad = fetchMock.mock.calls.length;
    currentPlan = planWith('FE-2');

    await act(async () => {
      latestES().emit('open');
      await new Promise((r) => setTimeout(r, 0));
    });

    // No prior drop → no redundant refresh: no new fetches, tasks unchanged.
    expect(fetchMock.mock.calls.length).toBe(callsAfterLoad);
    expect(hook.result.current.tasks[0]?.id).toBe('FE-1');
  });

  it('ignores a change attributed to a different project', async () => {
    const { hook, fetchMock } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    const callsAfterLoad = fetchMock.mock.calls.length;
    currentPlan = planWith('FE-2');

    await act(async () => {
      latestES().emit('change', '{"project":"other"}');
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(fetchMock.mock.calls.length).toBe(callsAfterLoad);
    expect(hook.result.current.tasks[0]?.id).toBe('FE-1');
  });

  it('refreshes on a change attributed to the active project', async () => {
    const { hook } = mountWithLivePlan();
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-1'));

    currentPlan = planWith('FE-2');
    await act(async () => {
      latestES().emit('change', '{"project":"p1"}');
      await new Promise((r) => setTimeout(r, 0));
    });
    await waitFor(() => expect(hook.result.current.tasks[0]?.id).toBe('FE-2'));
  });
});
