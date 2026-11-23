import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ChoiceSpec } from '@/utils/choiceSpec';
import { draftAnswer, type ChoiceDraft } from './ChoiceQuestion';

// The answers of every question before they are sent, each one reopened with a click.
export default function ChoiceReview({
  specs,
  drafts,
  disabled,
  onEdit,
}: {
  specs: ChoiceSpec[];
  drafts: ChoiceDraft[];
  disabled: boolean;
  onEdit: (step: number) => void;
}) {
  const t = useTranslations('common');
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{t('choiceReview')}</p>
      <ol className="flex flex-col gap-1.5">
        {specs.map((spec, index) => {
          const answer = draftAnswer(spec, drafts[index]!);
          return (
            <li key={index}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onEdit(index)}
                className="group flex w-full items-start gap-2.5 rounded-md border border-border px-2.5 py-2 text-start transition-colors enabled:hover:bg-accent"
              >
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded border border-border text-xs text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">{spec.question}</span>
                  <span className="block text-sm font-medium text-foreground">
                    {answer || t('choiceUnanswered')}
                  </span>
                </span>
                {!disabled && (
                  <Pencil className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
