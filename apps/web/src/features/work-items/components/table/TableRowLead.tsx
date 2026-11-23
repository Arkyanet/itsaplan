import type { ReactNode } from 'react';
import type { ProjectDetail } from '@/lib/api/endpoints/projects';
import type { Issue, IssuePatch } from '@/lib/api/endpoints/issues';
import { type Maps } from '@/utils/project';
import { usePriorityLabel } from '@/hooks/usePriorityLabel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityIcon, StateIcon } from '@/features/issue/components/shared/IssueIcons';
import { EditableBuiltinCell } from '../shared/EditableBuiltinCell';
import { IssueIdentifier } from '../shared/IssueIdentifier';

// The start of a table row, before the title: the priority, the identifier and the
// status. Each sits in a slot of fixed width, so the titles line up from row to row.
// The priority and the status open their pickers like the other cells.
export function TableRowLead({
  issue,
  project,
  maps,
  showPriority,
  showId,
  showStatus,
  idWidth,
  readOnly,
  onPatch,
  onOpenIssue,
}: {
  issue: Issue;
  project: ProjectDetail;
  maps: Maps;
  showPriority: boolean;
  showId: boolean;
  showStatus: boolean;
  // The longest identifier of the list, in characters.
  idWidth: number;
  readOnly: boolean;
  onPatch: (patch: IssuePatch) => void;
  onOpenIssue: (id: number) => void;
}) {
  const priorityLabel = usePriorityLabel();
  const column = maps.columnById.get(issue.columnId);

  const slot = (label: string, icon: ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <>
      {showPriority && (
        <EditableBuiltinCell
          column="priority"
          issue={issue}
          project={project}
          readOnly={readOnly}
          onPatch={onPatch}
        >
          {slot(
            priorityLabel(issue.priority),
            <PriorityIcon priority={issue.priority ?? ''} className="size-3.5" />,
          )}
        </EditableBuiltinCell>
      )}
      {showId && (
        <IssueIdentifier
          issue={issue}
          className="text-xs text-muted-foreground tabular-nums"
          style={{ minWidth: `${idWidth}ch` }}
          onOpenAncestor={onOpenIssue}
        />
      )}
      {showStatus && column && (
        <EditableBuiltinCell
          column="status"
          issue={issue}
          project={project}
          readOnly={readOnly}
          onPatch={onPatch}
        >
          {slot(
            column.name,
            <StateIcon stateType={column.stateType} color={column.color} className="size-3.5" />,
          )}
        </EditableBuiltinCell>
      )}
    </>
  );
}
