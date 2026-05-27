"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  value: string | number; // Разрешаем и числа в типах
  label: string;
  description?: string;
};

interface SearchableSelectProps {
  options: Option[];
  value?: string | number; // Разрешаем приходить числу
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  threshold?: number;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  emptyMessage = "Ничего не найдено",
  disabled = false,
  threshold = 5,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  // value у HTML-селекта — всегда строка, поэтому приводим заранее.
  const stringValue = value !== undefined && value !== null ? String(value) : "";
  const selectedLabel = options.find((o) => String(o.value) === stringValue)?.label;

  // Режим простого списка
  if (options.length <= threshold) {
    return (
      <Select disabled={disabled} value={stringValue} onValueChange={onChange}>
        <SelectTrigger
          style={{ height: 36, whiteSpace: "nowrap", overflow: "hidden" }}
          className={cn(
            "w-full bg-background text-foreground border-input transition-colors",
            "hover:border-primary",
            "focus:ring-0 focus:ring-offset-0 focus:border-primary",
            "min-w-0 text-left",
            !stringValue && "text-muted-foreground",
          )}
        >
          <SelectValue placeholder={placeholder}>
            <span
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1,
                textAlign: "left",
              }}
            >
              {selectedLabel || placeholder}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border w-[var(--radix-select-trigger-width)]">
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                // Индикатор-галка слева для единообразия с combobox.
                className="cursor-pointer items-start whitespace-normal focus:bg-accent focus:text-accent-foreground pl-8 pr-2 [&>span:first-child]:left-2 [&>span:first-child]:right-auto [&>span:first-child]:top-1/2 [&>span:first-child]:-translate-y-1/2"
              >
                <div className="flex flex-col min-w-0 w-full text-left gap-0.5">
                  <span className="line-clamp-1 break-all">{option.label}</span>
                  {option.description && (
                    <span className="line-clamp-1 break-all text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Нет доступных вариантов
            </div>
          )}
        </SelectContent>
      </Select>
    );
  }

  // Режим combobox с поиском (опций больше threshold)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-background font-normal border-input transition-colors overflow-hidden",
            "hover:bg-background hover:text-foreground hover:border-primary",
            "focus:ring-0 focus:ring-offset-0 focus:border-primary",
            !stringValue && "text-muted-foreground",
          )}
        >
          <span className="truncate flex-1 text-left min-w-0 pr-2">
            {stringValue ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 bg-popover border-border"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command
          // value у CommandItem — "label | description", чтобы поиск работал
          // и по описанию (см. ниже).
          filter={(val, search) =>
            val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
          className="bg-popover text-popover-foreground w-full"
        >
          <CommandInput placeholder="Поиск..." className="h-9 border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.description ? `${option.label} | ${option.description}` : option.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    onChange(String(option.value));
                    setOpen(false);
                  }}
                  className="cursor-pointer items-start aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 mt-0.5 shrink-0",
                      stringValue === String(option.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1 text-left gap-0.5">
                    <span className="line-clamp-1 break-all">{option.label}</span>
                    {option.description && (
                      <span className="line-clamp-1 break-all text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}