'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useChoiceAnswer } from '@/context/choiceAnswerContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChoiceSpec } from '@/utils/choiceSpec';
import ChoiceQuestion, { draftAnswer, EMPTY_DRAFT, type ChoiceDraft } from './ChoiceQuestion';
import ChoiceReview from './ChoiceReview';

// The multiple-choice questions of one agent message. Several questions are asked one
// at a time and end on a review of the answers, sent together as one message. A lone
// single-choice question is answered with one click.
export default function ChoiceGroup({ specs }: { specs: ChoiceSpec[] }) {
  const t = useTranslations('common');
  const onAnswer = useChoiceAnswer();
  const [drafts, setDrafts] = useState<ChoiceDraft[]>(() => specs.map(() => EMPTY_DRAFT));
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const locked = !onAnswer || sent;
  const single = specs.length === 1;
  const reviewStep = specs.length;
  const answered = specs.map((spec, i) => draftAnswer(spec, drafts[i]!) !== '');

  async function send(current: ChoiceDraft[]) {
    if (!onAnswer) return;
    setSent(true);
    const message = specs
      .map((spec, i) =>
        t('choiceAnswer', { question: spec.question, answer: draftAnswer(spec, current[i]!) }),
      )
      .join('\n');
    try {
      await onAnswer(message);
    } catch {
      setSent(false);
    }
  }

  function update(index: number, draft: ChoiceDraft) {
    const next = drafts.map((d, i) => (i === index ? draft : d));
    setDrafts(next);
    return next;
  }

  function select(index: number, option: number) {
    const spec = specs[index]!;
    if (spec.multiple) {
      const { selected } = drafts[index]!;
      update(index, {
        selected: selected.includes(option)
          ? selected.filter((i) => i !== option)
          : [...selected, option],
        other: '',
      });
      return;
    }
    const next = update(index, { selected: [option], other: '' });
    if (single) void send(next);
    else setStep(index + 1);
  }

  if (!onAnswer && !sent) {
    return (
      <div
        className="my-3 flex flex-col gap-4 rounded-lg border border-border bg-card p-3"
        dir="auto"
      >
        {specs.map((spec, index) => (
          <ChoiceQuestion
            key={index}
            spec={spec}
            draft={EMPTY_DRAFT}
            disabled
            onSelect={() => {}}
            onOther={() => {}}
          />
        ))}
      </div>
    );
  }

  const onReview = !single && (step === reviewStep || sent);

  return (
    <div className="my-3 rounded-lg border border-border bg-card p-3" dir="auto">
      {!single && !sent && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {step < reviewStep
              ? t('choiceStep', { current: step + 1, total: specs.length })
              : t('choiceReview')}
          </span>
          <span className="flex flex-1 gap-1">
            {specs.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t('choiceStep', { current: i + 1, total: specs.length })}
                onClick={() => setStep(i)}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i === step ? 'bg-brand' : answered[i] ? 'bg-foreground/30' : 'bg-border',
                )}
              />
            ))}
          </span>
        </div>
      )}

      {onReview ? (
        <ChoiceReview specs={specs} drafts={drafts} disabled={locked} onEdit={setStep} />
      ) : (
        <ChoiceQuestion
          spec={specs[step]!}
          draft={drafts[step]!}
          disabled={locked}
          onSelect={(option) => select(step, option)}
          onOther={(text) => update(step, { selected: [], other: text })}
        />
      )}

      {!locked && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {!single && step > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="rtl:-scale-x-100" />
              {t('choicePrevious')}
            </Button>
          ) : (
            <span />
          )}
          {single && (
            <Button
              type="button"
              size="sm"
              disabled={!answered[0]}
              onClick={() => void send(drafts)}
            >
              {t('choiceSend')}
            </Button>
          )}
          {!single && step < reviewStep && (
            <Button
              type="button"
              size="sm"
              variant={step === reviewStep - 1 ? 'default' : 'outline'}
              disabled={!answered[step]}
              onClick={() => setStep(step + 1)}
            >
              {step === reviewStep - 1 ? t('choiceToReview') : t('choiceNext')}
              <ChevronRight className="rtl:-scale-x-100" />
            </Button>
          )}
          {!single && step === reviewStep && (
            <Button
              type="button"
              size="sm"
              disabled={answered.some((a) => !a)}
              onClick={() => void send(drafts)}
            >
              {t('choiceSendAll')}
            </Button>
          )}
        </div>
      )}

      {sent && <p className="mt-2 text-xs text-muted-foreground">{t('choiceSent')}</p>}
    </div>
  );
}
