"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Search, FolderPlus, MoreVertical, Layers, Loader2, ChevronRight, ChevronDown, Power, PowerOff
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notify } from "@/lib/toast";
import { Switch } from "@/components/ui/switch";
import {
  IncidentClassifierQueryService,
  IncidentClassifierCommandService,
} from "@/lib/api-generated";
import { useActiveOrgId } from "@/lib/auth/active-org-context";
import { cleanText } from "@/lib/text";
import { getBadgeColor } from "@/lib/status-helper";

// Русское склонение числительных с существительным (1 тип / 2 типа / 5 типов)
const getDeclension = (n: number, words: string[]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[(n % 10 < 5) ? n % 10 : 5]];
};

export function IncidentClassifierView() {
  const { orgId: organizationId, isResolving: isOrgResolving } = useActiveOrgId();
  const [categories, setCategories] = useState<any[]>([]);
  const [typesMap, setTypesMap] = useState<Record<string, any[]>>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPatientCanReport, setNewItemPatientCanReport] = useState(false);

  useEffect(() => {
    if (isOrgResolving) return;
    if (organizationId) {
      loadCategories();
    } else {
      setCategories([]);
      setTypesMap({});
      setIsLoading(false);
    }
  }, [search, organizationId, isOrgResolving]);

  const loadCategories = async () => {
    if (!organizationId) return;
    try {
      setIsLoading(true);
      const result = await IncidentClassifierQueryService.incidentClassifierQueryListCategoriesByOrganization(organizationId, 100);
      const fetchedCats = (result as any).items || [];

      const filtered = search
        ? fetchedCats.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()))
        : fetchedCats;

      setCategories(filtered);

      const typesResults = await Promise.all(
        filtered.map((cat: any) =>
          IncidentClassifierQueryService.incidentClassifierQueryListTypesByCategory(cat.id, 100)
            .then(res => ({ id: cat.id, types: (res as any).items || [] }))
            .catch(() => ({ id: cat.id, types: [] }))
        )
      );

      const newTypesMap: Record<string, any[]> = {};
      typesResults.forEach(res => { newTypesMap[res.id] = res.types; });
      setTypesMap(newTypesMap);
    } catch (error) {
      console.error(error);
      notify.error("Ошибка", "Не удалось загрузить справочник категорий.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const saveCategory = async () => {
    // Бэк-валидация: name min=2/max=256, description omitnil min=8/max=2048.
    const name = cleanText(newItemName) ?? "";
    const description = cleanText(newItemDescription);
    if (name.length < 2 || !organizationId) {
      if (organizationId) notify.error("Проверьте поля", "Название обязательно (≥ 2 символов).");
      return;
    }
    if (description !== undefined && description.length < 8) {
      notify.error("Проверьте описание", "Описание должно быть ≥ 8 символов либо пустым.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem) {
        await IncidentClassifierCommandService.incidentClassifierCommandUpdateIncidentCategoryDetails(editingItem.id, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
      } else {
        await IncidentClassifierCommandService.incidentClassifierCommandCreateIncidentCategory(organizationId, {
          name,
          ...(description !== undefined ? { description } : {}),
          ...(targetCategoryId ? { parentCategoryId: targetCategoryId } : {}),
        });
      }
      notify.mutationSuccess("Сохранено", "Категория сохранена в справочнике.");
      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (e) {
      notify.apiError(e, "Не удалось сохранить категорию");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await IncidentClassifierCommandService.incidentClassifierCommandDeactivateIncidentCategory(id);
        notify.mutationSuccess("Категория деактивирована", "Категория скрыта из активного справочника.");
      } else {
        await IncidentClassifierCommandService.incidentClassifierCommandReactivateIncidentCategory(id);
        notify.mutationSuccess("Категория активирована", "Категория снова доступна для использования.");
      }
      loadCategories();
    } catch (e) {
      notify.apiError(e, "Не удалось обновить статус категории");
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm("Удалить категорию и все ее подкатегории/типы?")) {
      try {
        await IncidentClassifierCommandService.incidentClassifierCommandDeleteIncidentCategory(id);
        notify.mutationSuccess("Категория удалена", "Запись категории удалена из справочника.");
        loadCategories();
      } catch (e) {
        notify.apiError(e, "Не удалось удалить категорию");
      }
    }
  };

  const openCategoryModal = (cat?: any, parentId?: string) => {
    setEditingItem(cat ? { id: cat.id, name: cat.name } : null);
    setNewItemName(cat ? cat.name : "");
    setNewItemDescription(cat?.description || "");
    setTargetCategoryId(parentId || null);
    setIsCategoryDialogOpen(true);
  };

  const saveType = async () => {
    const name = cleanText(newItemName) ?? "";
    const description = cleanText(newItemDescription);
    if (name.length < 2 || !targetCategoryId) {
      if (targetCategoryId) notify.error("Проверьте поля", "Название обязательно (≥ 2 символов).");
      return;
    }
    if (description !== undefined && description.length < 8) {
      notify.error("Проверьте описание", "Описание должно быть ≥ 8 символов либо пустым.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem) {
        await IncidentClassifierCommandService.incidentClassifierCommandUpdateIncidentTypeDetails(editingItem.id, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        // Обновляем разрешение для пациентов отдельным вызовом
        if (newItemPatientCanReport) {
          await IncidentClassifierCommandService.incidentClassifierCommandAllowIncidentTypeForPatients(editingItem.id).catch(() => {});
        } else {
          await IncidentClassifierCommandService.incidentClassifierCommandDisallowIncidentTypeForPatients(editingItem.id).catch(() => {});
        }
      } else {
        const res = await IncidentClassifierCommandService.incidentClassifierCommandCreateIncidentType(targetCategoryId, {
          name,
          ...(description !== undefined ? { description } : {}),
        });
        const newTypeId = (res as any).id;
        if (newTypeId && newItemPatientCanReport) {
          await IncidentClassifierCommandService.incidentClassifierCommandAllowIncidentTypeForPatients(newTypeId).catch(() => {});
        }
      }

      const typesResult = await IncidentClassifierQueryService.incidentClassifierQueryListTypesByCategory(targetCategoryId, 100);
      setTypesMap(prev => ({ ...prev, [targetCategoryId!]: (typesResult as any).items || [] }));

      notify.mutationSuccess("Сохранено", "Тип события сохранён в справочнике.");
      setIsTypeDialogOpen(false);
    } catch (e) {
      notify.apiError(e, "Не удалось сохранить тип события");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTypeStatus = async (typeId: string, categoryId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await IncidentClassifierCommandService.incidentClassifierCommandDeactivateIncidentType(typeId);
        notify.mutationSuccess("Тип события деактивирован", "Тип скрыт из активного справочника.");
      } else {
        await IncidentClassifierCommandService.incidentClassifierCommandReactivateIncidentType(typeId);
        notify.mutationSuccess("Тип события активирован", "Тип снова доступен для использования.");
      }
      const typesResult = await IncidentClassifierQueryService.incidentClassifierQueryListTypesByCategory(categoryId, 100);
      setTypesMap(prev => ({ ...prev, [categoryId]: (typesResult as any).items || [] }));
    } catch (e) {
      notify.apiError(e, "Не удалось обновить статус типа");
    }
  };

  const deleteType = async (typeId: string, categoryId: string) => {
    if (confirm("Удалить этот тип события?")) {
      try {
        await IncidentClassifierCommandService.incidentClassifierCommandDeleteIncidentType(typeId);
        const typesResult = await IncidentClassifierQueryService.incidentClassifierQueryListTypesByCategory(categoryId, 100);
        setTypesMap(prev => ({ ...prev, [categoryId]: (typesResult as any).items || [] }));
        notify.mutationSuccess("Тип удалён", "Запись типа события удалена из справочника.");
      } catch (e) {
        notify.apiError(e, "Не удалось удалить тип события");
      }
    }
  };

  const openTypeModal = (categoryId: string, type?: any) => {
    setTargetCategoryId(categoryId);
    setEditingItem(type ? { id: type.id, name: type.name } : null);
    setNewItemName(type ? type.name : "");
    setNewItemDescription(type?.description || "");
    setNewItemPatientCanReport(type ? (type.isAllowedForPatients === true) : false);
    setIsTypeDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Классификатор</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление справочником событий</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {isLoading ? (
            <Skeleton className="h-10 w-full sm:w-64 rounded-md shrink-0" />
          ) : (
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-9 bg-background w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <Button
            onClick={() => openCategoryModal()}
            className="w-full sm:w-auto shrink-0"
            disabled={isLoading || isSaving || !organizationId}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FolderPlus className="mr-2 h-4 w-4" />
            )}
            Категория
          </Button>
        </div>
      </div>

      {!isOrgResolving && !organizationId && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Сначала выберите активную организацию, чтобы управлять её классификатором.
        </div>
      )}

      <div className="border rounded-md bg-card divide-y">
        {isLoading && categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Ничего не найдено</div>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCats.has(cat.id);
            const depth = cat.parentCategoryId ? 1 : 0;
            const typesCount = typesMap[cat.id]?.length || 0;
            const typesLabel = getDeclension(typesCount, ["тип", "типа", "типов"]);
            const isActive = cat.isActive !== false;

            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex items-center justify-between gap-2 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    style={{ paddingLeft: `${depth * 16}px` }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 p-0"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 flex-1 min-w-0">
                      <div
                        className="flex items-center gap-2 cursor-pointer min-w-0"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <Layers className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm break-words">
                          {cat.name}{" "}
                          <span className="text-muted-foreground font-normal whitespace-nowrap">
                            ({typesCount} {typesLabel})
                          </span>
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={getBadgeColor(isActive ? "active" : "inactive")}
                      >
                        {isActive ? "Активна" : "Неактивна"}
                      </Badge>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openCategoryModal(undefined, cat.id); }}>
                          <Plus className="mr-2 h-4 w-4" /> Добавить подкатегорию
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTypeModal(cat.id); }}>
                          <FolderPlus className="mr-2 h-4 w-4" /> Добавить тип события
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }}>
                          <Pencil className="mr-2 h-4 w-4" /> Изменить
                        </DropdownMenuItem>
                        {isActive ? (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCategoryStatus(cat.id, true); }}>
                            <PowerOff className="mr-2 h-4 w-4" /> Деактивировать
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCategoryStatus(cat.id, false); }}>
                            <Power className="mr-2 h-4 w-4 text-emerald-500" /> Активировать
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-muted/5 border-t border-dashed divide-y divide-dashed">
                    {!typesMap[cat.id] ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : typesMap[cat.id].length === 0 ? (
                      <div
                        className="p-4 text-xs text-muted-foreground flex items-center gap-2"
                        style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        Нет типов событий
                      </div>
                    ) : (
                      typesMap[cat.id].map((type) => {
                        const typeActive = type.isActive !== false;
                        return (
                          <div
                            key={type.id}
                            className={`flex items-center justify-between gap-2 p-3 sm:p-4 hover:bg-muted/30 transition-colors ${!typeActive ? "opacity-70" : ""}`}
                          >
                            <div
                              className="flex items-center gap-2 flex-1 min-w-0"
                              style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 flex-1 min-w-0">
                                <span
                                  className={`text-sm break-words min-w-0 ${!typeActive ? "text-muted-foreground line-through" : "text-foreground"}`}
                                >
                                  {type.name}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {!typeActive && (
                                    <Badge variant="outline" className={getBadgeColor("inactive")}>
                                      Неактивен
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px]">
                                    {type.isAllowedForPatients ? "Для пациентов" : "Внутреннее"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center -mr-2 sm:mr-0 shrink-0 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => openTypeModal(cat.id, type)}
                                title="Изменить"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => toggleTypeStatus(type.id, cat.id, typeActive)}
                                title={typeActive ? "Деактивировать" : "Активировать"}
                              >
                                {typeActive
                                  ? <PowerOff className="h-4 w-4" />
                                  : <Power className="h-4 w-4 text-emerald-500" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteType(type.id, cat.id)}
                                title="Удалить навсегда"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Переименовать категорию" : "Новая категория"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Например: Безопасность"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Подробности о категории..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveCategory} disabled={!newItemName.trim() || isSaving}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Переименовать тип" : "Новый тип события"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название типа</Label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Например: Падение пациента"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Инструкция или детали..."
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label>Доступно для пациентов</Label>
                <div className="text-[12px] text-muted-foreground">
                  Могут ли пациенты сами регистрировать этот тип события
                </div>
              </div>
              <Switch
                checked={newItemPatientCanReport}
                onCheckedChange={setNewItemPatientCanReport}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveType} disabled={!newItemName.trim() || isSaving}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
