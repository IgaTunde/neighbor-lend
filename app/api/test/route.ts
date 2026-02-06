import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Try to count users in the database
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Database connected!",
      userCount,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
