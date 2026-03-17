"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Search, FolderPlus, MoreVertical, Layers, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// --- НОВЫЕ ИМПОРТЫ ---
import { Category, EventType } from "@/lib/types"; 
import { ClassifierService } from "@/lib/api";

export function ClassifierView() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string, name: string } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // --- НОВЫЙ ВЫЗОВ СЕРВИСА OpenAPI ---
      const result = await ClassifierService.getClassifier();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка", { description: "Не удалось загрузить данные" });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. СОХРАНЕНИЕ
  const syncWithServer = async (newData: Category[]) => {
    const prevData = data;
    setData(newData); // Оптимистичное обновление
    setIsSaving(true);

    try {
      // --- НОВЫЙ ВЫЗОВ СЕРВИСА OpenAPI (генератор назвал метод по HTTP-глаголу POST) ---
      await ClassifierService.postClassifier(newData);
      toast.success("Сохранено", { description: "Изменения успешно применены" });
    } catch (e) {
      console.error(e);
      toast.error("Ошибка", { description: "Не удалось сохранить изменения" });
      setData(prevData); // Откат
    } finally {
        setIsSaving(false);
    }
  };

  // --- ЛОГИКА UI ---

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.map(cat => {
      if (cat.name.toLowerCase().includes(lowerSearch)) return cat;
      const matchingTypes = cat.types.filter(t => t.name.toLowerCase().includes(lowerSearch));
      if (matchingTypes.length > 0) return { ...cat, types: matchingTypes };
      return null;
    }).filter(Boolean) as Category[];
  }, [data, search]);

  const openCategoryModal = (cat?: Category) => {
    setEditingItem(cat ? { id: cat.id, name: cat.name } : null);
    setNewItemName(cat ? cat.name : "");
    setIsCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (!newItemName.trim()) return;
    let newData;
    if (editingItem) {
      newData = data.map(c => c.id === editingItem.id ? { ...c, name: newItemName } : c);
    } else {
      const newCat: Category = { id: `cat_${Date.now()}`, name: newItemName, types: [] };
      newData = [...data, newCat];
    }
    syncWithServer(newData);
    setIsCategoryDialogOpen(false);
  };

  const deleteCategory = (id: string) => {
    if (confirm("Удалить категорию и все вложенные типы?")) {
      const newData = data.filter(c => c.id !== id);
      syncWithServer(newData);
    }
  };

  const openTypeModal = (categoryId: string, type?: EventType) => {
    setTargetCategoryId(categoryId);
    setEditingItem(type ? { id: type.id, name: type.name } : null);
    setNewItemName(type ? type.name : "");
    setIsTypeDialogOpen(true);
  };

  const saveType = () => {
    if (!newItemName.trim() || !targetCategoryId) return;
    let newData;
    if (editingItem) {
      newData = data.map(cat => {
        if (cat.id === targetCategoryId) {
          return { ...cat, types: cat.types.map(t => t.id === editingItem.id ? { ...t, name: newItemName } : t) };
        }
        return cat;
      });
    } else {
      const newType: EventType = { id: `type_${Date.now()}`, name: newItemName };
      newData = data.map(cat => {
        if (cat.id === targetCategoryId) {
          return { ...cat, types: [...cat.types, newType] };
        }
        return cat;
      });
    }
    syncWithServer(newData);
    setIsTypeDialogOpen(false);
  };

  const deleteType = (typeId: string, categoryId: string) => {
    if (confirm("Удалить этот тип события?")) {
      const newData = data.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, types: cat.types.filter(t => t.id !== typeId) };
        }
        return cat;
      });
      syncWithServer(newData);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Классификатор</h1>
            <p className="text-sm text-muted-foreground">Управление справочником событий</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {isLoading ? (
             /* SEARCH SKELETON */
             <Skeleton className="h-10 flex-1 lg:w-64 rounded-md" />
          ) : (
             <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск..." className="pl-9 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
             </div>
          )}
          
          <Button onClick={() => openCategoryModal()} className="shrink-0" disabled={isLoading || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="mr-2 h-4 w-4" />}
            Категория
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {isLoading ? (
          /* CARD SKELETONS */
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skel-${i}`} className="flex flex-col overflow-hidden gap-0 p-0 border">
              <CardHeader className="bg-muted/50 border-b pb-3! px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 w-full">
                  <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
                  <Skeleton className="h-4 w-32 rounded-sm" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="p-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-3 bg-muted/30 border-t">
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </Card>
          ))
        ) : (
          filteredData.map((category) => (
            <Card key={category.id} className="flex flex-col overflow-hidden gap-0 p-0 border">
              <CardHeader className="bg-muted/50 border-b pb-3! px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Layers className="h-4 w-4 text-primary shrink-0" />
                  <CardTitle className="text-sm font-bold truncate" title={category.name}>{category.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-background border ">{category.types.length}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openCategoryModal(category)}>
                      <Pencil className="mr-2 h-4 w-4" /> Переименовать
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => deleteCategory(category.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border/50">
                  {category.types.length > 0 ? (
                    category.types.map((type) => (
                      <div key={type.id} className="group flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-sm">
                        <span className="text-foreground truncate pr-2">{type.name}</span>
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openTypeModal(category.id, type)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteType(type.id, category.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground italic">Нет типов событий</div>
                  )}
                </div>
              </CardContent>
              <div className="p-3 bg-muted/30 border-t">
                <Button variant="outline" size="sm" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-transparent" onClick={() => openTypeModal(category.id)}>
                  <Plus className="mr-2 h-3.5 w-3.5" /> Добавить тип
                </Button>
              </div>
            </Card>
          ))
        )}
        
        {!isLoading && filteredData.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4"><Search className="h-6 w-6 text-muted-foreground" /></div>
            <p>Ничего не найдено</p>
          </div>
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
          </div>
          <DialogFooter>
            <Button onClick={saveType} disabled={!newItemName.trim() || isSaving}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}