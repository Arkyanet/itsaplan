import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import type { ChoiceSpec } from '@/utils/choiceSpec';
import ChoiceCardOption from './ChoiceCardOption';

export interface ChoiceDraft {
  selected: number[];
  other: string;
}

export const EMPTY_DRAFT: ChoiceDraft = { selected: [], other: '' };

// The answer a draft gives: the free text when there is some, else the chosen labels.
export function draftAnswer(spec: ChoiceSpec, draft: ChoiceDraft): string {
  if (draft.other.trim()) return draft.other.trim();
  return draft.selected.map((i) => spec.options[i]!.label).join(', ');
}

export default function ChoiceQuestion({
  spec,
  draft,
  disabled,
  onSelect,
  onOther,
}: {
  spec: ChoiceSpec;
  draft: ChoiceDraft;
  disabled: boolean;
  onSelect: (index: number) => void;
  onOther: (text: string) => void;
}) {
  const t = useTranslations('common');
  return (
    <div>
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
            selected={draft.selected.includes(index)}
            disabled={disabled}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>
      {!disabled && (
        <Input
          value={draft.other}
          onChange={(e) => onOther(e.target.value)}
          placeholder={t('choiceOther')}
          className="mt-2 h-8 text-sm"
        />
      )}
    </div>
  );
}
