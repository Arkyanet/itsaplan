import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// The heading of one group of properties, spanning both columns of the Properties
// grid. The whole row toggles the group.
export default function IssuePropertyGroupHeading({
  label,
  open,
  onToggle,
  className,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <button
      type="button"
      className={cn(
        'group/heading col-span-2 flex h-6 items-center gap-1 justify-self-start rounded-md text-xs font-medium text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={onToggle}
    >
      {label}
      <Chevron className="size-3 opacity-60 group-hover/heading:opacity-100" />
    </button>
  );
}
