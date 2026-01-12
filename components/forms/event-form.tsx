"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus } from "lucide-react";

import { CLASSIFIER } from "@/lib/classifier";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
// 1. Импортируем хук уведомлений
import { useToast } from "@/components/providers/toast-provider";

const formSchema = z.object({
  categoryId: z.string().min(1, { message: "Пожалуйста, выберите категорию" }),
  typeId: z.string().min(1, { message: "Пожалуйста, выберите тип события" }),
  description: z.string().optional(), 
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  initialData?: EventFormValues & { id?: string };
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;
  
  // 2. Инициализируем тост
  const toast = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
      typeId: initialData?.typeId || "",
      description: initialData?.description || "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const availableTypes = CLASSIFIER.find((c) => c.id === selectedCategoryId)?.types || [];

  function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    // Имитация запроса
    console.log(isEditMode ? "Обновление:" : "Создание:", values);
    
    setTimeout(() => {
      setIsSubmitting(false);

      // 3. Вызываем уведомление
      if (isEditMode) {
        toast.success(
            "Изменения сохранены", 
            `Событие #${initialData?.id} успешно обновлено.`
        );
      } else {
        const newId = Math.floor(Math.random() * 10000);
        toast.success(
            "Событие зарегистрировано", 
            `Присвоен номер #${newId}. Ответственные оповещены.`
        );
      }

      router.push("/events"); // Возвращаемся в список
    }, 1000);
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? "Редактирование события" : "Новое событие"}
        </h1>
      </div>

      <div className="bg-card p-6 rounded-xl border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={CLASSIFIER.map(c => ({ value: c.id, label: c.name }))}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (val !== initialData?.categoryId) form.setValue("typeId", ""); 
                      }}
                      placeholder="Выберите категорию..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип события</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={availableTypes.map(t => ({ value: t.id, label: t.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedCategoryId}
                      placeholder={selectedCategoryId ? "Выберите тип..." : "Сначала выберите категорию"}
                    />
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

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
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