import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase auth requires NEXT_PUBLIC_SUPABASE_URL and a public Supabase key."
    );
  }

  return { url, key };
}

function copyAuthCookies(source: NextResponse, destination: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) {
      destination.headers.set(header, value);
    }
  }
}

export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }

        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  let isAuthenticated = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && Boolean(data?.claims);
  } catch (error) {
    console.error("Supabase session verification failed:", error);
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }

  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    const redirect = NextResponse.redirect(loginUrl);
    copyAuthCookies(response, redirect);
    return redirect;
  }

  if (isAuthenticated && isLoginPage) {
    const dashboardUrl = new URL("/dashboard", request.url);
    const redirect = NextResponse.redirect(dashboardUrl);
    copyAuthCookies(response, redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/predictions/:path*",
    "/screener/:path*",
    "/settings/:path*",
  ],
};
