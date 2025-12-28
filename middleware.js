import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk middleware - required for auth() to work in server components and actions
// This must be exported as default for Clerk to detect it
export default clerkMiddleware();

// Matcher configuration - Clerk recommended pattern for App Router
// This ensures middleware runs on all routes where auth() might be called
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


