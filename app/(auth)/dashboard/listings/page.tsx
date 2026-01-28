import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function ListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all listings
  const listings = await prisma.listing.findMany({
    where: {
      isAvailable: true,
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Browse Listings</h1>
            <p className="text-muted-foreground">
              Find items to borrow from your neighbors
            </p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button>Create Listing</Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No listings yet</p>
              <Link href="/dashboard/listings/new">
                <Button>Create the first listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                {listing.imageUrl && (
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">
                      {listing.title}
                    </CardTitle>
                    <Badge variant="secondary">{listing.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">${listing.dailyRate}</p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Listed by {listing.owner.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
