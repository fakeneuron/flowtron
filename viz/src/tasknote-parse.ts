import matter from 'gray-matter';
import {
  countChecklist,
  extractSection,
  extractStarterSubsections,
  parseFrontmatter,
  type Tasknote,
} from './tasknote';

// gray-matter's built-in `javascript` engine parses `---js` frontmatter via eval().
// Overriding it here closes that code-execution path; `js` resolves to this same
// key through gray-matter's engine-name aliasing.
const DISABLED_JS_ENGINE = () => {
  throw new Error('gray-matter: javascript frontmatter engine is disabled');
};

export function parseTasknote(id: string, path: string, text: string): Tasknote {
  const parsed = matter(text, { engines: { javascript: DISABLED_JS_ENGINE } });
  const body = parsed.content.trimStart();
  const subtasks = extractSection(body, 'Subtasks');
  const phases = [1, 2, 3, 4].map((n) => countChecklist(extractSection(body, `Phase ${n}`)));
  const starterContext = extractSection(body, 'Starter context');
  return {
    id,
    path,
    frontmatter: parseFrontmatter(parsed.data),
    body,
    goal: extractSection(body, 'Goal'),
    acceptance: extractSection(body, 'Acceptance'),
    subtasks,
    starterContext,
    starterSubsections: extractStarterSubsections(starterContext),
    subtasksProgress: countChecklist(subtasks),
    phases,
  };
}
