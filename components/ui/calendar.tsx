"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import styles from "./calendar.module.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Календарь на react-day-picker v9 в стилистике сайта.
 *
 * Хедер: заголовок месяца слева (uppercase + primary), круглые outline-кнопки
 * навигации справа — лежат в одной строке. Под хедером — горизонтальная линия
 * во всю ширину поповера (зеркалит линию перед футером Применить/Отмена).
 *
 * Ячейки дней — квадраты w-9 h-9 без зазоров (соседние ячейки касаются).
 * При ховере заливается вся ячейка (bg-accent, без скруглений). При выборе
 * одного дня ячейка получает rounded-md. В диапазоне у концов скруглены
 * только внешние стороны (внутренние углы «съедаются» CSS-правилом ниже),
 * середина — bg-primary/15 без скруглений → получается непрерывная полоса.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // Якорь для CSS-правил из calendar.module.css (добивают скругления концов диапазона).
        styles.root,
        "relative px-4 pb-4 bg-popover text-popover-foreground",
        className,
      )}
      classNames={{
        // Контейнеры
        months: "flex flex-col sm:flex-row gap-6",
        month: "flex flex-col gap-3",

        // Шапка фиксированной высоты, border-b зеркалит футер «Применить/Отмена».
        month_caption:
          "h-[54px] flex items-center -mx-4 px-4 border-b border-border",
        caption_label:
          "text-primary text-sm font-bold uppercase tracking-wider select-none",

        // Nav: та же высота, что у шапки — кнопки центрируются с заголовком.
        nav: "absolute top-0 right-4 z-10 flex items-center gap-1.5 h-[54px]",
        button_previous: cn(
          "inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-full",
          "border border-input bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "disabled:opacity-30 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),
        button_next: cn(
          "inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-full",
          "border border-input bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "disabled:opacity-30 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),

        // Сетка
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-9 h-8 font-semibold text-[0.7rem] uppercase tracking-wider select-none flex items-center justify-center",
        // Без mt — строки чисел касаются друг друга вертикально.
        week: "flex w-full",

        // Ячейка дня. rdp-day сохраняем как селектор-хук для CSS в globals.css.
        day: "rdp-day relative w-9 h-9 p-0 text-center text-sm",

        // По дефолту квадрат. Ховер ярче range_middle, чтобы читался на фоне диапазона.
        day_button: cn(
          "rdp-day_button",
          "w-9 h-9 p-0 font-normal text-foreground",
          "inline-flex items-center justify-center",
          "hover:bg-primary/30 hover:text-foreground transition-colors",
          "disabled:opacity-40 disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),

        // Выбранный / концы диапазона: solid primary, на ховере не меняется.
        selected: cn(
          "rdp-selected",
          "bg-primary! text-primary-foreground! rounded-md!",
          "hover:bg-primary! hover:text-primary-foreground!",
        ),
        // Середина диапазона: разбавленная primary без скругления.
        range_middle: cn(
          "rdp-range_middle",
          "bg-primary/15! text-foreground! rounded-none!",
          "hover:bg-primary/15! hover:text-foreground!",
        ),
        // Концы диапазона. Случай from===to (single-day) добивается CSS-правилом в globals.css.
        range_start: cn("rdp-range_start", "rounded-r-none!"),
        range_end: cn("rdp-range_end", "rounded-l-none!"),

        today: "font-bold text-primary",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 opacity-50",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconCn }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-4", iconCn)} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
