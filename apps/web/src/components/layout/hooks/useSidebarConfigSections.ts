import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, Braces, Globe, Server, Settings, Shield, Users } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useApiDocsVisibilityQuery } from '@/services/apiDocs.service';
import { useSettingsNavGroups } from '@/hooks/useSettingsNavGroups';
import { usePermissions } from '@/hooks/usePermissions';
import { GOD_SECTIONS } from '@/utils/godSections';
import {
  apiDocsPath,
  godPath,
  mcpServerPath,
  membersPath,
  notificationsPath,
  publicSharesPath,
} from '@/utils/paths';
import type { SidebarNavSubmenuItem } from '@/components/layout/SidebarNavSubmenu';

// The links of the sidebar's Configuration entry, in two sections: the project's own
// configuration, then the instance tools (API docs, MCP server, God mode).
export function useSidebarConfigSections(projectKey: string | null): SidebarNavSubmenuItem[][] {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { firstHref } = useSettingsNavGroups(projectKey);
  const { can, isMember } = usePermissions();
  const showApiDocs = useApiDocsVisibilityQuery().data?.visible === true;

  const { data: session } = useSession();
  // The session can be filled before hydration while the server rendered without it;
  // reading it after mount keeps both renders identical.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isGod = mounted && session?.user.role === 'god';

  const project: SidebarNavSubmenuItem[] = [];
  const tools: SidebarNavSubmenuItem[] = [];

  if (projectKey) {
    if (can('members_manage', 'read'))
      project.push({
        key: 'members',
        href: membersPath(projectKey),
        icon: Users,
        label: t('members'),
        active: pathname.includes('/members'),
      });
    if (isMember)
      project.push({
        key: 'notifications',
        href: notificationsPath(projectKey),
        icon: Bell,
        label: t('notifications'),
        active: pathname === notificationsPath(projectKey),
      });
    project.push({
      key: 'public',
      href: publicSharesPath(projectKey),
      icon: Globe,
      label: t('public'),
      active: pathname === publicSharesPath(projectKey),
    });
    if (firstHref)
      project.push({
        key: 'settings',
        href: firstHref,
        icon: Settings,
        label: t('projectSettings'),
        active: false,
      });

    if (showApiDocs)
      tools.push({
        key: 'api-docs',
        href: apiDocsPath(projectKey),
        icon: Braces,
        label: t('apiDocs'),
        active: pathname.endsWith('/api'),
      });
    tools.push({
      key: 'mcp',
      href: mcpServerPath(projectKey),
      icon: Server,
      label: t('mcpServer'),
      active: pathname.endsWith('/mcp'),
    });
  }
  // The API enforces the same rule; hiding the entry is about noise, not access.
  if (isGod)
    tools.push({
      key: 'god',
      href: godPath(GOD_SECTIONS[0]!.slug),
      icon: Shield,
      label: t('godMode'),
      active: false,
    });

  return [project, tools].filter((section) => section.length > 0);
}
