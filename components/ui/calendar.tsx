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
        // styles.root — хешированный класс из calendar.module.css; служит
        // якорем для локальных CSS-правил, которые добивают скругления
        // концов диапазона (см. файл рядом). Не полагаемся на дефолтный
        // rdp-root v9 — он может не дойти до DOM при кастомном className-пропе.
        styles.root,
        "relative px-4 pb-4 bg-popover text-popover-foreground",
        className,
      )}
      classNames={{
        // Контейнеры
        months: "flex flex-col sm:flex-row gap-6",
        month: "flex flex-col gap-3",

        // Шапка: фиксированная высота 54px, контент центрирован по вертикали
        // (items-center). -mx-4 + px-4 растягивает border-b во всю ширину
        // поповера — линия зеркалит border-t у футера Применить/Отмена.
        month_caption:
          "h-[54px] flex items-center -mx-4 px-4 border-b border-border",
        caption_label:
          "text-primary text-sm font-bold uppercase tracking-wider select-none",

        // Nav. Та же высота 54px и items-center → круглые кнопки навигации
        // лежат строго по центру шапки на одной горизонтали с заголовком.
        // top-0 → корень не имеет pt, шапка начинается с нулевой Y.
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

        // Кнопка дня по дефолту — БЕЗ скругления (квадрат). Ховер заливает
        // всю ячейку primary/30 — это та же primary что и у range_middle
        // (primary/15), только ярче, чтобы хорошо читалась подсветка
        // потенциального следующего клика на фоне уже выбранного диапазона.
        day_button: cn(
          "rdp-day_button",
          "w-9 h-9 p-0 font-normal text-foreground",
          "inline-flex items-center justify-center",
          "hover:bg-primary/30 hover:text-foreground transition-colors",
          "disabled:opacity-40 disabled:hover:bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),

        // Выбранный день / концы диапазона — solid primary, скругление со
        // всех сторон. Hover оставляет тот же bg-primary, чтобы на уже
        // выбранных днях ховер ничего не менял (как просил пользователь).
        selected: cn(
          "rdp-selected",
          "bg-primary! text-primary-foreground! rounded-md!",
          "hover:bg-primary! hover:text-primary-foreground!",
        ),
        // Промежуточные дни диапазона — та же primary, но «разбавленная»,
        // без скругления (соседние ячейки сливаются в полосу). На ховере
        // эти дни тоже не меняются (это «выбранные» дни).
        range_middle: cn(
          "rdp-range_middle",
          "bg-primary/15! text-foreground! rounded-none!",
          "hover:bg-primary/15! hover:text-foreground!",
        ),
        // Концы диапазона. Tailwind-утилиты пишутся прямо в classNames
        // модификатора → попадут на тот элемент, куда v9 повесит сам
        // модификатор-класс (button или td). Если на button — утилита
        // сработает напрямую; если на td — её добьёт CSS-фоллбек в
        // globals.css через нисходящий селектор `.rdp-day.rdp-range_* > .rdp-day_button`.
        // Кейс from===to (single-day range) обрабатывается отдельным CSS-правилом
        // в globals.css, которое возвращает rounded-md когда оба класса висят
        // на одном элементе.
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
