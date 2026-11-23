'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import SidebarConfigNavMenu from '@/components/layout/SidebarConfigNavMenu';
import { useSidebarConfigSections } from '@/components/layout/hooks/useSidebarConfigSections';

// The Configuration entry at the foot of the sidebar: folded by default, it holds the
// project configuration and, after a divider, the instance tools. Collapsed to icons it
// becomes a dropdown.
export default function SidebarConfigNav({ projectKey }: { projectKey: string | null }) {
  const t = useTranslations('nav');
  const { state, isMobile } = useSidebar();
  const sections = useSidebarConfigSections(projectKey);
  if (sections.length === 0) return null;

  const label = t('configuration');
  const active = sections.some((section) => section.some((item) => item.active));

  if (state === 'collapsed' && !isMobile)
    return <SidebarConfigNavMenu label={label} active={active} sections={sections} />;

  return (
    <SidebarMenu>
      <Collapsible asChild defaultOpen={active} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={active}>
              <SlidersHorizontal />
              <span>{label}</span>
              <ChevronRight className="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90 rtl:-scale-x-100" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {sections.map((section, index) => (
                <Fragment key={section[0]!.key}>
                  {index > 0 && <li aria-hidden className="my-1 h-px bg-sidebar-border" />}
                  {section.map((item) => (
                    <SidebarMenuSubItem key={item.key}>
                      <SidebarMenuSubButton asChild isActive={item.active}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </Fragment>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
