import { Metadata } from "next";
import { AccessibilityView } from "./view";

export const metadata: Metadata = {
  title: "Специальные возможности",
};

export default function AccessibilityPage() {
  return <AccessibilityView />;
}
