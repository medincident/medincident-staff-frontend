import React from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full md:max-w-6xl mx-auto p-4 pb-24 md:p-8">
          {children}
        </main>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}