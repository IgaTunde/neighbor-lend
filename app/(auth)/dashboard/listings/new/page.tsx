import { ListingForm } from "@/app/components/listings/listing-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user }, error
  } = await supabase.auth.getUser();

  console.log('Data - user:', user)
  console.log('Data - error:', error)

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <ListingForm />
      </div>
    </div>
  );
}
