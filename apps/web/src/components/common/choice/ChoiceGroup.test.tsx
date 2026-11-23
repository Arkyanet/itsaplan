import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { JSDOM } from 'jsdom';
import common from '../../../../messages/en/common.json';
import { ChoiceAnswerProvider } from '@/context/choiceAnswerContext';
import type { ChoiceSpec } from '@/utils/choiceSpec';
import ChoiceGroup from './ChoiceGroup';

const globals = ['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const specs: ChoiceSpec[] = [
  {
    question: 'Retention?',
    options: [{ label: '12 months' }, { label: '90 days' }],
    multiple: false,
  },
  { question: 'Who reads?', options: [{ label: 'Members' }, { label: 'Owner' }], multiple: false },
];

let dom: JSDOM;
let root: Root;
let previous: Map<string, PropertyDescriptor | undefined>;

beforeEach(() => {
  dom = new JSDOM('<div id="root"></div>', { url: 'http://web.test/' });
  previous = new Map(globals.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of globals) {
    const value = key === 'IS_REACT_ACT_ENVIRONMENT' ? true : dom.window[key];
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  root = createRoot(document.getElementById('root')!);
});

afterEach(() => {
  act(() => root.unmount());
  dom.window.close();
  for (const key of globals) {
    const descriptor = previous.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function render(group: ChoiceSpec[], onAnswer: (answer: string) => void) {
  act(() =>
    root.render(
      <NextIntlClientProvider locale="en" messages={{ common }}>
        <ChoiceAnswerProvider onAnswer={onAnswer}>
          <ChoiceGroup specs={group} />
        </ChoiceAnswerProvider>
      </NextIntlClientProvider>,
    ),
  );
}

function clickButton(text: string) {
  const button = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.includes(text),
  );
  assert.ok(button, `no button "${text}"`);
  act(() => button.click());
}

describe('ChoiceGroup', () => {
  it('asks the questions one at a time and sends every answer from the review', async () => {
    const sent: string[] = [];
    render(specs, (answer) => void sent.push(answer));

    assert.ok(document.body.textContent?.includes('Question 1 of 2'));
    clickButton('90 days');
    assert.ok(document.body.textContent?.includes('Who reads?'));
    clickButton('Members');
    assert.ok(document.body.textContent?.includes('Review your answers'));
    assert.equal(sent.length, 0);

    await act(async () => clickButton('Send answers'));
    assert.deepEqual(sent, ['Answer to "Retention?": 90 days\nAnswer to "Who reads?": Members']);
  });

  it('sends a lone single-choice question with one click', async () => {
    const sent: string[] = [];
    render([specs[0]!], (answer) => void sent.push(answer));

    await act(async () => clickButton('12 months'));
    assert.deepEqual(sent, ['Answer to "Retention?": 12 months']);
  });
});
