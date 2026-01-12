"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  AlertTriangle, 
  BarChart3, 
  LayoutDashboard, 
  ShieldCheck,
  Wrench 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  
  const isAdmin = true; 

  const links = [
    {
      href: "/dashboard",
      label: "Главная",
      icon: LayoutDashboard,
    },
    {
      href: "/events",
      label: "События",
      icon: AlertTriangle,
    },
    {
      href: "/requests", 
      label: "Заявки",
      icon: Wrench,
    },
    {
      href: "/reports",
      label: "Отчеты",
      icon: BarChart3,
    },
    ...(isAdmin ? [{
      href: "/admin/classifier",
      label: "Админ",
      icon: ShieldCheck,
      isActiveOverride: pathname.startsWith("/admin")
    }] : [])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe bg-card border-t transition-colors duration-300 md:hidden">
      <div className="flex justify-around items-center h-full px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.isActiveOverride || (link.href !== '/dashboard' && pathname.startsWith(link.href)) || pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-90 group",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center p-1 rounded-xl transition-colors",
                isActive && "bg-primary/10"
              )}>
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