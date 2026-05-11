import React from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionExpiredBanner } from "@/components/auth/session-expired-banner";
import { RolesGuard } from "@/components/auth/roles-guard";
import { ActiveOrgProvider } from "@/lib/auth/active-org-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RolesGuard>
      <ActiveOrgProvider>
        <div className="min-h-screen bg-background flex transition-colors duration-300">
          <Sidebar />

          <div className="flex-1 flex flex-col min-h-screen min-w-0">
            <Header />
            <SessionExpiredBanner />
            <main className="flex-1 w-full md:max-w-6xl mx-auto p-4 md:p-8 min-w-0 overflow-x-hidden">
              {children}
            </main>

            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>
        </div>
      </ActiveOrgProvider>
    </RolesGuard>
  );
}