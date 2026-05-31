"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  align?: "start" | "center" | "end";
  disabled?: boolean;
  /** Кнопка «Очистить» в футере. */
  clearable?: boolean;
}

// Однодневный пикер по образцу DateRangePicker: тот же красивый Calendar в Popover,
// та же раскладка футера, тот же locale=ru и weekStartsOn=1.
export function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className,
  fromDate,
  toDate,
  align = "start",
  disabled,
  clearable = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [staged, setStaged] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    if (open) setStaged(value);
  }, [open, value]);

  const disabledMatchers: Matcher[] = [];
  if (fromDate) disabledMatchers.push({ before: fromDate });
  if (toDate) disabledMatchers.push({ after: toDate });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "d MMM y", { locale: ru }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align={align}>
        <Calendar
          mode="single"
          selected={staged}
          onSelect={setStaged}
          locale={ru}
          weekStartsOn={1}
          defaultMonth={staged ?? value ?? new Date()}
          disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
        />

        <div className="flex items-center gap-2 border-t p-3 bg-popover">
          <Button
            onClick={() => {
              onChange(staged);
              setOpen(false);
            }}
            size="sm"
            className="flex-1 uppercase tracking-wider font-bold"
            disabled={!staged}
          >
            Применить
          </Button>
          {clearable && (
            <Button
              onClick={() => {
                onChange(undefined);
                setStaged(undefined);
                setOpen(false);
              }}
              size="sm"
              variant="ghost"
              className="uppercase tracking-wider"
            >
              Очистить
            </Button>
          )}
          <Button
            onClick={() => {
              setStaged(value);
              setOpen(false);
            }}
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
