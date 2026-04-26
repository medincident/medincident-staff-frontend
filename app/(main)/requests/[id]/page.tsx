import { Metadata } from "next";
import { RequestDetailsView } from "@/app/(main)/requests/[id]/view";
import { requestsDb } from "@/lib/mock-db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  const request = requestsDb.find((r) => r.id === id);

  return {
    title: request ? `Заявка #${request.number}` : "Заявка не найдена",
  };
}

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetailsView requestId={id} />;
}