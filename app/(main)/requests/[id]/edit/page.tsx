import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/requests/request-form";
import { requestsDb } from "@/lib/mock-db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const request = requestsDb.find((r) => r.id === id);
  return { title: request ? `Редактирование заявки #${request.number}` : "Заявка не найдена" };
}

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = requestsDb.find((r) => r.id === id);

  if (!request) notFound();

  return (
    <RequestForm
      initialData={{
        id: request.id,
        number: request.number,
        type: request.type,
        location: request.location,
        priority: request.priority as "normal" | "high" | "critical",
        description: request.description,
        linkedEventId: request.linkedEventId || "",
      }}
    />
  );
}
