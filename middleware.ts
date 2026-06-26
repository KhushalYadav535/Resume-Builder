import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest } from "next/server";
import { validateEnv } from "@/lib/env";

export async function middleware(request: NextRequest) {
  validateEnv();
  // Pass the request to the Supabase middleware for token refresh and route protection
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (we secure API routes individually, though some global protections could apply)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
