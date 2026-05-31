"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  align?: "start" | "center" | "end";
  disabled?: boolean;
  clearable?: boolean;
}

// Дата + время. Календарь — наш стилизованный, время — нативный <input type="time">
// (для HH:MM нет смысла строить кастом — у браузера хорошие компоненты на всех платформах).
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Выберите дату и время",
  className,
  fromDate,
  toDate,
  align = "start",
  disabled,
  clearable = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [stagedDate, setStagedDate] = React.useState<Date | undefined>(value);
  const [stagedTime, setStagedTime] = React.useState<string>(
    value ? format(value, "HH:mm") : "00:00",
  );

  React.useEffect(() => {
    if (open) {
      setStagedDate(value);
      setStagedTime(value ? format(value, "HH:mm") : "00:00");
    }
  }, [open, value]);

  const disabledMatchers: Matcher[] = [];
  if (fromDate) disabledMatchers.push({ before: fromDate });
  if (toDate) disabledMatchers.push({ after: toDate });

  const handleApply = () => {
    if (!stagedDate) {
      onChange(undefined);
      setOpen(false);
      return;
    }
    const [h, m] = stagedTime.split(":").map((s) => parseInt(s, 10) || 0);
    const out = new Date(stagedDate);
    out.setHours(h, m, 0, 0);
    onChange(out);
    setOpen(false);
  };

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
          {value
            ? format(value, "d MMM y, HH:mm", { locale: ru })
            : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align={align}>
        <Calendar
          mode="single"
          selected={stagedDate}
          onSelect={setStagedDate}
          locale={ru}
          weekStartsOn={1}
          defaultMonth={stagedDate ?? value ?? new Date()}
          disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
        />

        <div className="border-t p-3 bg-popover space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider shrink-0">
              Время
            </Label>
            <Input
              type="time"
              value={stagedTime}
              onChange={(e) => setStagedTime(e.target.value)}
              className="w-32"
              step={60}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleApply}
              size="sm"
              className="flex-1 uppercase tracking-wider font-bold"
              disabled={!stagedDate}
            >
              Применить
            </Button>
            {clearable && (
              <Button
                onClick={() => {
                  onChange(undefined);
                  setStagedDate(undefined);
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
                setStagedDate(value);
                setStagedTime(value ? format(value, "HH:mm") : "00:00");
                setOpen(false);
              }}
              size="sm"
              variant="outline"
              className="uppercase tracking-wider"
            >
              Отмена
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
