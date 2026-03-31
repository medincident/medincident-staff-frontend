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
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { 
  EventsService, 
  CategoryBrief, 
  EventType, 
  CreateCategoryRequest, 
  CreateEventTypeRequest 
} from "@/lib/api";
import { getBadgeColor } from "@/lib/status-helper";

// Функция для правильного склонения слов (например: 1 тип, 2 типа, 5 типов)
const getDeclension = (number: number, words: string[]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
};

export function ClassifierView() {
  const [categories, setCategories] = useState<CategoryBrief[]>([]);
  const [typesMap, setTypesMap] = useState<Record<string, EventType[]>>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string, name: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPatientCanReport, setNewItemPatientCanReport] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [search]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const result = await EventsService.listEventCategories(true, search || undefined);
      const fetchedCats = result.items;
      setCategories(fetchedCats);

      const typesPromises = fetchedCats.map(cat => 
        EventsService.listEventCategoryTypes(cat.id).then(res => ({ id: cat.id, types: res.items }))
      );
      
      const typesResults = await Promise.all(typesPromises);
      
      const newTypesMap: Record<string, EventType[]> = {};
      typesResults.forEach(res => {
        newTypesMap[res.id] = res.types;
      });
      
      setTypesMap(newTypesMap);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка", { description: "Не удалось загрузить справочник" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCats);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCats(newExpanded);
  };

  // --- CRUD Категорий ---
  const saveCategory = async () => {
    if (!newItemName.trim()) return;
    setIsSaving(true);
    try {
      if (editingItem) {
        await EventsService.updateEventCategory(editingItem.id, { 
          name: newItemName,
          description: newItemDescription || null
        });
      } else {
        const payload: CreateCategoryRequest = { 
          name: newItemName, 
          code: `cat_${Date.now()}`,
          parentId: targetCategoryId,
          description: newItemDescription || null
        };
        await EventsService.createEventCategory(payload);
      }
      toast.success("Сохранено");
      setIsCategoryDialogOpen(false);
      loadCategories();
    } catch (e) {
      toast.error("Ошибка при сохранении категории");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await EventsService.deactivateEventCategory(id);
        toast.success("Категория деактивирована");
      } else {
        await EventsService.reactivateEventCategory(id);
        toast.success("Категория активирована");
      }
      loadCategories();
    } catch (e) {
      toast.error("Ошибка при изменении статуса");
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm("Удалить категорию и все ее подкатегории/типы?")) {
      try {
        await EventsService.deleteEventCategory(id);
        toast.success("Категория удалена");
        loadCategories();
      } catch (e) {
        toast.error("Ошибка при удалении");
      }
    }
  };

  const openCategoryModal = (cat?: CategoryBrief & { description?: string }, parentId?: string) => {
    setEditingItem(cat ? { id: cat.id, name: cat.name } : null);
    setNewItemName(cat ? cat.name : "");
    setNewItemDescription(cat?.description || "");
    setTargetCategoryId(parentId || null);
    setIsCategoryDialogOpen(true);
  };

  // --- CRUD Типов событий ---
  const saveType = async () => {
    if (!newItemName.trim() || !targetCategoryId) return;
    setIsSaving(true);
    try {
      if (editingItem) {
        await EventsService.updateEventType(editingItem.id, { 
          name: newItemName,
          description: newItemDescription || null,
          patientCanReport: newItemPatientCanReport
        });
      } else {
        const payload: CreateEventTypeRequest = {
          name: newItemName,
          code: `type_${Date.now()}`,
          description: newItemDescription || null,
          patientCanReport: newItemPatientCanReport
        };
        await EventsService.createEventType(targetCategoryId, payload);
      }
      
      const typesResult = await EventsService.listEventCategoryTypes(targetCategoryId);
      setTypesMap(prev => ({ ...prev, [targetCategoryId]: typesResult.items }));
      
      toast.success("Сохранено");
      setIsTypeDialogOpen(false);
    } catch (e) {
      toast.error("Ошибка при сохранении типа");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTypeStatus = async (typeId: string, categoryId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await EventsService.deactivateEventType(typeId);
        toast.success("Тип события деактивирован");
      } else {
        await EventsService.reactivateEventType(typeId);
        toast.success("Тип события активирован");
      }
      const typesResult = await EventsService.listEventCategoryTypes(categoryId);
      setTypesMap(prev => ({ ...prev, [categoryId]: typesResult.items }));
    } catch (e) {
      toast.error("Ошибка при изменении статуса");
    }
  };

  const deleteType = async (typeId: string, categoryId: string) => {
    if (confirm("Удалить этот тип события?")) {
      try {
        await EventsService.deleteEventType(typeId);
        const typesResult = await EventsService.listEventCategoryTypes(categoryId);
        setTypesMap(prev => ({ ...prev, [categoryId]: typesResult.items }));
        toast.success("Тип удален");
      } catch (e) {
        toast.error("Ошибка при удалении");
      }
    }
  };

  const openTypeModal = (categoryId: string, type?: EventType) => {
    setTargetCategoryId(categoryId);
    setEditingItem(type ? { id: type.id, name: type.name } : null);
    setNewItemName(type ? type.name : "");
    setNewItemDescription(type?.description || "");
    setNewItemPatientCanReport(type ? type.patientCanReport : false);
    setIsTypeDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Классификатор</h1>
            <p className="text-sm text-muted-foreground">Управление справочником событий</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {isLoading ? (
             <Skeleton className="h-10 w-full sm:w-64 rounded-md shrink-0" />
          ) : (
             <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск..." className="pl-9 bg-background w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
             </div>
          )}
          
          <Button onClick={() => openCategoryModal()} className="w-full sm:w-auto shrink-0" disabled={isLoading || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="mr-2 h-4 w-4" />}
            Категория
          </Button>
        </div>
      </div>

      {/* LIST VIEW (Без таблицы) */}
      <div className="border rounded-md bg-card divide-y">
        {isLoading && categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Ничего не найдено</div>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCats.has(cat.id);
            const depth = cat.parentId ? 1 : 0; 
            
            const typesCount = typesMap[cat.id]?.length || 0;
            const typesLabel = getDeclension(typesCount, ['тип', 'типа', 'типов']);

            return (
              <div key={cat.id} className="flex flex-col">
                {/* Строка категории */}
                <div className="flex items-start justify-between gap-2 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-2 flex-1 min-w-0" style={{ paddingLeft: `${depth * 16}px` }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0 p-0 mt-[-2px] sm:mt-0" 
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                      <div 
                        className="flex items-start sm:items-center gap-2 cursor-pointer flex-1 min-w-0" 
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                        <span className="font-medium text-sm leading-tight break-words">
                          {cat.name} <span className="text-muted-foreground font-normal ml-1 whitespace-nowrap">({typesCount} {typesLabel})</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 ml-6 sm:ml-0">
                        <Badge variant="outline" className={getBadgeColor(cat.isActive !== false ? "active" : "inactive")}>
                          {cat.isActive !== false ? "Активна" : "Неактивна"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки действий (Справа) */}
                  <div className="shrink-0 ml-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
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
                        {cat.isActive !== false ? (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCategoryStatus(cat.id, true); }}>
                            <PowerOff className="mr-2 h-4 w-4" /> Деактивировать
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCategoryStatus(cat.id, false); }}>
                            <Power className="mr-2 h-4 w-4 text-emerald-500" /> Активировать
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить (полностью)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Развернутые типы событий */}
                {isExpanded && (
                  <div className="bg-muted/5 border-t border-dashed divide-y divide-dashed">
                    {!typesMap[cat.id] ? (
                       <div className="p-4 text-center text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                    ) : typesMap[cat.id].length === 0 ? (
                       <div className="p-4 text-xs text-muted-foreground flex items-center gap-2" style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}>
                         <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                         Нет типов событий
                       </div>
                    ) : (
                      typesMap[cat.id].map(type => (
                        <div key={type.id} className={`flex items-start justify-between gap-2 p-3 sm:p-4 hover:bg-muted/30 transition-colors ${type.isActive === false ? 'opacity-70' : ''}`}>
                          
                          <div className="flex items-start gap-2 flex-1 min-w-0" style={{ paddingLeft: `${(depth + 1) * 16 + 24}px` }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0 mt-1.5 sm:mt-2" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                              <span className={`text-sm leading-tight break-words flex-1 min-w-0 ${type.isActive === false ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {type.name}
                              </span>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {type.isActive === false && (
                                  <Badge variant="outline" className={getBadgeColor("inactive")}>
                                    Неактивен
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px]">{type.patientCanReport ? 'Для пациентов' : 'Внутреннее'}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center -mr-2 sm:mr-0 shrink-0 ml-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openTypeModal(cat.id, type)} title="Изменить">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => toggleTypeStatus(type.id, cat.id, type.isActive !== false)} title={type.isActive !== false ? "Деактивировать" : "Активировать"}>
                              {type.isActive !== false ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4 text-emerald-500" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteType(type.id, cat.id)} title="Удалить навсегда">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* DIALOGS */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Переименовать категорию' : 'Новая категория'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Например: Безопасность" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="Подробности о категории..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveCategory} disabled={!newItemName.trim() || isSaving}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Переименовать тип' : 'Новый тип события'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название типа</Label>
              <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Например: Падение пациента" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Описание (опционально)</Label>
              <Input value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="Инструкция или детали..." />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label>Доступно для пациентов</Label>
                <div className="text-[12px] text-muted-foreground">Могут ли пациенты сами регистрировать этот тип события</div>
              </div>
              <Switch checked={newItemPatientCanReport} onCheckedChange={setNewItemPatientCanReport} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveType} disabled={!newItemName.trim() || isSaving}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}