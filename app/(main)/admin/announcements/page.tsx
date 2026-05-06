import { Metadata } from "next";
import { AnnouncementsView } from "./view";

export const metadata: Metadata = {
  title: "Объявления",
};

export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
