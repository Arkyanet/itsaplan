import type { ComponentProps } from 'react';
import type { Label } from '@/lib/api/endpoints/labels';

// The labels set on an issue, one chip each with its colour dot. The trigger of the
// label picker in the Properties, so it takes the props the menu trigger passes.
export default function IssueLabelChips({
  labels,
  ...props
}: { labels: Label[] } & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className="flex max-w-full min-w-0 flex-wrap items-center gap-1 rounded-md p-0.5 text-start transition-colors hover:bg-accent"
      {...props}
    >
      {labels.map((label) => (
        <span
          key={label.id}
          className="inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-full border border-border bg-card px-2 text-xs text-foreground"
        >
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
          <span className="truncate" dir="auto">
            {label.name}
          </span>
        </span>
      ))}
    </button>
  );
}
