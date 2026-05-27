"use client";

import { useState } from "react";
import { Building, Check, ChevronDown } from "lucide-react";

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
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { cn } from "@/lib/utils";

// Виден всегда. Список орг — из ActiveOrgProvider (employments / все для sysadmin).
export function OrgScopePicker() {
  const { orgId, setOrgId, isResolving, availableOrgs } = useActiveOrgId();
  const [open, setOpen] = useState(false);

  if (isResolving) {
    return <div className="h-9 rounded-md bg-muted/40 animate-pulse" aria-hidden />;
  }

  const currentName =
    availableOrgs.find((o) => o.id === orgId)?.name ??
    (orgId ? "—" : "Выберите организацию");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-9 px-2.5 text-sm font-normal"
          aria-label="Активная организация"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Building className="h-4 w-4 text-primary shrink-0" />
            <span className={cn("truncate", !orgId && "text-muted-foreground")}>{currentName}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 bg-popover"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Поиск..." className="h-9 border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>Организации не найдены</CommandEmpty>
            <CommandGroup>
              {availableOrgs.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.name ?? ""}
                  onSelect={() => {
                    setOrgId(o.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      orgId === o.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{o.name || "—"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
