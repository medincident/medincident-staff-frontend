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
  Wrench // <-- Добавили иконку
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  // В реальном приложении берем из стора.
  const isAdmin = true; 

  const mainLinks = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    { href: "/events", label: "События", icon: AlertTriangle },
    { href: "/requests", label: "Заявки", icon: Wrench },
    { href: "/reports", label: "Отчеты", icon: BarChart3 },
  ];

  const adminLinks = [
    { href: "/admin/classifier", label: "Классификатор", icon: Shield },
    { href: "/admin/structure", label: "Структура", icon: Building },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r  bg-card h-screen sticky top-0 z-20 transition-colors duration-300">
      
      {/* Логотип */}
      <div className="h-14 flex items-center px-6 border-b ">
        <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">MedSafety</span>
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
              // Исправленная логика активного состояния (чтобы /requests/new тоже подсвечивало)
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-warning/10 text-warning"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <div className="p-4 text-center border-t ">
        <p className="text-[10px] text-muted-foreground">
            MedSafety v1.0.0
            <br />
            © 2026
        </p>
      </div>
    </aside>
  );
}