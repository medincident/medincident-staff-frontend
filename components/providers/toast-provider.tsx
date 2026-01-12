"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- ТИПЫ ---
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- СТИЛИ ДЛЯ РАЗНЫХ ТИПОВ ---
const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    // Зеленый для успеха (стандарт UX), но на нейтральном фоне
    iconWrapper: "bg-green-500/10 text-green-600 dark:text-green-500",
  },
  error: {
    icon: AlertCircle,
    // Красный (Destructive) для ошибок
    iconWrapper: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    // Оранжевый для предупреждений
    iconWrapper: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
  },
  info: {
    icon: Info,
    // Ваш PRIMARY цвет для информации
    iconWrapper: "bg-primary/10 text-primary",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, title, message };
    
    setToasts((prev) => [...prev, newToast]);

    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => addToast("success", title, message),
    error: (title: string, message?: string) => addToast("error", title, message),
    info: (title: string, message?: string) => addToast("info", title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* КОНТЕЙНЕР УВЕДОМЛЕНИЙ */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none p-4 sm:p-0">
        {toasts.map((t) => {
          const StyleConfig = TOAST_STYLES[t.type];
          const Icon = StyleConfig.icon;

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 animate-in slide-in-from-right-full fade-in",
                // НЕЙТРАЛЬНЫЙ ФОН: bg-card (белый/черный) и стандартный бордер
                "bg-card text-foreground border-border" 
              )}
            >
              {/* Цветная иконка в кружочке */}
              <div className={cn(
                "shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5", 
                StyleConfig.iconWrapper
              )}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-sm font-semibold leading-none tracking-tight">
                  {t.title}
                </h3>
                {t.message && (
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground opacity-50 hover:opacity-100 hover:bg-muted transition-colors -mr-1 -mt-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Хук для использования в компонентах
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
};