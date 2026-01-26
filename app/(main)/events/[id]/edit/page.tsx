"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventForm } from "@/components/events/event-form"; 
import { toast } from "sonner";
import { Category } from "@/lib/types"; 

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [initialData, setInitialData] = useState<any>(null);
  const [classifier, setClassifier] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Загружаем И событие, И классификатор параллельно
        const [eventRes, classifierRes] = await Promise.all([
            fetch(`/api/events/${id}`),
            fetch(`/api/classifier`)
        ]);

        if (eventRes.ok && classifierRes.ok) {
          const eventData = await eventRes.json();
          const classifierData = await classifierRes.json();
          
          setInitialData(eventData);
          setClassifier(classifierData);
        } else {
            toast.error("Ошибка", {description: "Не удалось загрузить данные"});
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
                Редактирование события
            </h1>
        </div>
        <div className="bg-card p-6 rounded-xl border space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8.25 w-full rounded-md" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8.25 w-full rounded-md" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-24 w-full rounded-md" />
            </div>
            <Skeleton className="h-12 w-full mt-2 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <EventForm initialData={initialData} classifier={classifier} />
  );
}