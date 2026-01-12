"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Я выбрал неверную категорию при создании события. Что делать?",
    answer: "Если статус события 'Зарегистрировано', вы можете его отредактировать. Если событие уже 'В работе', свяжитесь с Ответственным лицом или напишите в чат события."
  },
  {
    question: "Как изменить свой пароль?",
    answer: "Пароль меняется через настройки вашего профиля в Telegram или MAX, так как вход осуществляется через эти сервисы. В самой системе пароль менять не нужно."
  },
  {
    question: "Кто видит мои сообщения о событиях?",
    answer: "Ваше сообщение видит только Ответственное лицо по данной категории (например, Зав. отделением) и Администраторы системы. Анонимность гарантируется внутренними регламентами."
  },
  {
    question: "Приложение не загружается или работает медленно.",
    answer: "Попробуйте очистить кэш браузера или зайти через другую сеть (например, переключиться с Wi-Fi на мобильный интернет). Если проблема сохраняется, напишите в техподдержку."
  },
  {
    question: "Как скачать отчет в Excel?",
    answer: "Перейдите в раздел 'Отчеты' в меню навигации. В правом верхнем углу нажмите кнопку 'Excel', выберите период и дождитесь загрузки файла."
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Справка</h1>
          <p className="text-sm text-muted-foreground">База знаний и инструкции</p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="space-y-6">
        
        {/* FAQ */}
        <Card className="bg-card pb-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg text-foreground">
                    {/* Иконка в едином стиле */}
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
                    {FAQ_ITEMS.map((item, index) => (
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

        {/* Регламенты */}
        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-3">
                    {/* Иконка в едином стиле */}
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
                    {/* Иконка файла: серый квадрат (как в профиле) */}
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground mr-4 shrink-0 transition-colors group-hover:text-foreground">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Инструкция пользователя (PDF)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">2.4 MB • Обновлено 10.11.2025</span>
                    </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4 bg-background hover:bg-muted/50 hover:border-primary/50 group border-border">
                    {/* Иконка файла: серый квадрат (как в профиле) */}
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
    </div>
  );
}