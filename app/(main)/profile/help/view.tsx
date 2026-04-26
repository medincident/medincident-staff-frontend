"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { FaqItem } from "@/lib/types";
import { FAQ_DB } from "@/lib/mock-db";

export function HelpView() {
  const router = useRouter();
  
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setFaqItems(FAQ_DB);
      } catch (error) {
        console.error("Failed to load FAQ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">

      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted shrink-0">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground line-clamp-2 break-words">Справка</h1>
          <p className="text-sm text-muted-foreground truncate">База знаний и инструкции</p>
        </div>
      </div>

      {/* CONTENT BLOCK */}
      <div className="space-y-6">

        {/* FAQ Section */}
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
            {isLoading ? (
               /* FAQ SKELETONS */
               <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="flex items-center justify-between py-4 px-1 border-b last:border-0">
                        <Skeleton className="h-4.25 w-3/4 sm:w-1/2" />
                        <Skeleton className="h-4 w-4 rounded-full opacity-50" />
                     </div>
                  ))}
               </div>
            ) : (
               /* REAL FAQ */
               <Accordion type="single" collapsible className="w-full">
                 {faqItems.map((item, index) => (
                   <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 border-border">
                     <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline transition-colors py-4 px-1">
                       {item.question}
                     </AccordionTrigger>
                     <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4 px-1">
                       {item.answer}
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Documentation Section */}
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
          <CardContent>
            {isLoading ? (
               /* DOCS SKELETONS */
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                     <div key={i} className="flex items-start p-4 border rounded-md h-auto gap-4 bg-background">
                        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1 pt-0.5">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-1/2" />
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               /* REAL DOCS */
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4 bg-background hover:bg-muted/50 group border-border min-w-0">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground mr-4 shrink-0 transition-colors group-hover:text-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start text-left gap-0.5 min-w-0 flex-1">
                      <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors break-words whitespace-normal max-w-full">Инструкция пользователя (PDF)</span>
                      <span className="text-[10px] text-muted-foreground font-normal break-words whitespace-normal max-w-full">2.4 MB • Обновлено 10.11.2025</span>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-background hover:bg-muted/50 group border-border min-w-0">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground mr-4 shrink-0 transition-colors group-hover:text-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start text-left gap-0.5 min-w-0 flex-1">
                      <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors break-words whitespace-normal max-w-full">Приказ о мониторинге</span>
                      <span className="text-[10px] text-muted-foreground font-normal break-words whitespace-normal max-w-full">1.1 MB • Приказ №123-П</span>
                    </div>
                  </Button>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}