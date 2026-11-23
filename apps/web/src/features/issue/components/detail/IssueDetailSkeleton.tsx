import ListSkeleton from '@/components/common/skeleton/ListSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { PROPERTIES_W } from '../../utils/propertiesWidth';

// Stands in for the body of an issue while it loads: the title, the description and
// the properties. 'page' takes the shape of the full-page layout, the column centred
// and, from xl, the Properties panel along the end edge.
export default function IssueDetailSkeleton({ layout }: { layout?: 'page' }) {
  const text = (
    <>
      <Skeleton className="h-8 w-2/3 max-w-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </>
  );

  if (layout === 'page') {
    return (
      <div className="flex flex-1 items-start" aria-busy>
        <div className="min-w-0 flex-1 px-6 pt-6 pb-16 sm:px-10 xl:pt-12">
          <div className="mx-auto flex max-w-[760px] flex-col gap-6">
            {text}
            <ListSkeleton rows={4} rowClassName="h-7" className="xl:hidden" />
          </div>
        </div>
        <div
          className="sticky top-0 hidden h-[100cqh] shrink-0 flex-col gap-4 border-s border-border bg-muted/40 p-4 xl:flex"
          style={{ width: PROPERTIES_W }}
        >
          <Skeleton className="ms-auto h-7 w-40" />
          <ListSkeleton rows={8} rowClassName="h-7" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6" aria-busy>
      {text}
      <ListSkeleton rows={4} rowClassName="h-7" />
    </div>
  );
}
