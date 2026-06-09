"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Building, Users, UserCheck, Network, Megaphone, ClipboardCheck, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { usePermissions, type PermissionKey } from "@/lib/auth/use-permissions";

interface AdminTab {
  href: string;
  label: string;
  icon: typeof Shield;
  can: PermissionKey;
}

const adminTabs: AdminTab[] = [
  { href: "/admin/organizations", label: "Организации", icon: Network, can: "canManageOrganizations" },
  { href: "/admin/classifier", label: "Классификатор", icon: Shield, can: "canManageClassifiers" },
  { href: "/admin/capa", label: "Мероприятия", icon: ClipboardCheck, can: "canManageCapa" },
  { href: "/admin/patient-incidents", label: "Заявки пациентов", icon: Inbox, can: "canReviewPatientIncidents" },
  { href: "/admin/department", label: "Подразделение", icon: UserCheck, can: "canManageDepartmentSettings" },
  { href: "/admin/structure", label: "Структура", icon: Building, can: "canManageOrgStructure" },
  { href: "/admin/announcements", label: "Объявления", icon: Megaphone, can: "canManageAnnouncements" },
  { href: "/admin/users", label: "Пользователи", icon: Users, can: "canManageOrgUsers" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const perms = usePermissions();

  const visibleTabs = useMemo(
    () => adminTabs.filter((t) => !!perms[t.can]),
    [perms],
  );

  // Без прав на текущий admin-маршрут — редирект на /dashboard.
  useEffect(() => {
    if (perms.isLoading) return;
    const currentTab = adminTabs.find((t) => t.href === pathname);
    if (currentTab && !perms[currentTab.can]) {
      router.replace("/dashboard");
      return;
    }
    if (!currentTab && visibleTabs.length === 0) {
      router.replace("/dashboard");
    }
  }, [perms, pathname, router, visibleTabs.length]);

  if (perms.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTab =
    adminTabs.find((t) => t.href === pathname) ?? visibleTabs[0];
  if (!currentTab) {
    return null; // редирект сработает в useEffect выше
  }
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
            {visibleTabs.map((tab) => {
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
        {visibleTabs.map((tab) => (
          <Link key={tab.href} href={tab.href} prefetch />
        ))}
      </div>

      {children}
    </div>
  );
}
