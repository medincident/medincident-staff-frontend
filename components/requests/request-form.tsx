"use client";

import { useState, useEffect, Suspense } from "react"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, Zap, Calendar, Siren, Link as LinkIcon } from "lucide-react";

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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notify } from "@/lib/toast";

// Импортируем моки и константы
import { requestsDb, eventsDb } from "@/lib/mock-db";
import { ServiceRequest } from "@/lib/types";
import { SERVICE_TYPE_CONFIG } from "@/lib/constants";

const formSchema = z.object({
  type: z.string().min(1, { message: "Выберите тип работ" }),
  location: z.string().min(1, { message: "Укажите кабинет или место" }),
  priority: z.enum(["normal", "high", "critical"], {
    message: "Выберите приоритет",
  }),
  description: z.string().min(5, { message: "Опишите проблему (минимум 5 символов)" }),
  linkedEventId: z.string().optional(),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  initialData?: RequestFormValues & { id?: string; number?: number };
}

function RequestFormContent({ initialData }: RequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedEventIdParam = searchParams.get("linkedEventId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedEventCode, setLinkedEventCode] = useState<string>("");
  
  const isEditMode = !!initialData;

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "",
      location: initialData?.location || "",
      priority: (initialData?.priority as "normal" | "high" | "critical") || "normal",
      description: initialData?.description || "",
      linkedEventId: initialData?.linkedEventId || linkedEventIdParam || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        location: initialData.location,
        priority: initialData.priority as "normal" | "high" | "critical",
        description: initialData.description,
        linkedEventId: initialData.linkedEventId,
      });
    }
  }, [initialData, form]);

  const currentLinkedEventId = form.watch("linkedEventId");

  // ПОЛУЧЕНИЕ ИНФОРМАЦИИ О СВЯЗАННОМ СОБЫТИИ (ИЗ МОКОВ)
  useEffect(() => {
    const fetchLinkedEventInfo = async () => {
      if (!currentLinkedEventId) return;
      
      try {
        const linkedEvent = eventsDb.find(e => e.id === currentLinkedEventId);
        if (linkedEvent?.code) {
            setLinkedEventCode(linkedEvent.code);
        }
      } catch (e) {
        console.error("Failed to load linked event info", e);
      }
    };

    fetchLinkedEventInfo();
  }, [currentLinkedEventId]);

  // СОХРАНЕНИЕ В МОКИ
  async function onSubmit(values: RequestFormValues) {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const dept = SERVICE_TYPE_CONFIG[values.type]?.dept || "Не определен";

      if (isEditMode && initialData?.id) {
        // ОБНОВЛЕНИЕ
        const reqIndex = requestsDb.findIndex(r => r.id === initialData.id);
        if (reqIndex > -1) {
            requestsDb[reqIndex] = {
                ...requestsDb[reqIndex],
                type: values.type,
                location: values.location,
                priority: values.priority,
                description: values.description,
                linkedEventId: values.linkedEventId,
                responsibleDept: dept
            };
        }
        notify.mutationSuccess("Заявка обновлена", `Заявка #${initialData.number || "сохранена"} успешно обновлена.`);
      } else {
        // СОЗДАНИЕ
        const newReqNumber = Math.floor(1000 + Math.random() * 9000);
        const newRequest: ServiceRequest = {
            id: `req_${Date.now()}`,
            number: newReqNumber,
            type: values.type,
            priority: values.priority,
            status: "created",
            description: values.description,
            location: values.location,
            createdAt: new Date().toISOString(),
            authorName: "Текущий пользователь",
            linkedEventId: values.linkedEventId,
            responsibleDept: dept
        };
        
        requestsDb.unshift(newRequest);
        notify.mutationSuccess("Заявка создана", `Номер заявки #${newReqNumber}. Исполнители уведомлены.`);
      }

      router.push("/requests"); 
      router.refresh();

    } catch (error) {
      console.error(error);
      notify.mutationError("Ошибка", "Не удалось сохранить заявку.");
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="bg-card p-6 rounded-xl border space-y-6">
        
        {currentLinkedEventId && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <LinkIcon className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-warning text-sm">Привязка к событию</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Эта заявка создается для устранения последствий события 
                        <span className="font-mono font-bold mx-1 text-foreground">
                            {linkedEventCode || "..."}
                        </span>
                    </p>
                </div>
            </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="linkedEventId"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Тип работ</FormLabel>
                    <FormControl>
                        <SearchableSelect
                            options={Object.entries(SERVICE_TYPE_CONFIG).map(([key, config]) => ({ 
                                value: key, 
                                label: config.label 
                            }))}
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
                      <FormItem className="space-y-0">
                        <FormControl>
                          <RadioGroupItem value="normal" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="
                          flex flex-col md:flex-row items-center md:items-start gap-3 p-4 rounded-xl border-2 bg-card cursor-pointer transition-all
                          hover:bg-accent hover:border-accent-foreground/30
                          peer-data-[state=checked]:border-info
                          peer-data-[state=checked]:bg-info/15
                          group
                        ">
                           <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-info/20 text-info">
                             <Calendar className="h-5 w-5" />
                           </div>
                           <div className="space-y-1 text-center md:text-left">
                             <span className="font-semibold text-sm block text-foreground">Обычный</span>
                             <span className="text-[11px] text-muted-foreground leading-tight block">В порядке очереди</span>
                           </div>
                        </FormLabel>
                      </FormItem>

                      <FormItem className="space-y-0">
                          <FormControl>
                          <RadioGroupItem value="high" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="
                          flex flex-col md:flex-row items-center md:items-start gap-3 p-4 rounded-xl border-2 bg-card cursor-pointer transition-all
                          hover:bg-accent hover:border-accent-foreground/30
                          peer-data-[state=checked]:border-warning
                          peer-data-[state=checked]:bg-warning/15
                          group
                        ">
                           <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-warning/20 text-warning">
                             <Zap className="h-5 w-5 fill-current" />
                           </div>
                           <div className="space-y-1 text-center md:text-left">
                             <span className="font-semibold text-sm block text-foreground">Срочный</span>
                             <span className="text-[11px] text-muted-foreground leading-tight block">Затрудняет работу</span>
                           </div>
                        </FormLabel>
                      </FormItem>

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
                           <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-data-[state=checked]:bg-destructive/20 text-destructive">
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

export function RequestForm(props: RequestFormProps) {
  return (
    <Suspense fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }>
        <RequestFormContent {...props} />
    </Suspense>
  );
}