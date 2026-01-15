import { MOCK_USERS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

let MOCK_SETTINGS = {
  headId: "u_4",
  isActingEnabled: false,
  actingId: "",
  departmentName: "Терапевтическое отделение",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(1500);

  const staff = MOCK_USERS.filter(
    (u) => u.role !== "admin_system" && u.role !== "guest"
  );

  return NextResponse.json({
    settings: MOCK_SETTINGS,
    staff: staff,
  });
}

export async function POST(request: Request) {
  try {
    await delay(1000);
    const body = await request.json();

    if (!body.headId) {
      return NextResponse.json({ error: "Head ID required" }, { status: 400 });
    }

    MOCK_SETTINGS = {
      ...MOCK_SETTINGS,
      ...body,
    };

    return NextResponse.json({ success: true, settings: MOCK_SETTINGS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
