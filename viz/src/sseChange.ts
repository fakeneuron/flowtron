// Wire format for SSE `change` events. Node-free so the client and the
// vite plugin share one encoder/decoder without pulling `watchSet`'s
// `node:path` into the browser bundle.

export function formatChangePayload(project: string | undefined): string {
  return JSON.stringify(project ? { project } : {});
}

// `null` means unattributed — the client fail-opens and refreshes.
export function projectFromChangeData(data: unknown): string | null {
  if (typeof data !== 'string' || data.length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(data);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const project = (parsed as { project?: unknown }).project;
    return typeof project === 'string' && project.length > 0 ? project : null;
  } catch {
    return null;
  }
}
