import { ROLE_NAMES } from "@/lib/constants";
import { MOCK_USERS } from "@/lib/mock-db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = MOCK_USERS[0];

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userResponse = {
      ...currentUser,
      role:
        ROLE_NAMES[currentUser.role as keyof typeof ROLE_NAMES] ||
        "Пользователь",

      department:
        currentUser.departmentId === "dep_3"
          ? "Терапевтическое отделение"
          : "Общее отделение",
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Fetch Me Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
