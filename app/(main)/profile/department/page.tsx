"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Save, ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Импортируем мок-данные
import { MOCK_USERS } from "@/lib/admin-mock";

export default function DepartmentSettingsPage() {
  const router = useRouter();

  // Состояния
  const [headId, setHeadId] = useState("u_4");
  const [isActingEnabled, setIsActingEnabled] = useState(false);
  const [actingId, setActingId] = useState("");

  const staff = MOCK_USERS.filter(u => u.role !== 'admin_system' && u.role !== 'guest');

  const handleSave = () => {
    alert("Настройки сохранены! Права доступа обновлены.");
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      
      {/* Шапка с кнопкой назад */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold">Терапевтическое отделение</h1>
            <p className="text-muted-foreground text-sm">Настройки управления и доступов</p>
        </div>
      </div>

      {/* Блок Руководителя */}
      <Card className="">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            {/* ИСПРАВЛЕНО: Иконка в едином стиле (как в настройках) */}
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
          
          {/* 1. Основной начальник */}
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
                        {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position})</span>
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 2. Логика И.О. (Deputy) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card">
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
                        {staff.filter(u => u.id !== headId).map(u => (
                            <SelectItem key={u.id} value={u.id}>
                                {u.name} <span className="text-muted-foreground text-xs ml-2">({u.position})</span>
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
        <Button size="lg" onClick={handleSave} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}