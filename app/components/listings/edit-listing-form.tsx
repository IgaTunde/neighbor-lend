"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUploadThing } from "@/lib/uploadthing";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  "Tools",
  "Garden Equipment",
  "Kitchen Appliances",
  "Sports Equipment",
  "Electronics",
  "Other",
];

interface EditListingFormProps {
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    dailyRate: number;
    address: string;
    imageUrl: string | null;
  };
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    listing.imageUrl,
  );
  const [category, setCategory] = useState(listing.category);

  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = listing.imageUrl;

      // Upload new image if provided
      if (imageFile) {
        const uploadedFiles = await startUpload([imageFile]);
        if (uploadedFiles && uploadedFiles[0]) {
          imageUrl = uploadedFiles[0].url;
        }
      }

      // Update listing in database
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          category: category,
          dailyRate: parseFloat(formData.get("dailyRate") as string),
          address: formData.get("address"),
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        throw new Error(errorData.console.error || "Failed to update listing");
      }

      router.push(`/dashboard/listings/${listing.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Listing</CardTitle>
        <CardDescription>Update your item details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={listing.title}
              placeholder="e.g., Power Drill, Ladder, Lawn Mower"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={listing.description}
              placeholder="Describe the item, its condition, and any usage notes..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate ($)</Label>
              <Input
                id="dailyRate"
                name="dailyRate"
                type="number"
                step="0.01"
                min="0"
                defaultValue={listing.dailyRate}
                placeholder="10.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Pickup Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={listing.address}
              placeholder="123 Main St, City, State"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Photo</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <div className="relative w-full h-48">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {imageFile ? "New image selected" : "Current image"}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || isUploading}
            >
              {loading || isUploading ? "Updating..." : "Update Listing"}
            </Button>
            <Link href={`/dashboard/listings/${listing.id}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
