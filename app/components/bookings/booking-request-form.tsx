"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingRequestFormProps {
  listingId: string;
  dailyRate: number;
  bookedDates?: Array<{ startDate: Date; endDate: Date }>;
}

export function BookingRequestForm({
  listingId,
  bookedDates = [],
  dailyRate,
}: BookingRequestFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  // Helper function to check if a date is within booked ranges
  const isDateBooked = (date: Date) => {
    return bookedDates.some((booking) => {
      const bookingStart = startOfDay(new Date(booking.startDate));
      const bookingEnd = startOfDay(new Date(booking.endDate));
      const checkDate = startOfDay(date);

      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  // Calculate number of days and total price
  const numberOfDays =
    startDate && endDate
      ? differenceInDays(endDate, startDate) + 1 // +1 to include both start and end day
      : 0;

  const totalPrice = numberOfDays * dailyRate;

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      // Success! Redirect to bookings page
      router.push("/dashboard/bookings");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create booking";

      // Show user-friendly message
      if (errorMessage.includes("already booked")) {
        alert(
          "Sorry! This item is already booked for those dates. Please choose different dates.",
        );
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to Borrow</CardTitle>
        <CardDescription>Select your rental dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) =>
                  isBefore(date, startOfDay(new Date())) || isDateBooked(date)
                }
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  isBefore(date, startDate || new Date()) ||
                  isBefore(date, startOfDay(new Date())) ||
                  isDateBooked(date)
                }
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Price Summary */}
        {startDate && endDate && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily rate:</span>
              <span>${dailyRate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Number of days:</span>
              <span>{numberOfDays}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!startDate || !endDate || loading}
        >
          {loading ? "Submitting..." : "Request to Borrow"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your request will be sent to the owner for approval
        </p>
      </CardContent>
    </Card>
  );
}
