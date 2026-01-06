"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  Send,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Имитация отправки
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Сообщение отправлено в техподдержку!");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Справка и поддержка</h1>
          <p className="text-sm text-muted-foreground">Ответы на вопросы и связь с техподдержкой</p>
        </div>
      </div>

      {/* Поиск по базе знаний */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Поиск вопроса..." 
            className="pl-9 bg-background border-border h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: FAQ (Занимает 2 части) */}
        <div className="md:col-span-2 space-y-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Часто задаваемые вопросы
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Самые популярные вопросы сотрудников
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {FAQ_ITEMS.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border last:border-0">
                                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline transition-colors">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">Регламенты и инструкции</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button variant="outline" className="justify-start h-auto py-3 bg-background border-border hover:bg-muted">
                        <FileText className="mr-2 h-4 w-4 text-destructive" />
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-foreground">Инструкция пользователя (PDF)</span>
                            <span className="text-xs text-muted-foreground font-normal">2.4 MB • Обновлено 10.11.2025</span>
                        </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 bg-background border-border hover:bg-muted">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-foreground">Приказ о мониторинге НС</span>
                            <span className="text-xs text-muted-foreground font-normal">1.1 MB • Приказ №123-П</span>
                        </div>
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Контакты и Форма */}
        <div className="md:col-span-1 space-y-6">
            
            {/* Контакты */}
            {/* Используем primary/10 для фона, чтобы он был слегка зеленым в любой теме */}
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Нужна помощь?</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Свяжитесь с отделом IT напрямую
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-background rounded-full text-primary">
                            <Phone className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">12-45 (Внутренний)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-background rounded-full text-primary">
                            <Mail className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">help@hospital.ru</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-background rounded-full text-primary">
                            <MessageCircle className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">@medsafety_support</span>
                    </div>
                </CardContent>
            </Card>

            {/* Форма обратной связи */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base text-foreground">Написать разработчикам</CardTitle>
                    <CardDescription className="text-muted-foreground">Сообщить об ошибке или предложить идею</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-foreground">Тема</Label>
                            <Input 
                                id="subject" 
                                placeholder="Например: Баг при входе" 
                                required 
                                className="bg-background border-input text-foreground" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-foreground">Сообщение</Label>
                            <Textarea 
                                id="message" 
                                placeholder="Опишите проблему..." 
                                className="min-h-[100px] bg-background border-input text-foreground" 
                                required 
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            Отправить
                        </Button>
                    </form>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}