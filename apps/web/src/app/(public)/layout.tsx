import { SidebarProvider } from "@/components/ui/sidebar";

import { PublicLayoutContent } from "@/components/custom/public-layout-content";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </SidebarProvider>
  );
}
