import { APP_CONFIG } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нет подключения",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Нет интернета 📡</h1>
      <p className="text-muted-foreground mb-8">
        Похоже, вы не подключены к сети. Проверьте соединение.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Обновить страницу
      </button>
    </div>
  );
}