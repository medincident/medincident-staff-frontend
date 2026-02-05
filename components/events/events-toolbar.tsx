"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_STATUS_MAP } from "@/lib/constants";

export function EventsToolbar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Получаем текущие значения из URL
  const currentSearch = searchParams.get("query")?.toString();
  const currentStatus = searchParams.get("status")?.toString();

  // Функция обновления URL
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по коду, типу или описанию..."
          className="pl-9 bg-background focus-visible:ring-primary w-full"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Select 
        defaultValue={currentStatus || "all"} 
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-[220px] bg-background">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Статус" />
          </div>
        </SelectTrigger>
        <SelectContent className="border">
          <SelectItem value="all">Все статусы</SelectItem>
          {Object.entries(EVENT_STATUS_MAP).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}