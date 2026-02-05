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
import { ROLE_NAMES } from "@/lib/constants";

// Импортируем наши сервисы
import { getDepartmentData, saveDepartmentSettings } from "@/lib/services/admin/department";

export function DepartmentView() {
  // --- STATE ---
  const [headId, setHeadId] = useState("");
  const [isActingEnabled, setIsActingEnabled] = useState(false);
  const [actingId, setActingId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [staff, setStaff] = useState<User[]>([]);

  // Состояния загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. ЗАГРУЗКА ДАННЫХ (Client-side)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getDepartmentData();
        
        // Инициализация формы
        setHeadId(data.settings.headId || "");
        setIsActingEnabled(data.settings.isActingEnabled || false);
        setActingId(data.settings.actingId || "");
        setDepartmentName(data.settings.departmentName || "Настройки отделения");
        setStaff(data.staff || []);
      } catch (error) {
        console.error("Failed to load department data:", error);
        toast.error("Ошибка", { description: "Не удалось загрузить данные отделения" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. СОХРАНЕНИЕ ДАННЫХ
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const payload = {
        headId,
        isActingEnabled,
        actingId: isActingEnabled ? actingId : "", // Если выключено, очищаем ID
        departmentName
      };

      await saveDepartmentSettings(payload);

      toast.success("Изменения сохранены", { description: "Структура управления обновлена." });
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Ошибка сохранения", { description: "Проверьте соединение с сервером" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSelectItem = (u: User) => (
    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
       <div className="flex flex-col sm:flex-row sm:items-center w-full max-w-60 sm:max-w-md overflow-hidden text-left">
         <span className="truncate text-sm font-normal text-foreground">{u.name}</span>
         <span className="truncate text-muted-foreground text-xs sm:ml-2">
           ({u.position || ROLE_NAMES[u.role] || u.role})
         </span>
       </div>
    </SelectItem>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
            <h1 className="text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-64 rounded-md" /> : departmentName}
            </h1>
            <p className="text-sm text-muted-foreground">Управление заведующими и доступом</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
        </Button>
      </div>

      {isLoading ? (
        /* --- SKELETON STATE --- */
        <div className="max-w-4xl space-y-6">
           <div className="border rounded-xl bg-card p-6 space-y-6">
             {/* Заголовок карточки */}
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <Skeleton className="h-5 w-5 rounded-full" />
                   <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48 opacity-60" />
             </div>

             {/* Поле выбора заведующего */}
             <div className="space-y-3 pt-2">
                <Skeleton className="h-5 w-40" /> 
                <Skeleton className="h-4 w-full sm:w-96 opacity-60" /> 
                <Skeleton className="h-10 w-full sm:w-[400px] rounded-md" />
             </div>

             <Separator />

             {/* Блок переключателя */}
             <div className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full sm:w-80 opacity-60" />
                  <Skeleton className="h-4 w-full sm:w-80 opacity-60" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full shrink-0 mt-2 sm:mt-0" />
              </div>
           </div>
        </div>
      ) : (
        /* --- REAL CONTENT --- */
        <div className="max-w-4xl space-y-6">
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
                  <SelectTrigger className="w-full sm:w-100 h-auto min-h-12 sm:min-h-10 py-3 sm:py-2 px-4 bg-background text-left">
                    <div className="truncate w-full pr-2">
                        <SelectValue placeholder="Выберите сотрудника" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-w-[90vw] sm:max-w-none max-h-[40vh]">
                    {staff.map(renderSelectItem)}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Acting Mode */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-card transition-colors hover:bg-accent/5">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Режим замещения (И.О.)</Label>
                    <p className="text-xs text-muted-foreground max-w-[400px] leading-relaxed">
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
                        <Label className="font-semibold text-foreground">Исполняющий обязанности</Label>
                        <Badge variant="outline" className="text-[10px] bg-warning/20 text-muted-foreground border-warning/30 px-2 py-0.5">
                          Временный доступ
                        </Badge>
                      </div>

                      <Select value={actingId} onValueChange={setActingId}>
                        <SelectTrigger className="w-full sm:w-100 h-auto min-h-12 sm:min-h-10 py-3 sm:py-2 px-4 bg-background text-left">
                          <div className="truncate w-full pr-2">
                             <SelectValue placeholder="Выберите заместителя" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-w-[90vw] sm:max-w-none max-h-[40vh]">
                          {staff.filter(u => u.id !== headId).map(renderSelectItem)}
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