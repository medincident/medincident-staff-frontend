"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMiniApp } from "@/lib/miniapp";
import { usePermissions, type PermissionKey } from "@/lib/auth/use-permissions";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  can?: PermissionKey | PermissionKey[];
  isActiveOverride?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const miniApp = useMiniApp();
  const perms = usePermissions();

  if (miniApp) return null;

  const adminLink: NavLink | null =
    perms.canManageOrgStructure ||
    perms.canManageClassifiers ||
    perms.canManageOrgUsers ||
    perms.canManageDepartmentSettings ||
    perms.canManageAnnouncements ||
    perms.canManageOrganizations
      ? {
          href: "/admin/classifier",
          label: "Админ",
          icon: ShieldCheck,
          isActiveOverride: pathname.startsWith("/admin"),
        }
      : null;

  const links: NavLink[] = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    {
      href: "/events",
      label: "События",
      icon: AlertTriangle,
      can: ["canSeeOwnIncidents", "canSeeAllIncidents"],
    },
    {
      href: "/requests",
      label: "Заявки",
      icon: Wrench,
      can: ["canSeeOwnRequests", "canSeeAllRequests"],
    },
    { href: "/reports", label: "Отчеты", icon: BarChart3, can: "canViewReports" },
    ...(adminLink ? [adminLink] : []),
  ];

  const visibleLinks = links.filter((l) => {
    if (!l.can) return true;
    const keys = Array.isArray(l.can) ? l.can : [l.can];
    return keys.some((k) => !!perms[k]);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe bg-card border-t transition-colors duration-300 md:hidden">
      <div className="flex justify-around items-center h-full px-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.isActiveOverride ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href)) ||
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-90 group",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center p-1 rounded-xl transition-colors",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
