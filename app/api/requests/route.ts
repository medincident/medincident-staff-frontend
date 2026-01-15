import { SERVICE_TYPE_CONFIG } from "@/lib/constants";
import { requestsDb } from "@/lib/mock-db";
import { NextResponse } from "next/server";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(800);
  // Сортировка по дате (новые сверху)
  const sorted = [...requestsDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const body = await request.json();

  const config = SERVICE_TYPE_CONFIG[body.type];

  const newRequest = {
    id: `REQ-${Date.now()}`,
    number: Math.floor(1000 + Math.random() * 9000),
    status: "created",
    createdAt: new Date().toISOString(),
    responsibleDept: config?.dept || "Общая служба", // Подстановка отдела
    ...body,
  };

  requestsDb.unshift(newRequest);
  return NextResponse.json(newRequest);
}
