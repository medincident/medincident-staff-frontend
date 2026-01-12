"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, Zap, Calendar, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Импорт компонента поиска
import { SearchableSelect } from "@/components/ui/searchable-select";
// 1. Импортируем хук уведомлений
import { useToast } from "@/components/providers/toast-provider";

// Типы услуг
const SERVICE_TYPES = [
  { id: "plumbing", label: "Сантехника" },
  { id: "electric", label: "Электрика" },
  { id: "it_support", label: "IT Поддержка" },
  { id: "med_equipment", label: "Медтехника" },
  { id: "furniture", label: "Мебель / Ремонт" },
  { id: "cleaning", label: "Клининг / Дезинфекция" },
];

const formSchema = z.object({
  type: z.string().min(1, { message: "Выберите тип работ" }),
  location: z.string().min(1, { message: "Укажите кабинет или место" }),
  priority: z.enum(["normal", "urgent", "critical"], {
    message: "Выберите приоритет",
  }),
  description: z.string().min(5, { message: "Опишите проблему (минимум 5 символов)" }),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  initialData?: RequestFormValues & { id?: string };
}

export function RequestForm({ initialData }: RequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;
  
  // 2. Инициализируем тост
  const toast = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "",
      location: initialData?.location || "",
      priority: initialData?.priority || "normal",
      description: initialData?.description || "",
    },
  });

  function onSubmit(values: RequestFormValues) {
    setIsSubmitting(true);
    console.log(isEditMode ? "Обновление заявки:" : "Создание заявки:", values);
    
    setTimeout(() => {
      setIsSubmitting(false);

      // 3. Вызываем уведомление
      if (isEditMode) {
        toast.success(
            "Заявка обновлена", 
            `Заявка #${initialData?.id} успешно сохранена.`
        );
      } else {
        const newId = Math.floor(Math.random() * 10000);
        toast.success(
            "Заявка создана", 
            `Номер заявки #${newId}. Исполнители уведомлены.`
        );
      }

      router.push("/requests"); 
    }, 1000);
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? "Редактирование заявки" : "Новая заявка"}
        </h1>
      </div>

      <div className="bg-card p-6 rounded-xl border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Тип работ и Локация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Тип работ</FormLabel>
                    <FormControl>
                        {/* Используем SearchableSelect */}
                        <SearchableSelect
                            options={SERVICE_TYPES.map(t => ({ value: t.id, label: t.label }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Выберите службу"
                            emptyMessage="Служба не найдена"
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Местоположение</FormLabel>
                    <FormControl>
                        <Input placeholder="Напр. Кабинет 305" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Приоритет */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Приоритет выполнения</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    >
                      {/* --- NORMAL --- */}
                      <FormItem className="space-y-0">
                        <FormControl>
                          <RadioGroupItem value="normal" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="
                          flex flex-col md:flex-row items-center md:items-start gap-3 p-4 rounded-xl border-2 bg-card cursor-pointer transition-all
                          hover:bg-accent hover:border-accent-foreground/30
                          peer-data-[state=checked]:border-blue-500 
                          peer-data-[state=checked]:bg-blue-500/15
                          group
                        ">
                           <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                             <Calendar className="h-5 w-5" />
                           </div>
                           <div className="space-y-1 text-center md:text-left">
                             <span className="font-semibold text-sm block text-foreground">Обычный</span>
                             <span className="text-[11px] text-muted-foreground leading-tight block">В порядке очереди</span>
                           </div>
                        </FormLabel>
                      </FormItem>

                      {/* --- URGENT --- */}
                      <FormItem className="space-y-0">
                          <FormControl>
                          <RadioGroupItem value="urgent" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="
                          flex flex-col md:flex-row items-center md:items-start gap-3 p-4 rounded-xl border-2 bg-card cursor-pointer transition-all
                          hover:bg-accent hover:border-accent-foreground/30
                          peer-data-[state=checked]:border-orange-500 
                          peer-data-[state=checked]:bg-orange-500/15
                          group
                        ">
                           <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                             <Zap className="h-5 w-5 fill-current" />
                           </div>
                           <div className="space-y-1 text-center md:text-left">
                             <span className="font-semibold text-sm block text-foreground">Срочный</span>
                             <span className="text-[11px] text-muted-foreground leading-tight block">Затрудняет работу</span>
                           </div>
                        </FormLabel>
                      </FormItem>

                      {/* --- CRITICAL --- */}
                      <FormItem className="space-y-0">
                          <FormControl>
                          <RadioGroupItem value="critical" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="
                          flex flex-col md:flex-row items-center md:items-start gap-3 p-4 rounded-xl border-2 bg-card cursor-pointer transition-all
                          hover:bg-accent hover:border-accent-foreground/30
                          peer-data-[state=checked]:border-destructive 
                          peer-data-[state=checked]:bg-destructive/15
                          group
                        ">
                           <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-destructive/20 text-destructive dark:text-red-400">
                             <Siren className="h-5 w-5" />
                           </div>
                           <div className="space-y-1 text-center md:text-left">
                             <span className="font-semibold text-sm block text-foreground">Критичный</span>
                             <span className="text-[11px] text-muted-foreground leading-tight block">Авария / Угроза</span>
                           </div>
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
                  <FormLabel>Суть проблемы</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Что сломалось, где именно, требуется ли запчасть..." 
                      className="resize-none min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : isEditMode ? (
                <><Save className="mr-2 h-5 w-5" /> Сохранить изменения</>
              ) : (
                <><Plus className="mr-2 h-5 w-5" /> Создать заявку</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}