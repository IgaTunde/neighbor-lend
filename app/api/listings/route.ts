import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET all listings
export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(listings);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST create new listing
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, dailyRate, address, imageUrl } = body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        dailyRate,
        address,
        imageUrl,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(listing);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// PATCH/UPDATE listing
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const params = await context.params
    const body = await request.json()

    // Check if user owns this listing
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    if (listing.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this listing" },
        { status: 403 }
      )
    }

    // Update the listing
    const { title, description, category, dailyRate, address, imageUrl } = body

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        dailyRate,
        address,
        imageUrl,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedListing)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}