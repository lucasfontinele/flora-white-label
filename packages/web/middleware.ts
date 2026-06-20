import { NextResponse, type NextRequest } from "next/server";
import { extractSlugFromHost } from "@/lib/tenant-slug";

/**
 * Resolves the tenant from the request subdomain and forwards it to the app as
 * an `x-org-slug` request header, so server components can identify the
 * organization without re-parsing the Host. URLs stay clean (the slug lives in
 * the host, not the path).
 */
export function middleware(request: NextRequest) {
  const slug = extractSlugFromHost(request.headers.get("host"));

  const requestHeaders = new Headers(request.headers);
  if (slug) {
    requestHeaders.set("x-org-slug", slug);
  } else {
    requestHeaders.delete("x-org-slug");
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on pages only; skip API routes, static assets and files with extensions.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand|.*\\..*).*)"],
};
