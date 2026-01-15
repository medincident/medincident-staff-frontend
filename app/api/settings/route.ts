import { NextResponse } from "next/server";

let MOCK_SETTINGS = {
  timezone: "msk",
  emailNotification: true,
  quietMode: {
    enabled: true,
    from: "23:00",
    to: "06:00",
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(1500);
  return NextResponse.json(MOCK_SETTINGS);
}

export async function POST(request: Request) {
  try {
    await delay(1000);
    const body = await request.json();
    MOCK_SETTINGS = body;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
