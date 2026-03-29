"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  ShieldAlert, 
  Loader2, 
  UserCheck,
  Settings,
  Power,
  PowerOff
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
import { Input } from "@/components/ui/input";
import { DepartmentsService } from "@/lib/api";

export function DepartmentView() {
  // --- STATE ---
  const [headId, setHeadId] = useState("");
  const [isActingEnabled, setIsActingEnabled] = useState(false);
  const [actingId, setActingId] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [staff, setStaff] = useState<User[]>([]);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Состояния загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const departmentId = "YOUR_DEPARTMENT_ID";

  // 1. ЗАГРУЗКА ДАННЫХ (Client-side)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [deptData, staffData, responsiblesData] = await Promise.all([
          DepartmentsService.getDepartmentById(departmentId),
          DepartmentsService.listDepartmentEmployees(departmentId, undefined, undefined, 100),
          DepartmentsService.listDepartmentResponsibles(departmentId)
        ]);
        
        setDepartmentName(deptData.name || "Настройки отделения");
        setDescription(deptData.description || ""); // НОВОЕ
        setIsActive(deptData.isActive ?? true);     // НОВОЕ
        
        const mappedStaff = staffData.items.map(emp => ({
          ...emp.user,
          position: emp.position
        }));
        setStaff(mappedStaff as any);

        const directResponsibles = responsiblesData.items
          .filter(r => r.isDirectlyAssigned)
          .map(r => r.user.id);

        setHeadId(directResponsibles[0] || "");
        if (directResponsibles.length > 1) {
          setIsActingEnabled(true);
          setActingId(directResponsibles[1]);
        } else {
          setIsActingEnabled(false);
          setActingId("");
        }
      } catch (error) {
        toast.error("Ошибка", { description: "Не удалось загрузить данные отделения" });
      } finally {
        setIsLoading(false);
      }
    };

    if (departmentId) loadData();
  }, [departmentId]);

  // 2. СОХРАНЕНИЕ ДАННЫХ
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Обновляем основные данные отделения
      await DepartmentsService.updateDepartment(departmentId, {
        name: departmentName,
        description: description || null
      });
      
      const newResponsibleIds = [headId];
      if (isActingEnabled && actingId) newResponsibleIds.push(actingId);
      const validNewIds = newResponsibleIds.filter(Boolean);

      const currentResponsibles = await DepartmentsService.listDepartmentResponsibles(departmentId);
      const currentDirectIds = currentResponsibles.items
        .filter(r => r.isDirectlyAssigned)
        .map(r => r.user.id);

      const toRemove = currentDirectIds.filter(id => !validNewIds.includes(id));
      const toAdd = validNewIds.filter(id => !currentDirectIds.includes(id));

      for (const id of toRemove) {
        await DepartmentsService.removeDepartmentResponsible(departmentId, id);
      }
      for (const id of toAdd) {
        await DepartmentsService.addDepartmentResponsible(departmentId, { userId: id });
      }

      toast.success("Изменения сохранены", { description: "Отделение и структура управления обновлены." });
    } catch (error) {
      toast.error("Ошибка сохранения", { description: "Проверьте соединение с сервером" });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. ПЕРЕКЛЮЧЕНИЕ СТАТУСА (Деактивация/Активация)
  const toggleStatus = async () => {
    try {
      setIsTogglingStatus(true);
      if (isActive) {
        await DepartmentsService.deactivateDepartment(departmentId);
        toast.success("Отделение деактивировано");
      } else {
        await DepartmentsService.reactivateDepartment(departmentId);
        toast.success("Отделение активировано");
      }
      setIsActive(!isActive);
    } catch (error) {
      toast.error("Ошибка", { description: "Не удалось изменить статус отделения" });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const renderSelectItem = (u: any) => (
    <SelectItem key={u.id} value={u.id} className="cursor-pointer">
       <div className="flex flex-col sm:flex-row sm:items-center w-full max-w-60 sm:max-w-md overflow-hidden text-left">
         <span className="truncate text-sm font-normal text-foreground">{u.name}</span>
         <span className="truncate text-muted-foreground text-xs sm:ml-2">
           ({u.position || "Сотрудник"})
         </span>
       </div>
    </SelectItem>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-8 w-64 rounded-md" /> : departmentName}
              </h1>
              {!isLoading && (
                <Badge variant={isActive ? "default" : "destructive"}>
                  {isActive ? "Активно" : "Деактивировано"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Управление настройками и доступом отделения</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2">
          {!isLoading && (
            <Button 
              variant={isActive ? "outline" : "secondary"} 
              onClick={toggleStatus} 
              disabled={isTogglingStatus || isSaving}
              className="w-full sm:w-auto"
            >
              {isTogglingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
               isActive ? <PowerOff className="mr-2 h-4 w-4 text-destructive" /> : <Power className="mr-2 h-4 w-4 text-emerald-500" />}
              {isActive ? "Деактивировать" : "Активировать"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Сохранить
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-4xl space-y-6">
           <Skeleton className="h-[200px] w-full rounded-xl" />
           <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Общие настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label>Название отделения</Label>
                <Input 
                  value={departmentName} 
                  onChange={(e) => setDepartmentName(e.target.value)} 
                  placeholder="Например: Кардиология" 
                />
              </div>
              <div className="grid gap-3">
                <Label>Описание отделения</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Дополнительная информация (необязательно)" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Leadership Settings (старая карточка) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Руководство
              </CardTitle>
              <CardDescription>Назначение ответственных лиц</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
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