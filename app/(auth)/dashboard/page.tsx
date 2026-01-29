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
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      listings: true,
      bookings: true,
    },
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {dbUser?.name}!
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <Button variant="outline">Log out</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
              <CardDescription>Items you&apos;re lending</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dbUser?.listings.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Items you&apos;re borrowing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dbUser?.bookings.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{user.email}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/dashboard/listings/new">
              <Button>Create Listing</Button>
            </Link>
            <Link href="/dashboard/listings">
              <Button variant="outline">Browse Items</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
