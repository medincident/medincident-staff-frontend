"use client";

import { useEffect, useState } from "react";
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
import { OrgStructureQueryServiceService } from "@/lib/api-generated";
import { useActiveOrgId, type ActiveOrg } from "@/lib/auth/active-org-context";
import { cn } from "@/lib/utils";

// Locked → плашка без выпадайки. Мульти-орг → выпадайка из myOrgs.
// Sysadmin (нет employee-карточек) → выпадайка со всеми орг.
export function OrgScopePicker() {
  const { orgId, setOrgId, isLocked, isResolving, myOrgs } = useActiveOrgId();
  const [allOrgs, setAllOrgs] = useState<ActiveOrg[]>([]);
  const [open, setOpen] = useState(false);

  const isSysadminPicker = !isLocked && myOrgs.length === 0;
  useEffect(() => {
    if (isResolving) return;
    if (!isSysadminPicker) return;
    OrgStructureQueryServiceService.orgStructureQueryServiceListOrganizations(100)
      .then((res) => {
        const items = ((res as any)?.items ?? []) as Array<{ id?: string; name?: string }>;
        setAllOrgs(
          items
            .filter((o) => o.id)
            .map((o) => ({ id: o.id as string, name: o.name })),
        );
      })
      .catch(() => setAllOrgs([]));
  }, [isResolving, isSysadminPicker]);

  if (isResolving) {
    return <div className="h-9 rounded-md bg-muted/40 animate-pulse" aria-hidden />;
  }

  const shownOrgs: ActiveOrg[] = isSysadminPicker ? allOrgs : myOrgs;
  const currentName =
    shownOrgs.find((o) => o.id === orgId)?.name ??
    (orgId ? "—" : "Выберите организацию");

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/40 text-xs">
        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="truncate text-foreground" title={currentName}>{currentName}</span>
      </div>
    );
  }

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
              {shownOrgs.map((o) => (
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
