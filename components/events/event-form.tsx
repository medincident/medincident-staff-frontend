"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";
import { Category, IncidentEvent } from "@/lib/types";

import { CLASSIFIER_DB, eventsDb } from "@/lib/mock-db";

const formSchema = z.object({
  categoryId: z.string().min(1, { message: "Пожалуйста, выберите категорию" }),
  typeId: z.string().min(1, { message: "Пожалуйста, выберите тип события" }),
  description: z.string().optional(),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  eventId?: string;
}

export function EventForm({ eventId }: EventFormProps) {
  const router = useRouter();
  const isEditMode = !!eventId;

  // --- STATE ---
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [existingEvent, setExistingEvent] = useState<IncidentEvent | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // --- FORM SETUP ---
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      typeId: "",
      description: "",
    },
  });

  // 1. ЗАГРУЗКА ДАННЫХ ИЗ МОКОВ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Имитируем сетевую задержку для загрузки
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Загружаем классификатор
        setClassifier(CLASSIFIER_DB);

        // Логика для режима редактирования
        if (isEditMode && eventId) {
            const eventData = eventsDb.find(e => e.id === eventId);
            
            if (!eventData) {
                setNotFound(true);
            } else {
                setExistingEvent(eventData);
                form.reset({
                    categoryId: String(eventData.categoryId),
                    typeId: String(eventData.typeId),
                    description: eventData.description || "",
                });
            }
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Ошибка загрузки данных");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, isEditMode, form]);

  // --- LOGIC ---
  const selectedCategoryId = form.watch("categoryId");

  const availableTypes = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = classifier.find(
      (c) => String(c.id) === String(selectedCategoryId)
    );
    return category?.types || [];
  }, [selectedCategoryId, classifier]);

  // --- SUBMIT ---
  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    try {
      // Имитируем сетевую задержку сохранения
      await new Promise(resolve => setTimeout(resolve, 600));

      const selectedCategory = classifier.find(c => String(c.id) === values.categoryId);
      const selectedType = availableTypes.find(t => String(t.id) === values.typeId);

      if (isEditMode && existingEvent) {
        // ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕГО
        const eventIndex = eventsDb.findIndex(e => e.id === existingEvent.id);
        if (eventIndex > -1) {
            eventsDb[eventIndex] = {
                ...existingEvent,
                categoryId: values.categoryId,
                typeId: values.typeId,
                description: values.description,
                categoryName: selectedCategory?.name,
                typeName: selectedType?.name
            };
        }
        toast.success("Изменения сохранены");
      } else {
        // СОЗДАНИЕ НОВОГО
        const newEvent: IncidentEvent = {
            id: `evt_${Date.now()}`,
            code: `INC-${Math.floor(1000 + Math.random() * 9000)}`, // Генерируем случайный код (например, INC-4921)
            createdAt: new Date().toISOString(),
            status: "created",
            author: "Текущий пользователь", // В реальном приложении брали бы из сессии
            
            categoryId: values.categoryId,
            typeId: values.typeId,
            description: values.description,
            
            categoryName: selectedCategory?.name,
            typeName: selectedType?.name
        };
        
        // Добавляем в начало массива
        eventsDb.unshift(newEvent);
        toast.success("Событие зарегистрировано");
      }

      router.push("/events");
      router.refresh(); 

    } catch (error) {
      console.error(error);
      toast.error("Ошибка", { description: "Не удалось сохранить данные" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- RENDER STATES ---
  if (isLoading && isEditMode) {
    return (
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex items-center gap-2 mb-6">
               <Skeleton className="h-9 w-9" />
               <Skeleton className="h-8 w-48" />
            </div>
            <div className="bg-card p-6 rounded-xl border space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8.25 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8.25 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-12 w-full mt-2" />
            </div>
        </div>
    );
  }

  if (isEditMode && notFound) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h1 className="text-xl font-bold">Событие не найдено</h1>
            <Button variant="link" onClick={() => router.push("/events")}>Вернуться к списку</Button>
        </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? `Редактирование ${existingEvent?.code || ''}` : "Новое событие"}
        </h1>
      </div>

      {/* FORM CARD */}
      <div className="bg-card p-6 rounded-xl border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* CATEGORY */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      // Если классификатор еще грузится (isLoading=true), список будет пустым, но поле отобразится
                      options={classifier.map(c => ({ value: String(c.id), label: c.name }))}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (val !== String(existingEvent?.categoryId)) {
                           form.setValue("typeId", "");
                        }
                      }}
                      placeholder={isLoading ? "Загрузка..." : "Выберите категорию..."}
                      disabled={isLoading} // Блокируем селект пока грузятся справочники
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TYPE */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип события</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={availableTypes.map(t => ({ value: String(t.id), label: t.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedCategoryId || isLoading}
                      placeholder={selectedCategoryId ? "Выберите тип..." : "Сначала выберите категорию"}
                      emptyMessage="Нет типов в этой категории"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание <span className="text-muted-foreground font-normal">(необязательно)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Детали происшествия..."
                      className="resize-none min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || isLoading} className="w-full h-12 text-lg">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : isEditMode ? (
                <><Save className="mr-2 h-5 w-5" /> Сохранить изменения</>
              ) : (
                <><Plus className="mr-2 h-5 w-5" /> Зарегистрировать</>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}