"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Save, ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Updated Imports
import { User } from "@/lib/types";
import { ROLE_NAMES } from "@/lib/constants";

export default function DepartmentSettingsPage() {
  const router = useRouter();

  // State for settings
  const [headId, setHeadId] = useState("");
  const [isActingEnabled, setIsActingEnabled] = useState(false);
  const [actingId, setActingId] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  // Data State
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/settings/department");

        if (res.ok) {
          const data = await res.json();
          // Extract settings
          setHeadId(data.settings.headId || "");
          setIsActingEnabled(data.settings.isActingEnabled || false);
          setActingId(data.settings.actingId || "");
          setDepartmentName(data.settings.departmentName || "Мое отделение");

          // Extract staff list
          setStaff(data.staff || []);
        } else {
          throw new Error("Failed to load");
        }
      } catch (error) {
        toast.error("Ошибка", { description: "Не удалось загрузить настройки" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/settings/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headId,
          isActingEnabled,
          // If acting mode is disabled, we clear the ID on save
          actingId: isActingEnabled ? actingId : ""
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success("Настройки сохранены", { description: "Права доступа и структура отдела обновлены." });
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось сохранить изменения" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- SKELETON LOADING ---
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto pb-20 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground">
          <div className="p-6 pb-4 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="p-6 pt-0 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <Separator />
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{departmentName}</h1>
          <p className="text-muted-foreground text-sm">Настройки управления и доступов</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
              <UserCog className="h-5 w-5" />
            </div>
            Руководство отделением
          </CardTitle>
          <CardDescription>
            Назначение заведующего и временно исполняющего обязанности (И.О.)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Section: Head of Department */}
          <div className="grid gap-3">
            <Label className="text-base font-medium">Заведующий отделением</Label>
            <div className="text-sm text-muted-foreground mb-1">
              Основная должность. Имеет полный доступ ко всем заявкам, табелям и инцидентам отделения.
            </div>
            <Select value={headId} onValueChange={setHeadId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position || ROLE_NAMES[u.role]})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Section: Acting Head (Substitution) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card transition-colors hover:bg-accent/5">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Режим замещения</Label>
                <div className="text-xs text-muted-foreground max-w-[300px] sm:max-w-none">
                  Включите на время отпуска или болезни, чтобы временно делегировать права руководителя.
                </div>
              </div>
              <Switch
                checked={isActingEnabled}
                onCheckedChange={setIsActingEnabled}
              />
            </div>

            {isActingEnabled && (
              <div className="p-5 bg-warning/10 border border-warning/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="font-semibold">Исполняющий обязанности (И.О.)</Label>
                    <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20 px-1.5 py-0 h-5">
                      Временный доступ
                    </Badge>
                  </div>

                  <Select value={actingId} onValueChange={setActingId}>
                    <SelectTrigger className="max-w-md bg-background">
                      <SelectValue placeholder="Выберите заместителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Exclude current head from selection */}
                      {staff.filter(u => u.id !== headId).map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position || ROLE_NAMES[u.role]})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2 items-start mt-2 text-xs text-warning">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-foreground/80">
                      Выбранный сотрудник получит расширенные права доступа (просмотр всех заявок отдела, подтверждение работ) до тех пор, пока этот режим включен.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}