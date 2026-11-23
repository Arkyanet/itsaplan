'use client';

import type { Project } from '@/lib/api/endpoints/projects';
import { SidebarFooterAction } from '@/cloud';
import { useSettingsNavGroups } from '@/hooks/useSettingsNavGroups';
import { useSidebarSide } from '@/hooks/useSidebarSide';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import ProjectSwitcher from '@/components/layout/ProjectSwitcher';
import SidebarConfigNav from '@/components/layout/SidebarConfigNav';
import SidebarMainNav from '@/components/layout/SidebarMainNav';
import SidebarSettingsNav from '@/components/layout/SidebarSettingsNav';
import SidebarBrandFooter from '@/components/brand/SidebarBrandFooter';

// The app sidebar. It has two modes driven by the route: the main work
// navigation, and the project settings navigation reached through the "Project
// settings" entry. The project switcher header and the footer (the Configuration
// entry in the main mode, brand mark) are shared by both modes. Creating and deleting a project
// live in the team panel on Manage teams, not here.
export default function AppSidebar({
  projects,
  currentProjectKey,
  onSelectProject,
}: {
  projects: Project[];
  currentProjectKey: string | null;
  onSelectProject: (key: string) => void;
}) {
  const projectId = projects.find((p) => p.ref === currentProjectKey)?.id ?? null;

  // Settings mode is on whenever the route matches one of the settings nav items.
  // Members and the AI Team pages are not in those groups, so they keep the main
  // sidebar.
  const settingsNav = useSettingsNavGroups(currentProjectKey);
  const settingsMode = settingsNav.groups.some((g) => g.items.some((i) => i.active));
  const side = useSidebarSide();

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader>
        <ProjectSwitcher
          projects={projects}
          currentProjectKey={currentProjectKey}
          onSelectProject={onSelectProject}
        />
      </SidebarHeader>

      <SidebarContent>
        {settingsMode ? (
          <SidebarSettingsNav projectKey={currentProjectKey} />
        ) : (
          <SidebarMainNav projectKey={currentProjectKey} projectId={projectId} />
        )}
      </SidebarContent>

      <SidebarFooter>
        {!settingsMode && (
          <>
            <SidebarConfigNav projectKey={currentProjectKey} />
            <SidebarSeparator />
          </>
        )}

        <SidebarFooterAction />
        <SidebarBrandFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
