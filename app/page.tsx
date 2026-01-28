import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>NeighborLend</CardTitle>
          <CardDescription>Borrow and lend with your neighbors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share tools, equipment, and resources with your local community.
          </p>
          <div className="flex gap-2">
            <Link href="/signup" className="flex-1">
              <Button className="w-full">Get Started</Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                Log In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
