import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChoiceOption } from '@/utils/choiceSpec';

export default function ChoiceCardOption({
  index,
  option,
  selected,
  disabled,
  onSelect,
}: {
  index: number;
  option: ChoiceOption;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-start transition-colors',
        selected ? 'border-brand bg-brand-soft' : 'border-border',
        disabled ? 'cursor-default' : 'hover:bg-accent',
      )}
    >
      <span
        className={cn(
          'mt-px flex size-5 shrink-0 items-center justify-center rounded border text-xs tabular-nums',
          selected
            ? 'border-brand bg-brand text-primary-foreground'
            : 'border-border text-muted-foreground',
        )}
      >
        {selected ? <Check className="size-3" /> : index + 1}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{option.label}</span>
        {option.description && (
          <span className="block text-xs text-muted-foreground">{option.description}</span>
        )}
      </span>
    </button>
  );
}
