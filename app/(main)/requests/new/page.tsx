import { RequestForm } from "@/components/requests/request-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Новая заявка",
};

export default function NewRequestPage() {
  return <RequestForm />;
}