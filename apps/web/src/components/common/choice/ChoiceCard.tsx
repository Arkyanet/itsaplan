'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useChoiceAnswer } from '@/context/choiceAnswerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChoiceSpec } from '@/utils/choiceSpec';
import ChoiceCardOption from './ChoiceCardOption';

// A multiple-choice question from an agent. One click answers a single-choice
// question; a multiple-choice one is sent with the button. "Other" sends free text.
export default function ChoiceCard({ spec }: { spec: ChoiceSpec }) {
  const t = useTranslations('common');
  const onAnswer = useChoiceAnswer();
  const [selected, setSelected] = useState<number[]>([]);
  const [other, setOther] = useState('');
  const [sent, setSent] = useState(false);
  const locked = !onAnswer || sent;

  async function answer(text: string) {
    if (!onAnswer || !text.trim()) return;
    setSent(true);
    try {
      await onAnswer(t('choiceAnswer', { question: spec.question, answer: text.trim() }));
    } catch {
      setSent(false);
    }
  }

  function select(index: number) {
    if (!spec.multiple) {
      setSelected([index]);
      void answer(spec.options[index]!.label);
      return;
    }
    setSelected((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  }

  const chosenLabels = selected.map((i) => spec.options[i]!.label).join(', ');

  return (
    <div className="my-3 rounded-lg border border-border bg-card p-3" dir="auto">
      <p className="mb-2.5 flex items-start gap-2 text-sm font-medium text-foreground">
        <CircleHelp className="mt-0.5 size-4 shrink-0 text-brand" />
        {spec.question}
      </p>
      <div className="flex flex-col gap-1.5">
        {spec.options.map((option, index) => (
          <ChoiceCardOption
            key={index}
            index={index}
            option={option}
            selected={selected.includes(index)}
            disabled={locked}
            onSelect={() => select(index)}
          />
        ))}
      </div>
      {!locked && (
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void answer(other);
          }}
        >
          <Input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder={t('choiceOther')}
            className="h-8 text-sm"
          />
          {other.trim() ? (
            <Button type="submit" size="sm">
              {t('choiceSend')}
            </Button>
          ) : (
            spec.multiple && (
              <Button
                type="button"
                size="sm"
                disabled={selected.length === 0}
                onClick={() => void answer(chosenLabels)}
              >
                {t('choiceSend')}
              </Button>
            )
          )}
        </form>
      )}
      {sent && <p className="mt-2 text-xs text-muted-foreground">{t('choiceSent')}</p>}
    </div>
  );
}
