import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";

type BookingWithListing = Prisma.BookingGetPayload<{
  include: {
    listing: {
      include: {
        owner: {
          select: {
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const bookings: BookingWithListing[] = await prisma.booking.findMany({
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

  const getStatusColor = (status: BookingWithListing["status"]) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "APPROVED":
        return "secondary";
      case "REJECTED":
        return "destructive";
      case "COMPLETED":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">
            Items you&apos;ve requested to borrow
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Link href="/dashboard/listings">
                <Button>Browse Items</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.listing.title}</CardTitle>
                      <CardDescription>
                        Owned by {booking.listing.owner.name}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.startDate), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.endDate), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-sm">Total Price</p>
                    <p className="text-2xl font-bold">
                      ${booking.totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <Link href={`/dashboard/listings/${booking.listing.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
