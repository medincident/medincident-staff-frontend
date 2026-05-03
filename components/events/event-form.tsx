"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { notify } from "@/lib/toast";

import { 
  IncidentQueryServiceService, 
  IncidentCommandServiceService, 
  IncidentClassifierQueryServiceService,
  MembershipQueryServiceService,
  v1Category,
  classifierV1Type,
  v1IncidentView
} from "@/lib/api-generated";

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
  const { data: session } = useSession();
  const isEditMode = !!eventId;

  const [categories, setCategories] = useState<v1Category[]>([]);
  const [types, setTypes] = useState<classifierV1Type[]>([]);
  const [existingEvent, setExistingEvent] = useState<v1IncidentView | null>(null);
  const [orgId, setOrgId] = useState<string>("");
  const [employeeDeptId, setEmployeeDeptId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      typeId: "",
      description: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const userId = (session?.user as any)?.id;
      if (!userId) return;

      try {
        setIsLoading(true);
        
        let currentOrgId = "";
        try {
          const empRes = await MembershipQueryServiceService.membershipQueryServiceGetEmployee(userId);
          if (empRes && "employee" in empRes) {
            if (empRes.employee?.organizationId) {
              currentOrgId = empRes.employee.organizationId;
              setOrgId(currentOrgId);
            }
            if (empRes.employee?.departmentId) {
              setEmployeeDeptId(empRes.employee.departmentId);
            }
          }
        } catch (e) {
          console.warn("Could not fetch employee profile", e);
        }

        if (currentOrgId) {
          const [catsRes, typesRes] = await Promise.all([
            IncidentClassifierQueryServiceService.incidentClassifierQueryServiceListCategoriesByOrganization(currentOrgId, 100),
            IncidentClassifierQueryServiceService.incidentClassifierQueryServiceListActiveTypesByOrganization(currentOrgId, 100)
          ]);
          if (catsRes && "items" in catsRes && catsRes.items) {
            setCategories(catsRes.items);
          }
          if (typesRes && "items" in typesRes && typesRes.items) {
            setTypes(typesRes.items);
          }
        }

        if (isEditMode && eventId) {
          const incidentRes = await IncidentQueryServiceService.incidentQueryServiceGetIncident(eventId);
          if (!incidentRes || !("incident" in incidentRes) || !incidentRes.incident) {
            setNotFound(true);
          } else {
            const eventData = incidentRes.incident;
            setExistingEvent(eventData);
            form.reset({
              categoryId: String(eventData.categoryId || ""),
              typeId: String(eventData.typeId || ""),
              description: eventData.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
        notify.error("Ошибка загрузки данных", "Не удалось получить справочник и событие. Обновите страницу.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, isEditMode, form, session]);

  const selectedCategoryId = form.watch("categoryId");

  const availableTypes = useMemo(() => {
    if (!selectedCategoryId) return [];
    return types.filter(t => String(t.categoryId) === String(selectedCategoryId));
  }, [selectedCategoryId, types]);

  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && existingEvent && existingEvent.id) {
        // В режиме редактирования можно обновить только описание
        await IncidentCommandServiceService.incidentCommandServiceUpdateIncidentDescription(existingEvent.id, {
          description: values.description || ""
        });
        notify.mutationSuccess("Изменения сохранены", "Данные события обновлены.");
      } else {
        // Создание нового события
        const res = await IncidentCommandServiceService.incidentCommandServiceCreateIncident({
          departmentId: employeeDeptId,
          categoryId: values.categoryId,
          typeId: values.typeId,
          description: values.description || "",
          occurredAt: new Date().toISOString()
        });
        
        const newId = (res as any)?.id || "Новое событие";
        notify.mutationSuccess("Событие зарегистрировано", `Ответственные будут уведомлены.`);
      }

      router.push("/events");
      router.refresh();

    } catch (error) {
      console.error(error);
      notify.mutationError("Ошибка", "Не удалось сохранить данные.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditMode ? `Редактирование события` : "Новое событие"}
        </h1>
      </div>

      <div className="bg-card p-6 rounded-xl border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={categories.map((c) => ({
                          value: String(c.id),
                          label: c.name || String(c.id),
                        }))}
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          if (val !== String(existingEvent?.categoryId)) {
                            form.setValue("typeId", "");
                          }
                        }}
                        placeholder={isLoading ? "Загрузка..." : "Выберите категорию..."}
                        disabled={isLoading || isEditMode}
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
                        options={availableTypes.map((t) => ({
                          value: String(t.id),
                          label: t.name || String(t.id),
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!selectedCategoryId || isLoading || isEditMode}
                        placeholder={
                          selectedCategoryId
                            ? "Выберите тип..."
                            : "Сначала выберите категорию"
                        }
                        emptyMessage="Нет типов в этой категории"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
