"use client";

import { useSidebar } from "@/components/ui/sidebar";

import { cn } from "@/app/_libs/utils/cn";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { GlobalHeader } from "@/components/custom/global-header";

export function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="bg-background flex min-h-screen w-full">
      <AppSidebar />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-400 ease-in-out",
          isCollapsed ? "ml-16" : "ml-64",
        )}>
        <GlobalHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
