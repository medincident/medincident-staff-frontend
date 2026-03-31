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

  // !!! ГЛАВНОЕ ИСПРАВЛЕНИЕ !!!
  // Приводим текущее значение к строке для корректного сравнения,
  // так как value селектов всегда строки в HTML.
  const stringValue = value !== undefined && value !== null ? String(value) : "";

  // 1. Режим простого списка (мало элементов)
  if (options.length <= threshold) {
    return (
      <Select 
        disabled={disabled} 
        value={stringValue} // Используем строковое значение
        onValueChange={onChange}
      >
        <SelectTrigger 
          className={cn(
            "w-full bg-background text-foreground border-input transition-colors",
            "hover:border-primary",
            "focus:ring-0 focus:ring-offset-0 focus:border-primary",
            !stringValue && "text-muted-foreground"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)} // Гарантируем строку в value
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                {option.label}
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

  // 2. Режим поиска (Combobox)
  
  // Ищем лейбл, сравнивая значения как строки
  const selectedLabel = options.find((opt) => String(opt.value) === stringValue)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-background font-normal border-input transition-colors",
            "hover:bg-background hover:text-foreground hover:border-primary",
            "focus:ring-0 focus:ring-offset-0 focus:border-primary",
            !stringValue && "text-muted-foreground",
            "overflow-hidden" 
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
             filter={(val, search) => {
                // val здесь - это label опции (так работает Command по умолчанию), 
                // если не переопределено filter
                if (val.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
             }}
             className="bg-popover text-popover-foreground w-full"
        >
          <CommandInput 
            placeholder="Поиск..." 
            className="h-9 border-none focus:ring-0" 
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label} 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    onChange(String(option.value)); // Возвращаем всегда строку
                    setOpen(false);
                  }}
                  className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      // Сравниваем как строки
                      stringValue === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}