import assert from 'node:assert/strict';
import { describe, it as test } from 'node:test';
import { markdownSegments } from '@/lib/markdown';
import { parseChoiceSpec, splitChoiceBlocks } from './choiceSpec';

describe('parseChoiceSpec', () => {
  test('reads options given as strings or objects', () => {
    assert.deepEqual(
      parseChoiceSpec(
        '{"question":"Which one?","options":["A",{"label":"B","description":"Second"}]}',
      ),
      {
        question: 'Which one?',
        options: [{ label: 'A' }, { label: 'B', description: 'Second' }],
        multiple: false,
      },
    );
  });

  test('refuses a question with fewer than two options', () => {
    assert.equal(parseChoiceSpec('{"question":"Q","options":["A"]}'), null);
    assert.equal(parseChoiceSpec('not json'), null);
  });
});

describe('splitChoiceBlocks', () => {
  test('takes the choice blocks out of a comment and keeps the rest', () => {
    const body =
      'Before\n\n```choix\n{"question":"Q?","options":["A","B"],"multiple":true}\n```\n\nAfter';
    const { text, choices } = splitChoiceBlocks(body);
    assert.equal(text, 'Before\n\n\n\nAfter');
    assert.equal(choices.length, 1);
    assert.equal(choices[0]!.multiple, true);
  });

  test('leaves other code blocks alone', () => {
    const body = '```ts\nconst a = 1;\n```';
    assert.deepEqual(splitChoiceBlocks(body), { text: body, choices: [] });
  });
});

describe('markdownSegments', () => {
  test('turns a choice fence into a choice segment', () => {
    const segments = markdownSegments(
      'Pick:\n```choice\n{"question":"Q?","options":["A","B"]}\n```',
    );
    assert.deepEqual(
      segments.map((s) => s.kind),
      ['markdown', 'choice'],
    );
  });

  test('holds the place of a choice fence still streaming in', () => {
    const segments = markdownSegments('Pick:\n```choice\n{"question":"Q?"');
    assert.deepEqual(
      segments.map((s) => s.kind),
      ['markdown', 'pending'],
    );
  });
});
