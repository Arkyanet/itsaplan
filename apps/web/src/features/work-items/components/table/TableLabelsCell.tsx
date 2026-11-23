import type { Label } from '@/lib/api/endpoints/labels';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Labels past this many fold into "+N", so a row stays one line high.
const MAX_LABELS = 2;

// The labels cell of a table row: a pill with a dot and a name per label.
export function TableLabelsCell({ labels }: { labels: Label[] }) {
  const rest = labels.slice(MAX_LABELS);
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden text-[11px] text-muted-foreground">
      {labels.slice(0, MAX_LABELS).map((label) => (
        <span
          key={label.id}
          className="flex h-5 min-w-0 items-center gap-1.5 rounded-full border border-border px-1.5"
        >
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span dir="auto" className="truncate">
            {label.name}
          </span>
        </span>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 ps-0.5">+{rest.length}</span>
          </TooltipTrigger>
          <TooltipContent>{rest.map((label) => label.name).join(', ')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
