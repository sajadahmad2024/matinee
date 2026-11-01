"use client";

import { usePathname } from "next/navigation";

import {
  LuChevronLeft,
  LuClipboardList,
  LuCreditCard,
  LuFilm,
  LuGamepad2,
  LuGift,
  LuLayoutDashboard,
  LuMegaphone,
  LuSettings,
  LuShieldAlert,
  LuUsers,
} from "react-icons/lu";

import { useSidebar } from "@/components/ui/sidebar";

import { ADMIN_ROUTES, type AdminRoute } from "@/app/_libs/constants/routes";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomTooltip } from "@/components/custom/custom-tooltip";
import { SidebarUserProfile } from "@/components/custom/sidebar-user-profile";

interface NavItem {
  title: string;
  href: AdminRoute;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: ADMIN_ROUTES.DASHBOARD, icon: LuLayoutDashboard },
  { title: "Content Management", href: ADMIN_ROUTES.CONTENT, icon: LuFilm },
  { title: "Game Management", href: ADMIN_ROUTES.GAMES, icon: LuGamepad2 },
  { title: "Rewards", href: ADMIN_ROUTES.REWARDS, icon: LuGift },
  { title: "User Management", href: ADMIN_ROUTES.USERS, icon: LuUsers },
  { title: "Ads Management", href: ADMIN_ROUTES.ADS, icon: LuMegaphone },
  { title: "Subscriptions", href: ADMIN_ROUTES.SUBSCRIPTIONS, icon: LuCreditCard },
  { title: "Moderation Queue", href: ADMIN_ROUTES.MODERATION, icon: LuShieldAlert },
  { title: "Report Management", href: ADMIN_ROUTES.REPORTS, icon: LuClipboardList },
  { title: "Settings", href: ADMIN_ROUTES.SETTINGS, icon: LuSettings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-400 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}>
      {/* Logo */}
      <div className="border-sidebar-border flex h-16 items-center border-b px-3">
        <div className="flex w-full items-center">
          <CustomTooltip
            side="right"
            sideOffset={12}
            disabled={!isCollapsed}
            content={
              <span className="font-sans font-bold">
                Maintinee<span className="text-primary">.io</span>
              </span>
            }>
            <div
              onClick={toggleSidebar}
              className="from-primary to-accent shadow-glow-sm flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-linear-to-br">
              <span className="text-primary-foreground font-sans text-lg font-bold">M</span>
            </div>
          </CustomTooltip>

          <div
            className={cn(
              "flex flex-1 items-center justify-between overflow-hidden transition-all duration-400 ease-in-out",
              isCollapsed ? "ml-0 max-w-0" : "ml-3 max-w-48",
            )}>
            <span className="text-foreground font-sans font-bold whitespace-nowrap">
              Maintinee<span className="text-primary">.io</span>
            </span>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="text-sidebar-foreground dark:text-sidebar-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent size-7 rounded-md">
              <LuChevronLeft />
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <CustomTooltip
              key={item.href}
              side="right"
              sideOffset={12}
              disabled={!isCollapsed}
              content={item.title}>
              <a
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center rounded-lg px-2 transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary shadow-glow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}>
                <div className="flex w-8 shrink-0 items-center justify-center">
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                </div>
                <span className="overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-400 ease-in-out">
                  {item.title}
                </span>
              </a>
            </CustomTooltip>
          );
        })}
      </nav>

      <SidebarUserProfile isCollapsed={isCollapsed} />
    </aside>
  );
}
