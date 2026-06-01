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
  IncidentQueryService,
  IncidentCommandService,
  IncidentClassifierQueryService,
  v1Category,
  classifierV1Type,
  v1IncidentView
} from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";
import { getMyEmployeeInOrg } from "@/lib/auth/get-my-employee";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useRequirePermission } from "@/lib/auth/use-require-permission";
import { cleanText } from "@/lib/text";

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
  const { orgId: activeOrgId, isResolving: isOrgResolving } = useActiveOrgId();
  const isEditMode = !!eventId;
  // Создание/редактирование события — только для сотрудников орги.
  useRequirePermission("canCreateIncident");

  const [categories, setCategories] = useState<v1Category[]>([]);
  const [types, setTypes] = useState<classifierV1Type[]>([]);
  const [existingEvent, setExistingEvent] = useState<v1IncidentView | null>(null);
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

  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    if (isOrgResolving) return;
    if (!userId) return;
    const loadData = async () => {
      try {
        setIsLoading(true);

        let currentOrgId = activeOrgId ?? "";
        try {
          const emp = await getMyEmployeeInOrg(userId, activeOrgId);
          if (emp?.organizationId) currentOrgId = emp.organizationId;
          setEmployeeDeptId(emp?.departmentId ?? "");
        } catch (e) {
          console.warn("Could not fetch employee profile", e);
        }

        if (currentOrgId) {
          const [cats, types] = await Promise.all([
            fetchAllPages<v1Category>((cursor) =>
              IncidentClassifierQueryService.incidentClassifierQueryListCategoriesByOrganization(currentOrgId, 1000, cursor),
            ),
            fetchAllPages<classifierV1Type>((cursor) =>
              IncidentClassifierQueryService.incidentClassifierQueryListTypesByOrganization(currentOrgId, 1000, cursor),
            ),
          ]);
          setCategories(cats);
          setTypes(types);
        }

        if (isEditMode && eventId) {
          const incidentRes = await IncidentQueryService.incidentQueryGetIncident(eventId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isEditMode, userId, activeOrgId, isOrgResolving]);

  const selectedCategoryId = form.watch("categoryId");

  const availableTypes = useMemo(() => {
    if (!selectedCategoryId) return [];
    return types.filter(t => String(t.categoryId) === String(selectedCategoryId));
  }, [selectedCategoryId, types]);

  async function onSubmit(values: EventFormValues) {
    if (!isEditMode && !employeeDeptId) {
      notify.error(
        "Нет привязки к отделению",
        "Чтобы создать инцидент, вы должны быть сотрудником одной из клиник этой организации. Попросите администратора нанять вас через раздел «Пользователи».",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const description = cleanText(values.description);
      if (isEditMode && existingEvent && existingEvent.id) {
        // Бэк-валидация UpdateIncidentDescription: required, min=1, max=10000.
        if (!description) {
          notify.error("Заполните описание", "Описание события обязательно.");
          setIsSubmitting(false);
          return;
        }
        await IncidentCommandService.incidentCommandUpdateIncidentDescription(existingEvent.id, {
          description,
        });
        notify.mutationSuccess("Изменения сохранены", "Данные события обновлены.");
      } else {
        // Бэк-валидация CreateIncident.description: omitnil, min=1, max=10000.
        // Пустую строку НЕ шлём — иначе omitnil не сработает и упадёт на min=1.
        await IncidentCommandService.incidentCommandCreateIncident({
          departmentId: employeeDeptId,
          categoryId: values.categoryId,
          typeId: values.typeId,
          ...(description ? { description } : {}),
          occurredAt: new Date().toISOString(),
        });
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

      {!isEditMode && !isLoading && !employeeDeptId && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
          <p className="font-medium">Нет привязки к отделению в активной организации.</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Создавать инциденты могут только сотрудники этой организации.
            Попросите администратора нанять вас через раздел «Пользователи».
          </p>
        </div>
      )}

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

            <Button
              type="submit"
              disabled={isSubmitting || isLoading || (!isEditMode && !employeeDeptId)}
              className="w-full h-12 text-lg"
            >
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
