"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Building, Users, UserCheck, Network, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const adminTabs = [
  { href: "/admin/organizations", label: "Организации", icon: Network },
  { href: "/admin/classifier", label: "Классификатор", icon: Shield },
  { href: "/admin/department", label: "Подразделение", icon: UserCheck },
  { href: "/admin/structure", label: "Структура", icon: Building },
  { href: "/admin/announcements", label: "Объявления", icon: Megaphone },
  { href: "/admin/users", label: "Пользователи", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = adminTabs.find((t) => t.href === pathname) ?? adminTabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="md:hidden w-full pb-4">
        <Select
          value={pathname}
          onValueChange={(href) => router.push(href)}
        >
          <SelectTrigger className="w-full h-11">
            <span className="flex items-center gap-2.5 min-w-0">
              <CurrentIcon className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate font-medium">{currentTab.label}</span>
            </span>
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <SelectItem
                  key={tab.href}
                  value={tab.href}
                  className="cursor-pointer pl-8 pr-2 [&>span:first-child]:left-2 [&>span:first-child]:right-auto [&>span:first-child]:top-1/2 [&>span:first-child]:-translate-y-1/2"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className={isActive ? "font-medium" : ""}>
                      {tab.label}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Скрытые ссылки для префетча — Next.js подтягивает чанки страниц,
          чтобы переключение через Select было мгновенным. */}
      <div className="hidden">
        {adminTabs.map((tab) => (
          <Link key={tab.href} href={tab.href} prefetch />
        ))}
      </div>

      {/* Контент страницы */}
      {children}
    </div>
  );
}
