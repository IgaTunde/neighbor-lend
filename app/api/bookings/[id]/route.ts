import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH - Update booking status
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const body = await request.json();
    const { status } = body;

    // Get the booking with listing info
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only the listing owner can approve/reject
    if (booking.listing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this listing" },
        { status: 403 },
      );
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        listing: true,
        borrower: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
