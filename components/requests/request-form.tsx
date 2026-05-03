"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Save, Plus, Link as LinkIcon, X } from "lucide-react";

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
import { notify } from "@/lib/toast";

import { 
  ServiceRequestCommandServiceService,
  RequestClassifierQueryServiceService,
  MembershipQueryServiceService,
  IncidentQueryServiceService,
  v1RequestType,
  v1IncidentView,
  ServiceRequestQueryServiceService
} from "@/lib/api-generated";

const formSchema = z.object({
  typeId: z.string().min(1, { message: "Выберите тип работ" }),
  description: z.string().min(5, { message: "Опишите проблему (минимум 5 символов)" }),
  incidentId: z.string().optional(),
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestTypes, setRequestTypes] = useState<v1RequestType[]>([]);
  const [incidents, setIncidents] = useState<v1IncidentView[]>([]);
  const [employeeDeptId, setEmployeeDeptId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(!!requestId);

  const isEditMode = !!requestId;

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typeId: "",
      description: "",
      incidentId: linkedEventIdParam || "",
    },
  });

  useEffect(() => {
    const loadContext = async () => {
      if (!(session?.user as any)?.id) return;
      try {
        const userId = (session?.user as any)?.id;
        if (!userId) return;
        const empRes = await MembershipQueryServiceService.membershipQueryServiceGetEmployee(userId);
        const orgId = empRes && "employee" in empRes ? empRes.employee?.organizationId : null;
        if (empRes && "employee" in empRes && empRes.employee?.departmentId) {
            setEmployeeDeptId(empRes.employee.departmentId);
        }

        if (orgId) {
          const [typeRes, incRes] = await Promise.all([
            RequestClassifierQueryServiceService.requestClassifierQueryServiceListActiveRequestTypesByOrganization(orgId, 100),
            IncidentQueryServiceService.incidentQueryServiceListIncidents(orgId, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 100)
          ]);
          
          if (typeRes && "items" in typeRes && typeRes.items) {
            setRequestTypes(typeRes.items);
          }
          if (incRes && "items" in incRes && incRes.items) {
            setIncidents(incRes.items);
          }
        }
        
        if (requestId) {
            const reqRes = await ServiceRequestQueryServiceService.serviceRequestQueryServiceGetServiceRequest(requestId);
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
  }, [session, requestId, form]);

  const eventOptions = useMemo(() => {
    return incidents.map(e => ({
      value: e.id || "",
      label: `#{${e.id?.substring(0,8)}} — ${e.description?.substring(0, 50)}...`,
    })).filter(o => o.value);
  }, [incidents]);

  const typeOptions = useMemo(() => {
    return requestTypes.map(t => ({
      value: t.id || "",
      label: t.name || t.id || "",
    })).filter(o => o.value);
  }, [requestTypes]);

  async function onSubmit(values: RequestFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditMode && requestId) {
        await ServiceRequestCommandServiceService.serviceRequestCommandServiceUpdateServiceRequestDescription(
          requestId,
          { description: values.description }
        );
        notify.mutationSuccess("Заявка обновлена", `Описание заявки успешно обновлено.`);
      } else {
        await ServiceRequestCommandServiceService.serviceRequestCommandServiceCreateServiceRequest({
            departmentId: employeeDeptId,
            typeId: values.typeId,
            description: values.description,
            incidentId: values.incidentId || undefined,
            executorEmployeeIds: []
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