import { MOCK_ANNOUNCEMENTS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(MOCK_ANNOUNCEMENTS);
}
