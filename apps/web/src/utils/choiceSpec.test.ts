import { describe, expect, test } from 'bun:test';
import { markdownSegments } from '@/lib/markdown';
import { parseChoiceSpec, splitChoiceBlocks } from './choiceSpec';

describe('parseChoiceSpec', () => {
  test('reads options given as strings or objects', () => {
    expect(
      parseChoiceSpec(
        '{"question":"Which one?","options":["A",{"label":"B","description":"Second"}]}',
      ),
    ).toEqual({
      question: 'Which one?',
      options: [{ label: 'A' }, { label: 'B', description: 'Second' }],
      multiple: false,
    });
  });

  test('refuses a question with fewer than two options', () => {
    expect(parseChoiceSpec('{"question":"Q","options":["A"]}')).toBeNull();
    expect(parseChoiceSpec('not json')).toBeNull();
  });
});

describe('splitChoiceBlocks', () => {
  test('takes the choice blocks out of a comment and keeps the rest', () => {
    const body =
      'Before\n\n```choix\n{"question":"Q?","options":["A","B"],"multiple":true}\n```\n\nAfter';
    const { text, choices } = splitChoiceBlocks(body);
    expect(text).toBe('Before\n\n\n\nAfter');
    expect(choices).toHaveLength(1);
    expect(choices[0]!.multiple).toBe(true);
  });

  test('leaves other code blocks alone', () => {
    const body = '```ts\nconst a = 1;\n```';
    expect(splitChoiceBlocks(body)).toEqual({ text: body, choices: [] });
  });
});

describe('markdownSegments', () => {
  test('turns a choice fence into a choice segment', () => {
    const segments = markdownSegments(
      'Pick:\n```choice\n{"question":"Q?","options":["A","B"]}\n```',
    );
    expect(segments.map((s) => s.kind)).toEqual(['markdown', 'choice']);
  });

  test('holds the place of a choice fence still streaming in', () => {
    const segments = markdownSegments('Pick:\n```choice\n{"question":"Q?"');
    expect(segments.map((s) => s.kind)).toEqual(['markdown', 'pending']);
  });
});
