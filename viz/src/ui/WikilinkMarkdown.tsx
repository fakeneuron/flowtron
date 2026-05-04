import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WIKILINK_TEXT = /\[\[([A-Z]+(?:-EPIC)?-\d+(?:\.\d+)?)\]\]/g;
const WIKILINK_HREF_PREFIX = '#wikilink-';

// Convert `[[TASK-ID]]` outside backtick code spans into a markdown link the
// `components.a` map below renders as a clickable button. Code spans are left
// untouched so literal `[[ID]]` examples render as code.
const wikilinkifyMarkdown = (text: string): string => {
  const segments = text.split(/(`[^`]*`)/g);
  return segments
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg.replace(WIKILINK_TEXT, (_m, id) => `[[[${id}]]](${WIKILINK_HREF_PREFIX}${id})`),
    )
    .join('');
};

export const WikilinkMarkdown: React.FC<{
  markdown: string;
  navigateToTask: (id: string) => void;
}> = ({ markdown, navigateToTask }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ href, children, ...props }) => {
        if (typeof href === 'string' && href.startsWith(WIKILINK_HREF_PREFIX)) {
          const id = href.slice(WIKILINK_HREF_PREFIX.length);
          return (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigateToTask(id);
              }}
              className="font-mono text-slate-700 hover:underline"
              title={`Jump to ${id}`}
            >
              {children}
            </button>
          );
        }
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }}
  >
    {wikilinkifyMarkdown(markdown)}
  </ReactMarkdown>
);
