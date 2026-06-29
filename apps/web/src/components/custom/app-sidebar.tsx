"use client";

import * as React from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  LuChevronLeft,
  LuClipboardList,
  LuCreditCard,
  LuFilm,
  LuGamepad2,
  LuLayoutDashboard,
  LuLogOut,
  LuSettings,
  LuShieldAlert,
  LuUsers,
} from "react-icons/lu";

import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { title: "Content Management", href: "/content", icon: LuFilm },
  { title: "Game Center", href: "/games", icon: LuGamepad2 },
  { title: "User Management", href: "/users", icon: LuUsers },
  { title: "Subscriptions", href: "/subscriptions", icon: LuCreditCard },
  { title: "Moderation Queue", href: "/moderation", icon: LuShieldAlert },
  { title: "Report Management", href: "/reports", icon: LuClipboardList },
  { title: "Settings", href: "/settings", icon: LuSettings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Mock user data - replace with actual user data when auth is connected
  const user = { firstName: "John", lastName: "Doe" };
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  const handleLogout = () => {
    // Add logout logic here when auth is connected
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-all duration-400 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}>
      {/* Logo */}
      <div className="border-sidebar-border flex h-16 items-center border-b px-3">
        <div className="flex w-full items-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                onClick={toggleSidebar}
                className="from-primary to-accent shadow-glow-sm flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-linear-to-br">
                <span className="text-primary-foreground font-sans text-lg font-bold">M</span>
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-card/95 text-card-foreground border-border/50 rounded-lg border shadow-xl backdrop-blur-xl">
                <span className="font-sans font-bold">
                  Maintinee<span className="text-primary">.io</span>
                </span>
              </TooltipContent>
            )}
          </Tooltip>

          <div
            className={cn(
              "flex flex-1 items-center justify-between overflow-hidden transition-all duration-400 ease-in-out",
              isCollapsed ? "ml-0 max-w-0" : "ml-3 max-w-48",
            )}>
            <span className="text-foreground font-sans font-bold whitespace-nowrap">
              Maintinee<span className="text-primary">.io</span>
            </span>
            <button
              onClick={toggleSidebar}
              className="text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer rounded-md p-1 transition-colors">
              <LuChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          const linkContent = (
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
              <span
                className={cn(
                  "overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-400 ease-in-out",
                )}>
                {item.title}
              </span>
            </a>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="bg-card/95 text-card-foreground border-border/50 rounded-lg border shadow-xl backdrop-blur-xl">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-sidebar-border border-t p-3">
        <div className="flex items-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="from-success to-primary flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-br transition-all duration-300">
                <span className="text-primary-foreground text-sm font-semibold">{initials}</span>
              </div>
            </TooltipTrigger>
            {isCollapsed ? (
              <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-card/95 text-card-foreground border-border/50 overflow-hidden rounded-xl border p-0 shadow-xl backdrop-blur-xl">
                <div className="flex items-stretch">
                  <div className="flex flex-col justify-center px-4 py-3">
                    <p className="text-foreground text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">Owner • Full Access</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-destructive/5 hover:bg-destructive/15 text-destructive/80 hover:text-destructive border-border/30 flex items-center justify-center border-l px-4 py-3 transition-all duration-200">
                    <LuLogOut className="h-4 w-4" />
                  </button>
                </div>
              </TooltipContent>
            ) : null}
          </Tooltip>

          <div
            className={cn(
              "flex flex-1 items-center justify-between overflow-hidden transition-all duration-400 ease-in-out",
              isCollapsed ? "ml-0 max-w-0" : "ml-3 max-w-48",
            )}>
            <div className="overflow-hidden">
              <p className="text-foreground truncate text-sm font-semibold whitespace-nowrap">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground truncate text-xs whitespace-nowrap">Owner</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive shrink-0 p-2 transition-colors">
              <LuLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
