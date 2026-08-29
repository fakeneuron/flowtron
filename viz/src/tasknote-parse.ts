import matter from 'gray-matter';
import { CORE_SCHEMA, load as loadYaml } from 'js-yaml';
import {
  closureDrift,
  countChecklist,
  extractArchivedDate,
  extractSection,
  extractStarterSubsections,
  parseFrontmatter,
  type Tasknote,
} from './tasknote.ts';

// gray-matter's built-in `javascript` engine parses `---js` frontmatter via eval().
// Overriding it here closes that code-execution path; `js` resolves to this same
// key through gray-matter's engine-name aliasing.
const DISABLED_JS_ENGINE = () => {
  throw new Error('gray-matter: javascript frontmatter engine is disabled');
};

// gray-matter's default YAML engine is js-yaml 3.x `safeLoad` (DEFAULT_SAFE_SCHEMA),
// which registers `!!omap`. That resolver is O(n²) on 3.15.0 (GHSA-5p4m-2wfm-xmqj,
// sibling of CVE-2026-59870). CORE_SCHEMA does not include the tag, so a crafted
// omap is an unknown-tag throw — the same catch-and-skip path as malformed YAML.
// `yml` aliases onto this same `yaml` key via gray-matter's engine-name aliasing.
function parseYamlFrontmatter(input: string): object {
  const data = loadYaml(input, { schema: CORE_SCHEMA });
  if (data === undefined || data === null) return {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('gray-matter: YAML frontmatter must be a mapping');
  }
  return data;
}

export function parseTasknote(id: string, path: string, text: string): Tasknote {
  const parsed = matter(text, {
    engines: { javascript: DISABLED_JS_ENGINE, yaml: parseYamlFrontmatter },
  });
  const body = parsed.content.trimStart();
  const subtasks = extractSection(body, 'Subtasks');
  const acceptance = extractSection(body, 'Acceptance');
  const phases = [1, 2, 3, 4].map((n) => countChecklist(extractSection(body, `Phase ${n}`)));
  const starterContext = extractSection(body, 'Starter context');
  return {
    id,
    path,
    frontmatter: parseFrontmatter(parsed.data),
    goal: extractSection(body, 'Goal'),
    acceptance,
    subtasks,
    starterContext,
    starterSubsections: extractStarterSubsections(starterContext),
    subtasksProgress: countChecklist(subtasks),
    phases,
    closureDrift: closureDrift(acceptance, extractArchivedDate(body)),
  };
}
