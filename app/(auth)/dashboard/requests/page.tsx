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
import { ApproveRejectButtons } from "@/components/bookings/approve-reject-buttons";

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get booking requests for listings owned by this user
  const requests = await prisma.booking.findMany({
    where: {
      listing: {
        ownerId: user.id,
      },
    },
    include: {
      listing: true,
      borrower: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
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
          <h1 className="text-3xl font-bold">Booking Requests</h1>
          <p className="text-muted-foreground">
            Manage requests for your items
          </p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No booking requests yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.listing.title}</CardTitle>
                      <CardDescription>
                        Requested by {request.borrower.name}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {format(new Date(request.startDate), "PPP")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(request.endDate), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-sm">Total Price</p>
                    <p className="text-2xl font-bold">
                      ${request.totalPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-sm">
                      Borrower Contact
                    </p>
                    <p className="text-sm">{request.borrower.email}</p>
                  </div>

                  {request.status === "PENDING" && (
                    <ApproveRejectButtons bookingId={request.id} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
