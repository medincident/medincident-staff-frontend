"use client";

import React, { useState } from "react";
import { UserCog, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function DepartmentSettingsPage() {
  // const { toast } = useToast();
  
  // Состояния
  const [headId, setHeadId] = useState("u_1"); // Текущий начальник
  const [isActingEnabled, setIsActingEnabled] = useState(false); // Режим замещения
  const [actingId, setActingId] = useState(""); // Кто замещает

  const handleSave = () => {
    // В реальности здесь вызов API
    console.log("Saving settings:", { headId, isActingEnabled, actingId });
    alert("Настройки сохранены! Права доступа обновлены.");
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки Терапевтического отделения</h1>
        <p className="text-muted-foreground">Управление руководством и доступом</p>
      </div>

      {/* Блок Руководителя */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Руководство отделением
          </CardTitle>
          <CardDescription>
            Настройка основного руководителя и временно исполняющего обязанности (И.О.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 1. Основной начальник */}
          <div className="grid gap-2">
            <Label className="text-base">Заведующий отделением</Label>
            <div className="text-xs text-muted-foreground mb-1">
              Постоянная должность. Имеет полный доступ ко всем заявкам и НС отделения.
            </div>
            <Select value={headId} onValueChange={setHeadId}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="u_1">Иванов Иван Иванович</SelectItem>
                <SelectItem value="u_2">Смирнова Анна Петровна</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 2. Логика И.О. (Deputy) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Режим замещения (Отпуск/Болезнь)</Label>
                <div className="text-xs text-muted-foreground">
                  Включите, чтобы передать права руководителя другому сотруднику временно.
                </div>
              </div>
              <Switch 
                checked={isActingEnabled} 
                onCheckedChange={setIsActingEnabled} 
              />
            </div>

            {isActingEnabled && (
              <div className="p-4 bg-muted/50 rounded-lg border animate-in fade-in zoom-in-95 duration-200">
                 <div className="grid gap-2">
                    <Label>Исполняющий обязанности (И.О.)</Label>
                    <Select value={actingId} onValueChange={setActingId}>
                      <SelectTrigger className="max-w-md bg-background">
                        <SelectValue placeholder="Выберите заместителя" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="u_5">Петров Василий (Врач)</SelectItem>
                        <SelectItem value="u_6">Сидорова Елена (Старшая медсестра)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      <span className="font-bold text-orange-600">Внимание:</span> Выбранный сотрудник получит права просмотра заявок и НС руководителя, пока переключатель активен.
                    </p>
                 </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}