import { MOCK_NOTIFICATIONS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(MOCK_NOTIFICATIONS);
}

export async function POST() {
  // Логика "прочитать все"
  MOCK_NOTIFICATIONS.forEach((n) => (n.read = true));
  return NextResponse.json({ success: true });
}
