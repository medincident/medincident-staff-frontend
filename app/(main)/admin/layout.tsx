"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Building, Users, UserCheck, Network } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminTabs = [
    { href: "/admin/organizations", label: "Организации", icon: Network },
    { href: "/admin/classifier", label: "Классификатор", icon: Shield },
    { href: "/admin/department", label: "Подразделение", icon: UserCheck },
    { href: "/admin/structure", label: "Структура", icon: Building },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Мобильная навигация админки */}
      <div className="md:hidden w-full pb-4">
        <nav className="grid w-full grid-flow-col auto-cols-fr items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center whitespace-nowrap rounded-md py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  "h-full px-1 sm:px-3 sm:text-sm", 
                  isActive 
                    ? "bg-background text-foreground shadow-sm" 
                    : "hover:bg-background/50 hover:text-foreground"
                )}
              >
                <Icon size={16} className="mb-1 sm:mb-0 sm:mr-2 inline-block" />
                <span className="truncate max-w-full">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Контент страницы */}
      {children}
    </div>
  );
}