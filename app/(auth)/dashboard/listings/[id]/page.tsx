import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteListingButton } from "@/app/components/listings/delete-listing-button"


export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch the listing
  const listing = await prisma.listing.findUnique({
    where: { id},
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
  })

  if (!listing) {
    notFound()
  }

  const isOwner = listing.ownerId === user.id

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link href="/dashboard/listings">
          <Button variant="ghost">← Back to listings</Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div>
            {listing.imageUrl ? (
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No image</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <Badge variant="secondary">{listing.category}</Badge>
              </div>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${listing.dailyRate}
                  </span>
                  <span className="text-muted-foreground">per day</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{listing.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {listing.owner.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-medium">{listing.owner.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.owner.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-2">
              {isOwner ? (
                <>
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Button variant="outline" className="flex-1">
                      Edit Listing
                    </Button>
                  </Link>
                  <DeleteListingButton
                    listingId={listing.id}
                    listingTitle={listing.title}
                  />
                </>
              ) : (
                <Button className="w-full" size="lg">
                  Request to Borrow
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Additional info */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">
                {listing.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listed on</p>
              <p className="font-medium">
                {new Date(listing.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}