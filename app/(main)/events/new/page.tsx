"use client";

import { useEffect, useState } from "react";
import { EventForm } from "@/components/events/event-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  
  const [classifier, setClassifier] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassifier = async () => {
      try {
        const res = await fetch("/api/classifier");
        
        if (res.ok) {
          const data = await res.json();
          setClassifier(data);
        } else {
          toast.error("Не удалось загрузить справочник");
        }
      } catch (error) {
        console.error(error);
        toast.error("Ошибка сети");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassifier();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-20">
        <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
                Новое событие
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
    <EventForm classifier={classifier} />
  );
}