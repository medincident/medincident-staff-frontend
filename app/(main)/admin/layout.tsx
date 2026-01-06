"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Building, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminTabs = [
    { href: "/admin/classifier", label: "Классификатор", icon: Shield },
    { href: "/admin/structure", label: "Структура", icon: Building },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="md:hidden mb-1 w-full max-w-[calc(100vw-32px)] overflow-x-auto pb-2 scrollbar-hide">
        <nav className="flex gap-2 min-w-max">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap", 
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}