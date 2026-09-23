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

// Frontmatter is YAML only, loaded under CORE_SCHEMA. The schema registers neither
// `!!omap` (O(n²) resolver on js-yaml 3.15.0 — `GHSA-5p4m-2wfm-xmqj`, sibling
// of `CVE-2026-59870`) nor merge (`<<`, `GHSA-2883`): a crafted omap is an
// unknown-tag throw, the same catch-and-skip path as malformed YAML.
function parseYamlFrontmatter(input: string): object {
  // js-yaml 5 throws on empty input ("expected a document"); an empty block is no frontmatter.
  if (input.trim() === '') return {};
  const data = loadYaml(input, { schema: CORE_SCHEMA });
  if (data === null) return {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('frontmatter: YAML frontmatter must be a mapping');
  }
  return data;
}

// Splits a leading `---` block from the body. Only a bare `---` opens frontmatter:
// a language-tagged open (`---js`, `---yaml`) throws, which is what closes the
// eval() path gray-matter's `javascript` engine used to expose. An unclosed block
// throws too, rather than silently parsing the rest of the file as YAML.
function splitFrontmatter(text: string): { data: object; content: string } {
  const open = /^---[ \t]*\r?\n/.exec(text);
  if (!open) {
    if (/^---/.test(text)) throw new Error('frontmatter: only a bare --- opens frontmatter');
    return { data: {}, content: text };
  }
  const rest = text.slice(open[0].length);
  const close = /^---[ \t]*(?:\r?\n|$)/m.exec(rest);
  if (!close) throw new Error('frontmatter: unclosed --- block');
  const block = rest.slice(0, close.index);
  const content = rest.slice(close.index + close[0].length);
  return { data: parseYamlFrontmatter(block), content };
}

export function parseTasknote(id: string, path: string, text: string): Tasknote {
  const parsed = splitFrontmatter(text);
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
