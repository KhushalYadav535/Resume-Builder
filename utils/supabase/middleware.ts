import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the user's authentication token and enforces path protection
 * in a Next.js middleware execution cycle.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session and fetch current user securely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect paths: unauthenticated users redirect to /login
  const isProtectedPath =
    pathname === "/dashboard" ||
    pathname === "/analytics" ||
    pathname.startsWith("/analytics/") ||
    pathname.startsWith("/resume/") ||
    pathname.startsWith("/resume") ||
    pathname === "/job-tracker" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/admin");

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Enforce role-based strict routing
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "user";
    const isAdminPath = pathname.startsWith("/admin") || pathname === "/analytics" || pathname.startsWith("/analytics/");
    const isNormalUserPath = isProtectedPath && !isAdminPath;

    // Admin trying to access normal protected pages
    if (role === "admin" && isNormalUserPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // Normal user trying to access admin pages
    if (role !== "admin" && isAdminPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users trying to access login/signup based on role
    const isAuthPath = pathname === "/login" || pathname === "/signup";
    if (isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
