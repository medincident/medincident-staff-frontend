import { Metadata } from "next";
import { RequestDetailsView } from "@/app/(main)/requests/[id]/view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Заявка #${id.substring(0, 8)}`,
  };
}

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetailsView requestId={id} />;
}