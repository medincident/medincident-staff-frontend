"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions, type PermissionKey } from "@/lib/auth/use-permissions";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Megaphone,
  Shield,
  Users,
  Building,
  UserCheck,
  Network,
  Wrench,
  ClipboardCheck,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { MedIncidentLogo } from "@/components/icons/med-incident-logo";
import { useMiniApp } from "@/lib/miniapp";
import { OrgScopePicker } from "@/components/layout/org-scope-picker";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Любой из этих permission'ов делает ссылку видимой. Если не задан —
   * ссылка видна всем авторизованным.
   */
  can?: PermissionKey | PermissionKey[];
}

const MAIN_LINKS: NavLink[] = [
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
];

const ADMIN_LINKS: NavLink[] = [
  {
    href: "/admin/organizations",
    label: "Организации",
    icon: Network,
    can: "canManageOrganizations",
  },
  {
    href: "/admin/structure",
    label: "Структура",
    icon: Building,
    can: "canManageOrgStructure",
  },
  {
    href: "/admin/department",
    label: "Подразделение",
    icon: UserCheck,
    can: "canManageDepartmentSettings",
  },
  {
    href: "/admin/classifier",
    label: "Классификатор",
    icon: Shield,
    can: "canManageClassifiers",
  },
  {
    href: "/admin/capa",
    label: "Мероприятия",
    icon: ClipboardCheck,
    can: "canManageCapa",
  },
  {
    href: "/admin/patient-incidents",
    label: "Заявки пациентов",
    icon: Inbox,
    can: "canReviewPatientIncidents",
  },
  {
    href: "/admin/announcements",
    label: "Объявления",
    icon: Megaphone,
    can: "canManageAnnouncements",
  },
  { href: "/admin/users", label: "Пользователи", icon: Users, can: "canManageOrgUsers" },
];

export function Sidebar() {
  const pathname = usePathname();
  const perms = usePermissions();
  const miniApp = useMiniApp();

  if (miniApp) return null;

  const isVisible = (link: NavLink) => {
    if (!link.can) return true;
    const keys = Array.isArray(link.can) ? link.can : [link.can];
    return keys.some((k) => !!perms[k]);
  };

  const mainLinks = MAIN_LINKS.filter(isVisible);
  const adminLinks = ADMIN_LINKS.filter(isVisible);
  const showAdminSection = adminLinks.length > 0;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0 z-20 transition-colors duration-300">

      <div className="h-14 flex items-center px-4 border-b">
        <div className="h-9 w-9 flex items-center justify-center">
            <MedIncidentLogo className="h-7 w-7 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">{APP_CONFIG.name}</span>
      </div>

      <div className="px-3 py-3 border-b">
        <p className="px-1 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Организация
        </p>
        <OrgScopePicker />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">

        <div>
          <h3 className="mb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Основное
          </h3>
          <nav className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {showAdminSection && (
          <div>
             <h3 className="mb-2 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                Администрирование
             </h3>
             <nav className="space-y-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-warning/10 text-warning shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 text-center border-t">
        <p className="text-[10px] text-muted-foreground">
            {APP_CONFIG.name} {APP_CONFIG.version}
            <br />
            © {APP_CONFIG.year}
        </p>
      </div>
    </aside>
  );
}