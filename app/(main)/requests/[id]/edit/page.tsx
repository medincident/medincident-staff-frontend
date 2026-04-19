"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestForm } from "@/components/requests/request-form"; 
import { notify } from "@/lib/toast";

// Этот справочник можно вынести в отдельный файл констант или загружать с API
const SERVICE_TYPES = [
  { id: "plumbing", label: "Сантехника" },
  { id: "electric", label: "Электрика" },
  { id: "it_support", label: "IT Поддержка / Оргтехника" },
  { id: "it_soft", label: "IT Программное обеспечение" },
  { id: "med_equipment", label: "Медтехника" },
  { id: "furniture", label: "Мебель / Ремонт помещений" },
  { id: "cleaning", label: "Клининг / Дезинфекция" },
  { id: "ventilation", label: "Вентиляция и кондиционирование" },
];

export default function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/requests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInitialData(data);
        } else {
            notify.error("Ошибка", "Не удалось загрузить данные заявки.");
        }
      } catch (error) {
        console.error(error);
        notify.error("Ошибка сети", "Не удалось связаться с сервером. Проверьте соединение.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        
        {/* HEADER SKELETON */}
        <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
                Редактирование заявки
            </h1>
        </div>

        {/* FORM SKELETON (Structure matches the real form) */}
        <div className="bg-card p-6 rounded-xl border space-y-6">
            
            {/* Grid: Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" /> {/* Label */}
                    <Skeleton className="h-8.25 w-full rounded-md" /> {/* Input */}
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8.25 w-full rounded-md" />
                </div>
            </div>

            {/* Priority Cards */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-40" /> {/* Label */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full rounded-md" />
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-full mt-4 rounded-md" />
        </div>
      </div>
    );
  }

  // Передаем справочник и данные в чистую форму
  return (
    <RequestForm initialData={initialData} />
  );
}