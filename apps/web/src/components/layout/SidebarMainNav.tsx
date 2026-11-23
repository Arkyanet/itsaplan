import SidebarAiTeamNav from '@/components/layout/SidebarAiTeamNav';
import SidebarWorkNav from '@/components/layout/SidebarWorkNav';

// The main sidebar body: the work navigation, then the AI Team group. The
// Configuration entry sits in the sidebar footer (see AppSidebar).
export default function SidebarMainNav({
  projectKey,
  projectId,
}: {
  projectKey: string | null;
  projectId: number | null;
}) {
  return (
    <>
      <SidebarWorkNav projectKey={projectKey} projectId={projectId} />
      <SidebarAiTeamNav projectKey={projectKey} />
    </>
  );
}
