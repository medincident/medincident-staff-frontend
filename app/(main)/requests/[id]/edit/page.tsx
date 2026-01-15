"use client";

import React, { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { RequestForm } from "@/components/requests/request-form"; 
import { useToast } from "@/components/providers/toast-provider";

export default function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const toast = useToast();

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
            toast.error("Ошибка", "Не удалось загрузить данные заявки");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-20 space-y-6">
        <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-64" />
        </div>

        <div className="bg-card p-6 rounded-xl border space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-12 w-full mt-4" />
        </div>
      </div>
    );
  }

  return (
    <RequestForm initialData={initialData} />
  );
}