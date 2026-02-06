import { NextResponse } from "next/server";

// API route to verify that environment variables are set correctly
// Returns a JSON object indicating presence of key env vars
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasUploadthingToken: !!process.env.UPLOADTHING_TOKEN,
  });
}
