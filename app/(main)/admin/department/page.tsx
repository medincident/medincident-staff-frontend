"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  ShieldAlert, 
  Loader2, 
  UserCheck 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { User } from "@/lib/types";

const ROLE_NAMES: Record<string, string> = {
  admin: "Администратор",
  manager: "Заведующий",
  employee: "Сотрудник",
};

export default function DepartmentSettingsPage() {
  // Settings State
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
        // Вернул твой путь к API
        const res = await fetch("/api/admin/department");
        if (res.ok) {
          const data = await res.json();
          setHeadId(data.settings.headId || "");
          setIsActingEnabled(data.settings.isActingEnabled || false);
          setActingId(data.settings.actingId || "");
          setDepartmentName(data.settings.departmentName || "Настройки отделения");
          setStaff(data.staff || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Ошибка загрузки");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Вернул твой путь к API
      const res = await fetch("/api/admin/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headId,
          isActingEnabled,
          actingId: isActingEnabled ? actingId : ""
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Изменения сохранены", { description: "Структура управления обновлена." });
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-48" /> : departmentName}
            </h1>
            <p className="text-sm text-muted-foreground">Управление заведующими и доступом</p>
        </div>
        
        {/* Кнопка всегда на месте, но неактивна при загрузке/сохранении */}
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
        </Button>
      </div>

      {isLoading ? (
        /* SKELETON STATE */
        <div className="space-y-6">
           <div className="border rounded-xl bg-card p-6 space-y-6">
              <div className="space-y-2">
                 <Skeleton className="h-5 w-48" />
                 <Skeleton className="h-10 w-full sm:w-100" />
              </div>
              <Separator />
              <div className="flex justify-between items-center p-4 border rounded-xl">
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                 </div>
                 <Skeleton className="h-6 w-12 rounded-full" />
              </div>
           </div>
        </div>
      ) : (
        /* REAL CONTENT */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Руководство
              </CardTitle>
              <CardDescription>Назначение ответственных лиц</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Head Selection */}
              <div className="grid gap-3">
                <Label className="text-base font-medium">Заведующий отделением</Label>
                <p className="text-sm text-muted-foreground">Имеет полный доступ к управлению заявками и графиком.</p>
                <Select value={headId} onValueChange={setHeadId}>
                  <SelectTrigger className="w-full sm:w-100">
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position || ROLE_NAMES[u.role] || u.role})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Acting Mode */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-card transition-colors hover:bg-accent/5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Режим замещения (И.О.)</Label>
                    <p className="text-xs text-muted-foreground max-w-100">
                      Включите на время отпуска или болезни, чтобы временно передать права другому сотруднику.
                    </p>
                  </div>
                  <Switch
                    checked={isActingEnabled}
                    onCheckedChange={setIsActingEnabled}
                  />
                </div>

                {isActingEnabled && (
                  <div className="p-5 bg-warning/10 border border-warning/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold text-warning-foreground">Исполняющий обязанности</Label>
                        <Badge variant="outline" className="text-[10px] bg-warning/20 text-warning-foreground border-warning/30 px-2 py-0.5">
                          Временный доступ
                        </Badge>
                      </div>

                      <Select value={actingId} onValueChange={setActingId}>
                        <SelectTrigger className="w-full sm:w-100 bg-background">
                          <SelectValue placeholder="Выберите заместителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.filter(u => u.id !== headId).map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position || ROLE_NAMES[u.role] || u.role})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-3 items-start text-xs text-muted-foreground bg-background/50 p-3 rounded-md">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                        <p>
                          Сотрудник получит права заведующего. История действий будет сохранена под его аккаунтом. 
                          Не забудьте отключить режим после возвращения основного руководителя.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}