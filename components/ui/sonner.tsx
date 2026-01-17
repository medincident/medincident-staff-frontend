"use client"

import { Toaster as Sonner } from "sonner"
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

export function Toaster() {
  return (
    <Sonner
      className="toaster group"
      // 1. Включаем выравнивание по верху, чтобы длинный текст не ломал верстку
      position="top-right" // В твоем коде было top-4 right-4
      expand={true} // Можно включить, чтобы они красиво раскрывались, или убрать

      // 2. Подставляем твои кастомные иконки с цветными подложками
      icons={{
        success: (
          <div className="h-8 w-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ),
        info: (
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Info className="h-5 w-5" />
          </div>
        ),
        warning: (
          <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        ),
        error: (
          <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
        ),
      }}

      // 3. Настраиваем саму карточку
      toastOptions={{
        unstyled: true, // Отключаем дефолтные стили Sonner, чтобы полностью контролировать вид
        classNames: {
          // Главный контейнер (повторяем твои стили: bg-card, border, p-4, gap-3)
          toast:
            "flex w-full items-start gap-3 p-4 rounded-xl border border-border bg-card text-foreground transition-all",

          // Контейнер текста (чтобы заголовок и описание были аккуратными)
          content: "flex-1 flex flex-col gap-1 min-w-0",

          // Заголовок
          title: "text-sm font-semibold leading-none tracking-tight pt-1", // pt-1 для выравнивания с иконкой

          // Описание
          description: "text-sm text-muted-foreground leading-relaxed",

          // Кнопка действия (если будет)
          actionButton: "bg-primary text-primary-foreground text-xs font-medium px-3 py-2 rounded-md",

          // Кнопка отмены
          cancelButton: "bg-muted text-muted-foreground text-xs font-medium px-3 py-2 rounded-md",

          // Кнопка закрытия (крестик)
          closeButton:
            "!bg-transparent !border-none !text-muted-foreground hover:!text-foreground hover:!bg-muted !top-4 !right-4",
        },
      }}
    />
  )
}