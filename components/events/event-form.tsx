"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus } from "lucide-react";

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
import { toast } from "sonner";
import { Category } from "@/lib/types";

const formSchema = z.object({
  categoryId: z.string().min(1, { message: "Пожалуйста, выберите категорию" }),
  typeId: z.string().min(1, { message: "Пожалуйста, выберите тип события" }),
  description: z.string().optional(),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  initialData?: EventFormValues & { id?: string };
  classifier?: Category[];
}

export function EventForm({ initialData, classifier = [] }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!initialData;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId ? String(initialData.categoryId) : "",
      typeId: initialData?.typeId ? String(initialData.typeId) : "",
      description: initialData?.description || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        categoryId: String(initialData.categoryId),
        typeId: String(initialData.typeId),
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  const selectedCategoryId = form.watch("categoryId");

  const availableTypes = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    const category = classifier.find(
      (c) => String(c.id) === String(selectedCategoryId)
    );
    
    return category?.types || [];
  }, [selectedCategoryId, classifier]);

  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    try {
      const url = isEditMode && initialData?.id
        ? `/api/events/${initialData.id}`
        : "/api/events";
      
      const method = isEditMode && initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Ошибка при сохранении");

      const data = await response.json();

      if (isEditMode) {
        toast.success("Изменения сохранены");
      } else {
        toast.success("Событие зарегистрировано", { description: `Номер #${data.id}` });
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

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? "Редактирование события" : "Новое событие"}
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
                      options={classifier.map(c => ({ value: String(c.id), label: c.name }))}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // Сбрасываем тип при смене категории
                        if (val !== String(initialData?.categoryId)) {
                             form.setValue("typeId", "");
                        }
                      }}
                      placeholder="Выберите категорию..."
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
                      disabled={!selectedCategoryId}
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