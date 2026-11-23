import { Fragment } from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { SidebarNavSubmenuItem } from '@/components/layout/SidebarNavSubmenu';

// The icon-collapsed form of SidebarConfigNav: the sections fly out to the side.
export default function SidebarConfigNavMenu({
  label,
  active,
  sections,
}: {
  label: string;
  active: boolean;
  sections: SidebarNavSubmenuItem[][];
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={label} isActive={active}>
              <SlidersHorizontal />
              <span>{label}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-52 rounded-lg" align="end" side="right">
            <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
            {sections.map((section, index) => (
              <Fragment key={section[0]!.key}>
                {index > 0 && <DropdownMenuSeparator />}
                {section.map((item) => (
                  <DropdownMenuItem key={item.key} asChild className="gap-2">
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
