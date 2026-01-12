import { notFound } from "next/navigation";
import { RequestForm } from "@/components/forms/request-form";

// MOCK-функция для получения данных (в реальности запрос к API)
const getRequestById = (id: string) => {
  // Тестовые данные для примера
  if (id === "req_1") {
    return {
      id: "req_1",
      type: "electric",
      location: "Кабинет 305",
      priority: "urgent" as const, // важно указать as const для enum
      description: "Мигает лампа над рабочим столом врача, мешает приеме.",
    };
  }
  
  // Возвращаем дефолтную заглушку для любого ID чтобы вы могли проверить работу
  return {
    id: id,
    type: "plumbing",
    location: "Туалет 2 этаж",
    priority: "normal" as const,
    description: "Течет кран, редактирование заявки " + id,
  };
};

interface EditRequestPageProps {
  params: {
    id: string;
  };
}

export default function EditRequestPage({ params }: EditRequestPageProps) {
  const requestData = getRequestById(params.id);

  if (!requestData) {
    return notFound();
  }

  return <RequestForm initialData={requestData} />;
}