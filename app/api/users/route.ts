import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
      },
    });

    return NextResponse.json(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
