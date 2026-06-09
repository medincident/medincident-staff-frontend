"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Loader2,
  Play,
  PlayCircle,
  Square,
  X,
  Pencil,
  CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm-dialog/store";
import { cn } from "@/lib/utils";
import {
  MembershipQueryService,
  MembershipCommandService,
  v1VacationView,
} from "@/lib/api-generated";

// Бэк ждёт RFC3339 startsAt/endsAt — берём полночь UTC от выбранной даты.
function dateToIso(d?: Date): string | undefined {
  if (!d) return undefined;
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return utc.toISOString();
}

function isoToDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATE_LABEL: Record<string, string> = {
  scheduled: "Запланирован",
  active: "Идёт сейчас",
  ended: "Завершён",
  cancelled: "Отменён",
};

const STATE_BADGE_COLOR: Record<string, string> = {
  scheduled: "bg-info/10 text-info border-info/20",
  active: "bg-success/10 text-success border-success/20",
  ended: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  employeeName?: string;
};

export function VacationsDialog({ open, onOpenChange, employeeId, employeeName }: Props) {
  const confirm = useConfirm();
  const [vacations, setVacations] = useState<v1VacationView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [scheduleStart, setScheduleStart] = useState<Date | undefined>(undefined);
  const [scheduleEnd, setScheduleEnd] = useState<Date | undefined>(undefined);

  const [startNowEnd, setStartNowEnd] = useState<Date | undefined>(undefined);

  const [editingVacation, setEditingVacation] = useState<v1VacationView | null>(null);
  const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined);

  const loadVacations = async (empId: string) => {
    setIsLoading(true);
    try {
      const res = await MembershipQueryService.membershipQueryListVacationsByEmployee(
        empId,
        undefined, // state — все
        100,
      );
      if (res && "items" in res && Array.isArray(res.items)) {
        setVacations(res.items);
      } else {
        setVacations([]);
      }
    } catch (e) {
      console.error("Failed to load vacations", e);
      notify.error("Ошибка", "Не удалось загрузить список отпусков.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !employeeId) return;
    setScheduleStart(undefined);
    setScheduleEnd(undefined);
    setStartNowEnd(undefined);
    setEditingVacation(null);
    void loadVacations(employeeId);
  }, [open, employeeId]);

  const { active, scheduled, history } = useMemo(() => {
    const sortByStart = (a: v1VacationView, b: v1VacationView) =>
      new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime();
    return {
      active: vacations.filter((v) => v.state === "active").sort(sortByStart),
      scheduled: vacations.filter((v) => v.state === "scheduled").sort(sortByStart),
      history: vacations
        .filter((v) => v.state === "ended" || v.state === "cancelled")
        .sort(sortByStart),
    };
  }, [vacations]);

  const handleSchedule = async () => {
    if (!employeeId || !scheduleStart) return;
    setIsMutating(true);
    try {
      await MembershipCommandService.membershipCommandScheduleVacation(employeeId, {
        startsAt: dateToIso(scheduleStart)!,
        endsAt: dateToIso(scheduleEnd),
      });
      notify.mutationSuccess("Отпуск запланирован", "");
      setScheduleStart(undefined);
      setScheduleEnd(undefined);
      void loadVacations(employeeId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось запланировать отпуск");
    } finally {
      setIsMutating(false);
    }
  };

  const handleStartNow = async () => {
    if (!employeeId) return;
    const ok = await confirm({
      title: "Начать отпуск прямо сейчас?",
      description: "Сотрудник станет недоступен сразу.",
      confirmLabel: "Начать",
    });
    if (!ok) return;
    setIsMutating(true);
    try {
      await MembershipCommandService.membershipCommandStartVacationNow(employeeId, {
        endsAt: dateToIso(startNowEnd),
      });
      notify.mutationSuccess("Отпуск начат", "");
      setStartNowEnd(undefined);
      void loadVacations(employeeId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось начать отпуск");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancel = async (v: v1VacationView) => {
    if (!v.id || !employeeId) return;
    const ok = await confirm({
      title: "Отменить запланированный отпуск?",
      confirmLabel: "Отменить отпуск",
      destructive: true,
    });
    if (!ok) return;
    setIsMutating(true);
    try {
      await MembershipCommandService.membershipCommandCancelScheduledVacation(v.id);
      notify.mutationSuccess("Отпуск отменён", "");
      void loadVacations(employeeId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось отменить отпуск");
    } finally {
      setIsMutating(false);
    }
  };

  const handleForceEnd = async (v: v1VacationView) => {
    if (!v.id || !employeeId) return;
    const ok = await confirm({
      title: "Завершить отпуск досрочно?",
      description: "Сотрудник снова станет доступен.",
      confirmLabel: "Завершить",
    });
    if (!ok) return;
    setIsMutating(true);
    try {
      await MembershipCommandService.membershipCommandForceEndVacation(v.id);
      notify.mutationSuccess("Отпуск завершён", "Сотрудник снова в строю.");
      void loadVacations(employeeId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось завершить отпуск");
    } finally {
      setIsMutating(false);
    }
  };

  const openEdit = (v: v1VacationView) => {
    setEditingVacation(v);
    setEditEndDate(isoToDate(v.endsAt));
  };

  const handleSaveEnd = async () => {
    if (!editingVacation?.id || !employeeId || !editEndDate) return;
    setIsMutating(true);
    try {
      await MembershipCommandService.membershipCommandUpdateVacationEndDate(editingVacation.id, {
        endsAt: dateToIso(editEndDate)!,
      });
      notify.mutationSuccess("Дата обновлена", "Новая дата окончания сохранена.");
      setEditingVacation(null);
      void loadVacations(employeeId);
    } catch (e) {
      console.error(e);
      notify.apiError(e, "Не удалось изменить дату");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              Отпуска
            </DialogTitle>
            <DialogDescription>
              {employeeName ? `Сотрудник: ${employeeName}` : "Управление отпусками сотрудника"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Текущий отпуск
                    </h3>
                    {active.map((v) => (
                      <VacationRow
                        key={v.id}
                        vacation={v}
                        actions={
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(v)} disabled={isMutating}>
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              Изменить дату
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleForceEnd(v)}
                              disabled={isMutating}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            >
                              <Square className="mr-1.5 h-3.5 w-3.5" />
                              Завершить
                            </Button>
                          </>
                        }
                      />
                    ))}
                  </section>
                )}

                {scheduled.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Запланированные
                    </h3>
                    {scheduled.map((v) => (
                      <VacationRow
                        key={v.id}
                        vacation={v}
                        actions={
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(v)} disabled={isMutating}>
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              Изменить дату
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(v)}
                              disabled={isMutating}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" />
                              Отменить
                            </Button>
                          </>
                        }
                      />
                    ))}
                  </section>
                )}

                {active.length === 0 && (
                  <section className="space-y-3 border rounded-lg p-3 bg-muted/30">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      Запланировать
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Начало</Label>
                        <DatePicker
                          value={scheduleStart}
                          onChange={setScheduleStart}
                          placeholder="Выберите дату начала"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Окончание (необязательно)</Label>
                        <DatePicker
                          value={scheduleEnd}
                          onChange={setScheduleEnd}
                          placeholder="Без даты окончания"
                          fromDate={scheduleStart}
                          clearable
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSchedule}
                      disabled={!scheduleStart || isMutating}
                      size="sm"
                    >
                      {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Запланировать отпуск
                    </Button>
                  </section>
                )}

                {active.length === 0 && (
                  <section className="space-y-3 border rounded-lg p-3 bg-muted/30">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      Начать прямо сейчас
                    </h3>
                    <div className="space-y-1.5">
                      <Label>Окончание (необязательно)</Label>
                      <DatePicker
                        value={startNowEnd}
                        onChange={setStartNowEnd}
                        placeholder="Без даты окончания"
                        clearable
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Если оставить пустым — отпуск без явной даты окончания. Завершить можно вручную.
                      </p>
                    </div>
                    <Button onClick={handleStartNow} disabled={isMutating} size="sm" variant="outline">
                      {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                      Начать сейчас
                    </Button>
                  </section>
                )}

                {history.length > 0 && (
                  <section className="space-y-2">
                    <Separator />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                      История ({history.length})
                    </h3>
                    {history.slice(0, 10).map((v) => (
                      <VacationRow key={v.id} vacation={v} />
                    ))}
                    {history.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        … и ещё {history.length - 10} записей
                      </p>
                    )}
                  </section>
                )}

                {!isLoading && vacations.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Отпусков пока нет.
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVacation} onOpenChange={(o) => !o && setEditingVacation(null)}>
        <DialogContent className="min-w-0">
          <DialogHeader>
            <DialogTitle>Изменить дату окончания</DialogTitle>
            <DialogDescription>
              {editingVacation
                ? `Отпуск с ${fmtDate(editingVacation.startsAt)} до ${fmtDate(editingVacation.endsAt)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label>Новая дата окончания</Label>
            <DatePicker
              value={editEndDate}
              onChange={setEditEndDate}
              placeholder="Выберите дату"
              fromDate={editingVacation ? isoToDate(editingVacation.startsAt) : undefined}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVacation(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEnd} disabled={!editEndDate || isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VacationRow({
  vacation,
  actions,
}: {
  vacation: v1VacationView;
  actions?: React.ReactNode;
}) {
  const state = (vacation.state ?? "").toLowerCase();
  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn("text-[10px] uppercase tracking-wider", STATE_BADGE_COLOR[state])}
        >
          {STATE_LABEL[state] ?? state}
        </Badge>
        <span className="text-sm text-foreground">
          <b>{fmtDate(vacation.startsAt)}</b>
          {vacation.endsAt ? (
            <> — <b>{fmtDate(vacation.endsAt)}</b></>
          ) : (
            <span className="text-muted-foreground"> (без даты окончания)</span>
          )}
        </span>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
