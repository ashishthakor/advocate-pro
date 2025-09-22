import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../lib/auth"; // Ensure this path is correct

// This is the main middleware function that runs on every request that matches the config
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Define the protected routes
  const protectedRoutes = {
    "/advocate/dashboard": "advocate",
    "/advocate/clients": "advocate",
    "/users/dashboard": "user",
    "/users/cases": "user",
  };

  const currentPath = request.nextUrl.pathname;

  // Check if the current path is a protected route
  if (Object.keys(protectedRoutes).includes(currentPath)) {
    // If there's no token, redirect to the relevant login page
    if (!token) {
      // Determine the role needed for this route to redirect correctly
      const requiredRole = protectedRoutes[currentPath as keyof typeof protectedRoutes];
      return NextResponse.redirect(
        new URL(`/${requiredRole}/login`, request.url)
      );
    }

    const decoded = verifyToken(token);

    // If the token is invalid, redirect to login
    if (!decoded) {
      const requiredRole = protectedRoutes[currentPath as keyof typeof protectedRoutes];
      return NextResponse.redirect(
        new URL(`/${requiredRole}/login`, request.url)
      );
    }

    // Check if the user's role matches the required role for the page
    if (decoded.role !== protectedRoutes[currentPath as keyof typeof protectedRoutes]) {
      // If roles don't match, redirect to an unauthorized page or their own dashboard
      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, request.url)
      );
    }
  }

  // If the path is not protected or all checks pass, allow the request to proceed
  return NextResponse.next();
}

// This matcher config specifies which routes the middleware should run on.
// This is more efficient than running it on every single request.
export const config = {
  matcher: ["/advocate/:path*", "/users/:path*"],
};
