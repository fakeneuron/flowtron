import matter from 'gray-matter';
import {
  countChecklist,
  extractSection,
  parseFrontmatter,
  type Tasknote,
} from './tasknote';

export function parseTasknote(id: string, path: string, text: string): Tasknote {
  const parsed = matter(text);
  const body = parsed.content.trimStart();
  const subtasks = extractSection(body, 'Subtasks');
  const phases = [1, 2, 3, 4].map((n) => countChecklist(extractSection(body, `Phase ${n}`)));
  return {
    id,
    path,
    frontmatter: parseFrontmatter(parsed.data),
    body,
    goal: extractSection(body, 'Goal'),
    acceptance: extractSection(body, 'Acceptance'),
    subtasks,
    starterContext: extractSection(body, 'Starter context'),
    subtasksProgress: countChecklist(subtasks),
    phases,
  };
}
