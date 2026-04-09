"use client";

interface MarkdownRendererProps {
  content: string;
}

// Lightweight markdown renderer without external deps
// Supports: headings, bold, italic, links, bullet lists, numbered lists, tables, code
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mb-2 mt-4 text-base font-bold text-dark dark:text-gray-100"
        >
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mb-2 mt-5 text-lg font-bold text-primary"
        >
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="mb-3 mt-5 text-xl font-bold text-primary"
        >
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(
        <hr key={i} className="my-4 border-gray-200 dark:border-gray-700" />
      );
      i++;
      continue;
    }

    // Table detection — starts with |
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`table-${i}`} rows={tableLines} />);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="mb-3 list-disc space-y-1 ps-5 text-sm text-gray-700 dark:text-gray-300"
        >
          {listItems.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="mb-3 list-decimal space-y-1 ps-5 text-sm text-gray-700 dark:text-gray-300"
        >
          {listItems.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={i}
        className="mb-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
      >
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose-sm max-w-none">{elements}</div>;
}

// Parse inline markdown: bold, italic, links, code
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(<strong key={key++} className="font-semibold text-dark dark:text-gray-100">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    // Link
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)/);
    if (linkMatch) {
      if (linkMatch[1]) parts.push(<span key={key++}>{linkMatch[1]}</span>);
      parts.push(
        <a
          key={key++}
          href={linkMatch[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-80"
        >
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>);
      parts.push(
        <code
          key={key++}
          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-primary dark:bg-dark/80"
        >
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}

function MarkdownTable({ rows }: { rows: string[] }) {
  const parseRow = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

  if (rows.length < 2) return null;

  const headers = parseRow(rows[0]);
  const dataRows = rows
    .slice(2) // skip separator row
    .filter((r) => !r.match(/^[\s|:-]+$/))
    .map(parseRow);

  return (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-dark text-white">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-start font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 0 ? "bg-white dark:bg-dark/30" : "bg-gray-50 dark:bg-dark/50"}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border-b border-gray-100 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
