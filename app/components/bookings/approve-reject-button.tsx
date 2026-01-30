"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ApproveRejectButtonsProps {
  bookingId: string;
}

export function ApproveRejectButtons({ bookingId }: ApproveRejectButtonsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    setLoadingAction(action);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update booking");
      }

      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex gap-2 pt-2">
      <Button
        onClick={() => handleAction("APPROVED")}
        disabled={loadingAction !== null}
        className="flex-1"
      >
        {loadingAction === "APPROVED" ? "Approving..." : "Approve"}
      </Button>
      <Button
        onClick={() => handleAction("REJECTED")}
        disabled={loadingAction !== null}
        variant="destructive"
        className="flex-1"
      >
        {loadingAction === "REJECTED" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
