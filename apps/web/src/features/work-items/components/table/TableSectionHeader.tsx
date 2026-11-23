import { useIconHover } from '@animateicons/react';
import { ChevronDownIcon } from '@animateicons/react/lucide/chevron-down-icon';
import { ChevronRightIcon } from '@animateicons/react/lucide/chevron-right-icon';
import { PlusIcon } from '@animateicons/react/lucide/plus-icon';
import { useTranslations } from 'next-intl';
import { type IssueGroup } from '@/utils/project';
import { GroupDot } from '../shared/GroupDot';
import { HeaderIconButton } from '../shared/HeaderIconButton';
import { TableDropZone } from './TableDropZone';

// A primary group header row. A drop onto it appends to the group's bucket
// (disabled when sub-grouped, where issues live under sub-headers).
export function TableSectionHeader({
  group,
  count,
  collapsed,
  disabled,
  dropId,
  onDrop,
  onToggle,
  onAddIssue,
  canAdd,
}: {
  group: IssueGroup;
  count: number;
  collapsed: boolean;
  disabled: boolean;
  dropId: string;
  onDrop: (issueId: number) => void;
  onToggle: () => void;
  onAddIssue: () => void;
  canAdd: boolean;
}) {
  const t = useTranslations('workItems');
  const { ref, triggerProps } = useIconHover();
  const Chevron = collapsed ? ChevronRightIcon : ChevronDownIcon;
  return (
    <TableDropZone
      id={dropId}
      disabled={disabled}
      onDrop={onDrop}
      className="group/section flex h-9 items-center justify-between bg-muted/60 px-4"
    >
      <button
        type="button"
        {...triggerProps}
        onClick={onToggle}
        className="flex items-center gap-2 text-[13px] font-medium text-foreground"
      >
        <Chevron ref={ref} size={14} className="text-muted-foreground" />
        <GroupDot group={group} />
        {group.name}
        <span className="text-xs font-normal text-muted-foreground">{count}</span>
      </button>
      {canAdd && (
        <HeaderIconButton
          icon={PlusIcon}
          label={t('newIssue')}
          onClick={onAddIssue}
          className="opacity-0 group-focus-within/section:opacity-100 group-hover/section:opacity-100 pointer-coarse:opacity-100"
        />
      )}
    </TableDropZone>
  );
}
