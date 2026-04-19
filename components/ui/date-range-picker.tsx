"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  /** Запретить даты раньше этой. */
  fromDate?: Date;
  /** Запретить даты позже этой. */
  toDate?: Date;
  align?: "start" | "center" | "end";
  /** Сколько месяцев показывать одновременно. По умолчанию 1 (как в референсе). */
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Выберите период",
  className,
  fromDate,
  toDate,
  align = "start",
  numberOfMonths = 1,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Staging-стейт: при открытии попапа начинаем с текущего значения.
  // Пользователь тыкает даты в календаре — меняется только staging, реальный
  // onChange вызывается только по «Применить».
  const [staged, setStaged] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    if (open) setStaged(value);
  }, [open, value]);

  const disabled: Matcher[] = [];
  if (fromDate) disabled.push({ before: fromDate });
  if (toDate) disabled.push({ after: toDate });

  const handleApply = () => {
    onChange(staged);
    setOpen(false);
  };

  const handleCancel = () => {
    setStaged(value);
    setOpen(false);
  };

  // Поведение клика по календарю. Если у нас уже выбран полный диапазон
  // (from + to), то новый клик не «двигает» один из концов — а сбрасывает
  // выделение и начинает новый диапазон от только что выбранной даты.
  // Так удобнее: одно тапание = новая стартовая точка.
  const handleSelect = (
    range: DateRange | undefined,
    selectedDay: Date,
  ) => {
    if (staged?.from && staged?.to) {
      setStaged({ from: selectedDay, to: undefined });
      return;
    }
    setStaged(range);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "d MMM y", { locale: ru })} —{" "}
                {format(value.to, "d MMM y", { locale: ru })}
              </>
            ) : (
              format(value.from, "d MMM y", { locale: ru })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align={align}>
        <Calendar
          mode="range"
          selected={staged}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          locale={ru}
          weekStartsOn={1}
          defaultMonth={staged?.from ?? value?.from ?? new Date()}
          disabled={disabled.length > 0 ? disabled : undefined}
        />

        {/* Футер: Применить / Отмена */}
        <div className="flex items-center gap-2 border-t p-3 bg-popover">
          <Button
            onClick={handleApply}
            size="sm"
            className="flex-1 uppercase tracking-wider font-bold"
            disabled={!staged?.from}
          >
            Применить
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="uppercase tracking-wider"
          >
            Отмена
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
