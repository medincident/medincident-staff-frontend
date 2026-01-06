"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { CLASSIFIER } from "@/lib/classifier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Схема валидации
const formSchema = z.object({
  categoryId: z.string().min(1, { message: "Пожалуйста, выберите категорию" }),
  typeId: z.string().min(1, { message: "Пожалуйста, выберите тип события" }),
  description: z.string().optional(), 
});

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      typeId: "",
      description: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const availableTypes = CLASSIFIER.find((c) => c.id === selectedCategoryId)?.types || [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Отправка:", values);
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Шапка */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          {/* text-foreground автоматически адаптируется под тему */}
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Новое событие</h1>
      </div>

      {/* Карточка формы: bg-card border-border */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Категория */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Категория</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={CLASSIFIER.map(c => ({ value: c.id, label: c.name }))}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        form.setValue("typeId", ""); 
                      }}
                      placeholder="Выберите категорию..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Тип события */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Тип события</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={availableTypes.map(t => ({ value: t.id, label: t.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedCategoryId}
                      placeholder={selectedCategoryId ? "Выберите тип..." : "Сначала выберите категорию"}
                      emptyMessage="Тип события не найден"
                      threshold={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Описание (Опционально) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Детальное описание <span className="text-muted-foreground font-normal">(необязательно)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите, что произошло, были ли свидетели, какие меры приняты..." 
                      className="resize-none min-h-[100px] bg-background border-input text-foreground placeholder:text-muted-foreground"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Кнопка Submit: Использует primary цвет бренда */}
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-12 text-lg shadow-sm"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Зарегистрировать"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}