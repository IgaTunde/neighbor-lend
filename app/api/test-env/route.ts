import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasUploadthingToken: !!process.env.UPLOADTHING_TOKEN,
    // Show first few chars to verify (DON'T show full values!)
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
  });
}
