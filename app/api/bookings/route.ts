import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET all bookings for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get bookings where user is the borrower
    const bookings = await prisma.booking.findMany({
      where: {
        borrowerId: user.id,
      },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new booking
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { email: user.email! }, // USE EMAIL NOT ID
      update: {
        id: user.id, // Update ID if needed
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split("@")[0],
      },
    });

    const body = await request.json();
    const { listingId, startDate, endDate, totalPrice } = body;

    // Check if listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!listing.isAvailable) {
      return NextResponse.json(
        { error: "Listing is not available" },
        { status: 400 },
      );
    }

    // Don't allow borrowing your own items
    if (listing.ownerId === user.id) {
      return NextResponse.json(
        { error: "You cannot borrow your own items" },
        { status: 400 },
      );
    }

    // CHECK FOR DATE CONFLICTS
    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);

    // Find any APPROVED bookings that overlap with requested dates
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        listingId,
        status: "APPROVED",
        OR: [
          // Case 1: Existing booking starts during requested period
          {
            startDate: {
              gte: requestStart,
              lte: requestEnd,
            },
          },
          // Case 2: Existing booking ends during requested period
          {
            endDate: {
              gte: requestStart,
              lte: requestEnd,
            },
          },
          // Case 3: Existing booking completely contains requested period
          {
            AND: [
              { startDate: { lte: requestStart } },
              { endDate: { gte: requestEnd } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "This item is already booked for the selected dates" },
        { status: 400 },
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        listingId,
        borrowerId: user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        status: "PENDING",
      },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(booking);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
