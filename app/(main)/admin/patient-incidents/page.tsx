import type { Metadata } from "next";
import { PatientIncidentsView } from "@/app/(main)/admin/patient-incidents/view";

export const metadata: Metadata = {
  title: "Заявки пациентов",
};

export default function PatientIncidentsPage() {
  return <PatientIncidentsView />;
}
