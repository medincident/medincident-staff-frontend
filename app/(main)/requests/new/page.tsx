"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

import { SERVICE_TYPES_MAP } from "@/lib/types";

// Схема валидации
const formSchema = z.object({
  type: z.string().min(1, { message: "Выберите тип работ" }),
  priority: z.enum(["normal", "urgent", "critical"] as const, {
    message: "Укажите приоритет",
  }),
  location: z.string().min(3, { message: "Укажите кабинет или место" }),
  description: z.string().min(10, { message: "Опишите проблему подробнее (минимум 10 символов)" }),
});

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedEventId = searchParams.get("linked_event"); // Получаем ID НС из URL
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      priority: "normal",
      location: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Имитация отправки
    console.log("Отправка заявки:", { ...values, linkedEventId });
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard"); // Или на страницу заявки
    }, 1000);
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Шапка */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Новая техническая заявка</h1>
      </div>

      {/* Уведомление о связи с НС */}
      {linkedEventId && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3 text-orange-800">
           <div className="mt-0.5">⚠️</div>
           <div className="text-sm">
             <span className="font-semibold">Создание на основании НС #{linkedEventId}.</span>
             <br />
             Эта заявка будет автоматически привязана к инциденту.
           </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card>
            <CardContent className="pt-6 space-y-6">
              
              {/* Тип работ */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Какая служба требуется?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SERVICE_TYPES_MAP).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Местоположение */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Местоположение</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Например: Кабинет 305, 3 этаж" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Укажите корпус, этаж и кабинет</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Приоритет */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Приоритет</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        {/* Normal */}
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="normal" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-all">
                             <span className="text-lg mb-1">📅</span>
                             <span className="font-semibold text-sm">Обычный</span>
                             <span className="text-[10px] text-muted-foreground text-center">В порядке очереди (до 3 дней)</span>
                          </FormLabel>
                        </FormItem>

                        {/* Urgent */}
                        <FormItem className="flex items-center space-x-3 space-y-0">
                           <FormControl>
                            <RadioGroupItem value="urgent" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 w-full cursor-pointer transition-all">
                             <span className="text-lg mb-1">🔥</span>
                             <span className="font-semibold text-sm text-orange-600">Срочный</span>
                             <span className="text-[10px] text-muted-foreground text-center">Затрудняет работу (до 24 часов)</span>
                          </FormLabel>
                        </FormItem>

                        {/* Critical */}
                        <FormItem className="flex items-center space-x-3 space-y-0">
                           <FormControl>
                            <RadioGroupItem value="critical" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 w-full cursor-pointer transition-all">
                             <span className="text-lg mb-1">🆘</span>
                             <span className="font-semibold text-sm text-red-600">Авария</span>
                             <span className="text-[10px] text-muted-foreground text-center">Угроза жизни/зданию (немедленно)</span>
                          </FormLabel>
                        </FormItem>

                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Описание */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание проблемы</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишите, что случилось. Например: 'Искрит розетка возле стола врача'..." 
                        className="min-h-[120px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
             {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Отправить заявку"}
          </Button>

        </form>
      </Form>
    </div>
  );
}