"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Shield,
  Users,
  Building,
  UserCheck,
  Network,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { MedIncidentLogo } from "@/components/icons/med-incident-logo";
import { useMiniApp } from "@/lib/miniapp";

export function Sidebar() {
  const pathname = usePathname();
  const miniApp = useMiniApp();
  const isAdmin = true;

  if (miniApp) return null;

  const mainLinks = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    { href: "/events", label: "События", icon: AlertTriangle },
    { href: "/requests", label: "Заявки", icon: Wrench },
    { href: "/reports", label: "Отчеты", icon: BarChart3 },
  ];

  const adminLinks = [
    { href: "/admin/organizations", label: "Организации", icon: Network },
    { href: "/admin/structure", label: "Структура", icon: Building },
    { href: "/admin/department", label: "Подразделение", icon: UserCheck },
    { href: "/admin/classifier", label: "Классификатор", icon: Shield },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0 z-20 transition-colors duration-300">

      {/* Логотип */}
      <div className="h-14 flex items-center px-4 border-b">
        <div className="h-9 w-9 flex items-center justify-center">
            <MedIncidentLogo className="h-7 w-7 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">{APP_CONFIG.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">

        {/* ОСНОВНОЕ МЕНЮ */}
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

        {/* АДМИН ПАНЕЛЬ */}
        {isAdmin && (
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

      {/* ФУТЕР */}
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