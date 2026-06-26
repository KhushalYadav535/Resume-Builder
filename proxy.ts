import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { validateEnv } from "@/lib/env";

/**
 * Next.js 16+ Proxy Boundary to intercept incoming requests,
 * refresh auth cookies, and handle protected route redirects.
 */
export async function proxy(request: NextRequest) {
  validateEnv();
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder files)
     * - api/parse-resume (exclude PDF parser API to avoid middleware conflicts if called client-side)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/parse-resume|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
