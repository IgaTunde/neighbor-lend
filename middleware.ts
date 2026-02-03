import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This middleware ensures that the Supabase session is refreshed on each request
export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // IMPORTANT: never mutate request.cookies in middleware (Edge)
          response = NextResponse.next();

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"], // tighten while debugging
};
