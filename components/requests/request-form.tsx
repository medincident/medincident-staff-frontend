"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Save, Plus, Link as LinkIcon, X, Check, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";

import {
  ServiceRequestCommandService,
  RequestClassifierQueryService,
  IncidentQueryService,
  MembershipQueryService,
  v1RequestType,
  v1IncidentView,
  v1EmployeeCardView,
  ServiceRequestQueryService
} from "@/lib/api-generated";
import { fetchAllPages } from "@/lib/api/paginate";
import { getMyEmployeeInOrg } from "@/lib/auth/get-my-employee";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { useIncidentClassifier } from "@/lib/classifiers/incident-classifier-store";
import { useRequirePermission } from "@/lib/auth/use-require-permission";
import { cleanText } from "@/lib/text";

const formSchema = z.object({
  typeId: z.string().min(1, { message: "Выберите тип работ" }),
  description: z.string().min(5, { message: "Опишите проблему (минимум 5 символов)" }),
  incidentId: z.string().optional(),
  executorEmployeeIds: z.array(z.string()),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  requestId?: string;
}

function RequestFormContent({ requestId }: RequestFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedEventIdParam = searchParams.get("linkedEventId");
  const { data: session } = useSession();
  const { orgId: activeOrgId, isResolving: isOrgResolving } = useActiveOrgId();
  // Гард: создавать заявку может только сотрудник орги. Редактировать —
  // отдельный кейс, пока пускаем тех же, у кого есть `canCreateRequest`.
  useRequirePermission("canCreateRequest");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestTypes, setRequestTypes] = useState<v1RequestType[]>([]);
  const [incidents, setIncidents] = useState<v1IncidentView[]>([]);
  const [employeeDeptId, setEmployeeDeptId] = useState<string>("");
  const [staff, setStaff] = useState<v1EmployeeCardView[]>([]);
  const [executorPopoverOpen, setExecutorPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!requestId);

  const isEditMode = !!requestId;

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typeId: "",
      description: "",
      incidentId: linkedEventIdParam || "",
      executorEmployeeIds: [],
    },
  });

  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    if (isOrgResolving) return;
    if (!userId) return;
    const loadContext = async () => {
      try {
        // У мульти-орг сотрудника в каждой орге своё отделение.
        const emp = await getMyEmployeeInOrg(userId, activeOrgId);
        const orgId = emp?.organizationId ?? activeOrgId ?? null;
        const deptId = emp?.departmentId ?? null;
        if (deptId) setEmployeeDeptId(deptId);

        if (orgId) {
          const [types, incs, staffList] = await Promise.all([
            fetchAllPages<v1RequestType>((cursor) =>
              RequestClassifierQueryService.requestClassifierQueryListRequestTypesByOrganization(orgId, 1000, cursor),
            ),
            fetchAllPages<v1IncidentView>((cursor) =>
              IncidentQueryService.incidentQueryListIncidents(orgId, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1000, cursor),
            ),
            // Кандидаты на исполнение — сотрудники того же отделения, в котором
            // создаётся заявка. Так же сделано в [id]/view.tsx для AssignExecutors.
            deptId
              ? fetchAllPages<v1EmployeeCardView>((cursor) =>
                  MembershipQueryService.membershipQueryListEmployeesByDepartment(deptId, 1000, cursor),
                )
              : Promise.resolve<v1EmployeeCardView[]>([]),
          ]);

          setRequestTypes(types);
          setIncidents(incs);
          setStaff(staffList);
        }
        
        if (requestId) {
            const reqRes = await ServiceRequestQueryService.serviceRequestQueryGetServiceRequest(requestId);
            if (reqRes && "serviceRequest" in reqRes && reqRes.serviceRequest) {
                form.reset({
                    typeId: reqRes.serviceRequest.typeId || "",
                    description: reqRes.serviceRequest.description || "",
                    incidentId: reqRes.serviceRequest.incidentId || "",
                });
            }
        }
      } catch (err) {
        console.error("Failed to load context:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, requestId, activeOrgId, isOrgResolving]);

  // Имя типа НС из общего кеша классификатора (без лишнего запроса) —
  // у многих инцидентов description пустой, и подпись была «undefined…».
  const { types: incidentTypes } = useIncidentClassifier(activeOrgId);
  const incidentTypeNames = useMemo(() => {
    const m: Record<string, string> = {};
    incidentTypes.forEach((t) => {
      if (t.id && t.name) m[t.id] = t.name;
    });
    return m;
  }, [incidentTypes]);

  const eventOptions = useMemo(() => {
    return incidents
      .map((e) => {
        const shortId = e.id?.substring(0, 8) ?? "";
        const desc = e.description?.trim();
        const typeName = e.typeId ? incidentTypeNames[e.typeId] : undefined;
        const title = typeName || desc || "Без описания";
        const label = `#${shortId} — ${
          title.length > 50 ? title.slice(0, 50) + "…" : title
        }`;
        return { value: e.id || "", label };
      })
      .filter((o) => o.value);
  }, [incidents, incidentTypeNames]);

  const typeOptions = useMemo(() => {
    return requestTypes.map(t => ({
      value: t.id || "",
      label: t.name || t.id || "",
    })).filter(o => o.value);
  }, [requestTypes]);

  async function onSubmit(values: RequestFormValues) {
    setIsSubmitting(true);
    try {
      // Бэк-валидация: description required min=1/max=10000 + no_extra_ws.
      const description = cleanText(values.description);
      if (!description) {
        notify.error("Заполните описание", "Описание заявки обязательно.");
        setIsSubmitting(false);
        return;
      }
      const incidentId = values.incidentId?.trim() || undefined;

      if (isEditMode && requestId) {
        await ServiceRequestCommandService.serviceRequestCommandUpdateServiceRequestDescription(
          requestId,
          { description }
        );
        notify.mutationSuccess("Заявка обновлена", `Описание заявки успешно обновлено.`);
      } else {
        // Бэк-валидация executorEmployeeIds: required, min=1, dive uuid.
        if (!values.executorEmployeeIds || values.executorEmployeeIds.length === 0) {
          notify.error("Выберите исполнителя", "Заявка должна быть назначена минимум на одного сотрудника.");
          setIsSubmitting(false);
          return;
        }
        await ServiceRequestCommandService.serviceRequestCommandCreateServiceRequest({
            departmentId: employeeDeptId,
            typeId: values.typeId,
            description,
            ...(incidentId ? { incidentId } : {}),
            executorEmployeeIds: values.executorEmployeeIds,
        });
        notify.mutationSuccess("Заявка создана", `Ваша заявка успешно отправлена.`);
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

  if (isLoading) {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          {isEditMode ? "Редактирование заявки" : "Новая заявка"}
        </h1>
      </div>

      <div className="bg-card p-6 rounded-xl border space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField
              control={form.control}
              name="incidentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-warning" />
                    Связанное событие (НС)
                    <span className="text-xs font-normal text-muted-foreground">— необязательно</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <SearchableSelect
                        options={eventOptions}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Выберите событие для привязки"
                        emptyMessage="События не найдены"
                        disabled={isEditMode}
                      />
                      {field.value && !isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => field.onChange("")}
                          title="Убрать привязку"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground">
                    Если заявка создаётся для устранения последствий нежелательного события — укажите его здесь.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Тип работ</FormLabel>
                <FormControl>
                    <SearchableSelect
                        options={typeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Выберите службу"
                        emptyMessage="Служба не найдена"
                        disabled={isEditMode}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {!isEditMode && (
              <FormField
                control={form.control}
                name="executorEmployeeIds"
                render={({ field }) => {
                  const selectedIds = field.value || [];
                  const selectedEmps = staff.filter((e) =>
                    e.employeeId ? selectedIds.includes(e.employeeId) : false,
                  );
                  const empLabel = (e: v1EmployeeCardView) =>
                    e.displayName ||
                    [e.firstName, e.lastName].filter(Boolean).join(" ") ||
                    e.employeeId ||
                    "";
                  const toggle = (id: string) => {
                    const next = selectedIds.includes(id)
                      ? selectedIds.filter((x) => x !== id)
                      : [...selectedIds, id];
                    field.onChange(next);
                  };
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Исполнители
                      </FormLabel>
                      <FormControl>
                        <Popover open={executorPopoverOpen} onOpenChange={setExecutorPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between bg-background font-normal hover:border-primary",
                                selectedIds.length === 0 && "text-muted-foreground",
                              )}
                            >
                              <span className="truncate">
                                {selectedIds.length === 0
                                  ? "Выберите сотрудников отделения"
                                  : `Выбрано: ${selectedIds.length}`}
                              </span>
                              <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0 bg-popover border-border"
                            align="start"
                            style={{ width: "var(--radix-popover-trigger-width)" }}
                          >
                            <Command className="bg-popover text-popover-foreground">
                              <CommandInput placeholder="Поиск по ФИО..." className="h-9 border-none focus:ring-0" />
                              <CommandList>
                                <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                                <CommandGroup>
                                  {staff
                                    .filter((e) => e.employeeId)
                                    .map((e) => {
                                      const id = e.employeeId as string;
                                      const checked = selectedIds.includes(id);
                                      return (
                                        <CommandItem
                                          key={id}
                                          value={`${empLabel(e)} ${e.position ?? ""}`}
                                          onSelect={() => toggle(id)}
                                          className="cursor-pointer items-start"
                                        >
                                          <Check className={cn("mr-2 h-4 w-4 mt-0.5 shrink-0", checked ? "opacity-100" : "opacity-0")} />
                                          <div className="flex flex-col min-w-0 flex-1 text-left gap-0.5">
                                            <span className="line-clamp-1 break-all">{empLabel(e)}</span>
                                            {e.position && (
                                              <span className="line-clamp-1 break-all text-xs text-muted-foreground">
                                                {e.position}
                                              </span>
                                            )}
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {selectedEmps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedEmps.map((e) => (
                            <Badge
                              key={e.employeeId}
                              variant="secondary"
                              className="pl-2 pr-1 gap-1"
                            >
                              <span className="line-clamp-1 max-w-[160px]">{empLabel(e)}</span>
                              <button
                                type="button"
                                onClick={() => toggle(e.employeeId as string)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
                                aria-label="Убрать"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Минимум один сотрудник. Кандидаты — сотрудники вашего отделения.
                      </p>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Суть проблемы</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Что сломалось, требуется ли запчасть..."
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