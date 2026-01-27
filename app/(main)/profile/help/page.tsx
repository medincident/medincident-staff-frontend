"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqItem } from "@/lib/types";

export default function HelpPage() {
  const router = useRouter();
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/settings/help");
        if (res.ok) {
          const data = await res.json();
          setFaqItems(data);
        }
      } catch (error) {
        console.error("Failed to load FAQ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaq();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      {/* HEADER: Виден всегда (Статичный) */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Справка</h1>
          <p className="text-sm text-muted-foreground">База знаний и инструкции</p>
        </div>
      </div>

      {isLoading ? (
        /* --- SKELETON STATE --- */
        <div className="space-y-6">

          {/* FAQ Card Skeleton */}
          <div className="rounded-xl border bg-card text-card-foreground">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2">
                   <Skeleton className="h-5 w-48" />
                   <Skeleton className="h-3 w-64" />
                </div>
              </div>
            </div>
            <div className="p-6 pt-2">
              <div className="space-y-6 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                    <Skeleton className="h-5 w-full max-w-lg mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation Card Skeleton */}
          <div className="rounded-xl border bg-card text-card-foreground">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2">
                   <Skeleton className="h-5 w-32" />
                   <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                   <div key={i} className="h-auto p-4 border rounded-xl flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="space-y-2 flex-1">
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-3 w-1/2" />
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- REAL CONTENT --- */
        <div className="space-y-6">

          <Card className="bg-card pb-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg text-foreground">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                Часто задаваемые вопросы
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ответы на популярные вопросы по работе с системой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 border-border">
                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline transition-colors py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                Документация
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Официальные инструкции и приказы
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Button variant="outline" className="justify-start h-auto p-4 bg-background hover:bg-muted/50 hover:border-primary/50 group border-border">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground mr-4 shrink-0 transition-colors group-hover:text-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start text-left gap-0.5">
                  <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Инструкция пользователя (PDF)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">2.4 MB • Обновлено 10.11.2025</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-4 bg-background hover:bg-muted/50 hover:border-primary/50 group border-border">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground mr-4 shrink-0 transition-colors group-hover:text-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start text-left gap-0.5">
                  <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Приказ о мониторинге</span>
                  <span className="text-[10px] text-muted-foreground font-normal">1.1 MB • Приказ №123-П</span>
                </div>
              </Button>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}