import { MOCK_USERS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

let MOCK_USERS_DB = [...MOCK_USERS];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(1500);
  return NextResponse.json(MOCK_USERS_DB);
}

export async function POST(request: Request) {
  try {
    await delay(1000);
    const body = await request.json();

    if (Array.isArray(body)) {
      MOCK_USERS_DB = body;
    } else {
      const index = MOCK_USERS_DB.findIndex((u) => u.id === body.id);
      if (index !== -1) {
        MOCK_USERS_DB[index] = body;
      } else {
        MOCK_USERS_DB.push(body);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update users" },
      { status: 500 }
    );
  }
}
