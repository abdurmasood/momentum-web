import type React from "react";
import dynamic from "next/dynamic";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard/app-sidebar";
import { stackServerApp } from "@/stack";

// Dynamic import for Stack Auth components to reduce initial bundle size
const StackProvider = dynamic(
  () => import("@stackframe/stack").then((mod) => ({ default: mod.StackProvider })),
  {
    ssr: true, // Stack Auth supports SSR
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    ),
  }
);

const StackTheme = dynamic(
  () => import("@stackframe/stack").then((mod) => ({ default: mod.StackTheme })),
  {
    ssr: true,
    loading: () => <div className="min-h-screen bg-background" />,
  }
);

export default function DashboardNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackServerApp}>
      <StackTheme>
        <div className="dark">
          <SidebarProvider>
            <div className="flex h-screen w-full bg-background text-foreground">
              <DashboardSidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </div>
      </StackTheme>
    </StackProvider>
  );
}