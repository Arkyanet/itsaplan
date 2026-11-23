// A multiple-choice question an agent asks in its answer or in a comment, as one fenced
// block tagged `choice` (or `choix`, `question`) holding JSON:
//
//   ```choice
//   {"question": "Which database?", "options": [{"label": "PostgreSQL", "description": "…"}, "SQLite"], "multiple": false}
//   ```
//
// The block is drawn as a card the reader answers with one click.

export interface ChoiceOption {
  label: string;
  description?: string;
}

export interface ChoiceSpec {
  question: string;
  options: ChoiceOption[];
  multiple: boolean;
}

export const CHOICE_TAGS: readonly string[] = ['choice', 'choix', 'question'];

const MAX_OPTIONS = 8;

function optionFrom(value: unknown): ChoiceOption | null {
  if (typeof value === 'string') return value.trim() ? { label: value.trim().slice(0, 120) } : null;
  if (typeof value !== 'object' || value === null) return null;
  const { label, description } = value as Record<string, unknown>;
  if (typeof label !== 'string' || !label.trim()) return null;
  return {
    label: label.trim().slice(0, 120),
    ...(typeof description === 'string' && description.trim()
      ? { description: description.trim().slice(0, 300) }
      : {}),
  };
}

export function parseChoiceSpec(text: string): ChoiceSpec | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end < start) return null;
  let value: unknown;
  try {
    value = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const { question, options, multiple } = value as Record<string, unknown>;
  if (typeof question !== 'string' || !question.trim() || !Array.isArray(options)) return null;
  const parsed = options.map(optionFrom).filter((o): o is ChoiceOption => o !== null);
  if (parsed.length < 2 || parsed.length > MAX_OPTIONS) return null;
  return { question: question.trim().slice(0, 500), options: parsed, multiple: multiple === true };
}

// The text of a comment without its choice blocks, and the questions they hold. A block
// that does not parse stays in the text as the code block it is.
export function splitChoiceBlocks(body: string): { text: string; choices: ChoiceSpec[] } {
  const choices: ChoiceSpec[] = [];
  const text = body.replace(
    /^(`{3,}|~{3,})[ \t]*([a-zA-Z]+)[^\n]*\n([\s\S]*?)\n\1[ \t]*$/gm,
    (block, _m, tag: string, inner: string) => {
      if (!CHOICE_TAGS.includes(tag.toLowerCase())) return block;
      const spec = parseChoiceSpec(inner);
      if (!spec) return block;
      choices.push(spec);
      return '';
    },
  );
  return { text: text.trim(), choices };
}
