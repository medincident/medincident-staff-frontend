import { Metadata } from "next";
import { HelpView } from "@/app/(main)/profile/help/view";

export const metadata: Metadata = {
  title: "Помощь и справка",
  description: "База знаний и инструкции по работе с системой",
};

export default function HelpPage() {
  return <HelpView />;
}