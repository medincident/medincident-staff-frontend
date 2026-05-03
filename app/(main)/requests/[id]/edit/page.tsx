import { Metadata } from "next";
import { RequestForm } from "@/components/requests/request-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Редактирование заявки #${id.substring(0, 8)}` };
}

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <RequestForm requestId={id} />
  );
}
