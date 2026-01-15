import { CLASSIFIER } from "@/lib/mock-db";
import { NextResponse } from "next/server";

export async function GET() {
  // Здесь может быть проверка авторизации (session check),
  // чтобы справочник видели только залогиненные юзеры, но не анонимы.

  // Возвращаем данные. В будущем здесь будет запрос в БД:
  // const data = await prisma.classifierCategory.findMany(...)

  return NextResponse.json(CLASSIFIER);
}
