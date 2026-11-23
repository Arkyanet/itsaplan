import {
  CalendarArrowUp,
  CalendarClock,
  Clock,
  Hash,
  RefreshCw,
  Target,
  Timer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BoardIssue } from '@/lib/api/endpoints/issues';
import { type Maps } from '@/utils/project';
import { cn } from '@/lib/utils';
import { formatDurationShort, formatShortDate, isDueOverdue } from '@/utils/dates';
import { formatMinutes } from '@/utils/estimate';
import type { DisplayProperty, PropertyKey } from '@/utils/viewSettings';
import {
  AssigneeAvatar,
  DateBadge,
  DelegateAvatar,
  LabelBadge,
  PILL,
  PriorityBadge,
} from '@/features/issue/components/shared/IssueBadges';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { StateIcon } from '@/features/issue/components/shared/IssueIcons';
import { IssueIdentifier } from '../shared/IssueIdentifier';
import { IssueCardLinks } from './IssueCardLinks';
import { IssueCardSubtasks } from './IssueCardSubtasks';

// One board card's content. Which properties render is driven by `properties`.
// onOpen opens an issue the card links to; the drag preview passes none.
export function IssueCardBody({
  issue,
  maps,
  properties,
  onOpen,
}: {
  issue: BoardIssue;
  maps: Maps;
  properties: PropertyKey[];
  onOpen?: (id: number) => void;
}) {
  const t = useTranslations('workItems');
  const has = (p: DisplayProperty) => properties.includes(p);
  const type = issue.typeId != null ? maps.typeById.get(issue.typeId) : undefined;
  const assignee =
    issue.assigneeUserId != null ? maps.assigneeById.get(issue.assigneeUserId) : undefined;
  const delegate =
    issue.delegateUserId != null ? maps.assigneeById.get(issue.delegateUserId) : undefined;
  const initiative = issue.initiative ?? undefined;
  const cycle = issue.cycle ?? undefined;
  const column = maps.columnById.get(issue.columnId);
  const avatarsShown = (has('assignee') && assignee) || (has('delegate') && delegate);
  const metaShown =
    (has('priority') && issue.priority) ||
    has('statusAge') ||
    (has('dueDate') && issue.dueDate) ||
    (has('startDate') && issue.startDate) ||
    (has('type') && type) ||
    (has('initiative') && initiative) ||
    (has('cycle') && cycle) ||
    (has('estimatePoints') && issue.estimatePoints != null) ||
    (has('estimateTime') && issue.estimateMinutes != null) ||
    (has('labels') && issue.labelIds.length > 0);
  const datesShown = has('created') || has('updated');

  return (
    <>
      {(has('id') || avatarsShown) && (
        <div
          className={cn(
            'mb-1.5 flex min-h-[18px] items-center',
            has('id') ? 'justify-between' : 'justify-end',
          )}
        >
          {has('id') && (
            <IssueIdentifier
              issue={issue}
              className="text-xs text-muted-foreground tabular-nums"
              onOpenAncestor={onOpen}
            />
          )}
          {/* Negative spacing so a delegate and an assignee shown together
              overlap; the ring in the card color keeps them separated. */}
          {avatarsShown && (
            <div className="flex items-center -space-x-1.5">
              {has('delegate') && delegate && (
                <DelegateAvatar
                  name={delegate.name}
                  image={delegate.image}
                  className="size-4.5 text-[8px] ring-2 ring-[var(--kanban-card)]"
                />
              )}
              {has('assignee') && assignee && (
                <AssigneeAvatar
                  name={assignee.name}
                  image={assignee.image}
                  className="size-4.5 text-[8px] ring-2 ring-[var(--kanban-card)]"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2">
        {has('status') && column && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="mt-px inline-flex shrink-0">
                <StateIcon stateType={column.stateType} color={column.color} className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{column.name}</TooltipContent>
          </Tooltip>
        )}
        <span
          dir="auto"
          className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground"
        >
          {issue.title}
        </span>
      </div>

      {metaShown && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {has('priority') && issue.priority && (
            <span className="inline-flex min-h-5 items-center self-stretch rounded-md border border-border px-1">
              <PriorityBadge priority={issue.priority} className="size-3" />
            </span>
          )}
          {has('statusAge') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={PILL}>
                  <Timer className="size-2.5" />
                  {formatDurationShort(issue.statusSince)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {t('statusSince', { date: formatShortDate(issue.statusSince) })}
              </TooltipContent>
            </Tooltip>
          )}
          {has('startDate') && issue.startDate && (
            <DateBadge
              icon={<CalendarArrowUp className="size-2.5" />}
              date={issue.startDate}
              label={t('columns.startDate')}
            />
          )}
          {has('dueDate') && issue.dueDate && (
            <DateBadge
              icon={<CalendarClock className="size-2.5" />}
              date={issue.dueDate}
              label={t('columns.dueDate')}
              overdue={isDueOverdue(issue.dueDate, column?.stateType)}
            />
          )}
          {has('type') && type && (
            <Badge variant="outline" className={PILL}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              {type.name}
            </Badge>
          )}
          {has('initiative') && initiative && (
            <Badge variant="outline" className={cn(PILL, 'max-w-full')}>
              <Target className="size-2.5 shrink-0" />
              <span className="truncate">{initiative.title}</span>
            </Badge>
          )}
          {has('cycle') && cycle && (
            <Badge variant="outline" className={cn(PILL, 'max-w-full')}>
              <RefreshCw className="size-2.5 shrink-0" />
              <span className="truncate">{cycle.name}</span>
            </Badge>
          )}
          {has('estimatePoints') && issue.estimatePoints != null && (
            <Badge variant="outline" className={PILL}>
              <Hash className="size-2.5" />
              {issue.estimatePoints}
            </Badge>
          )}
          {has('estimateTime') && issue.estimateMinutes != null && (
            <Badge variant="outline" className={PILL}>
              <Clock className="size-2.5" />
              {formatMinutes(issue.estimateMinutes)}
            </Badge>
          )}
          {has('labels') &&
            issue.labelIds.map((id) => {
              const label = maps.labelById.get(id);
              if (!label) return null;
              return <LabelBadge key={id} color={label.color} name={label.name} />;
            })}
        </div>
      )}

      {datesShown && (
        <div className="mt-2 text-[11px] text-muted-foreground/70">
          {has('created') && t('createdOn', { date: formatShortDate(issue.createdAt) })}
          {has('created') && has('updated') && ' · '}
          {has('updated') && t('updatedOn', { date: formatShortDate(issue.updatedAt) })}
        </div>
      )}

      <IssueCardSubtasks issueId={issue.id} maps={maps} onOpen={onOpen} />
      <IssueCardLinks links={issue.links} maps={maps} onOpen={onOpen} />
    </>
  );
}
