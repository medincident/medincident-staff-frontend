import { MOCK_STATS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(1000);
  return NextResponse.json(MOCK_STATS);
}
