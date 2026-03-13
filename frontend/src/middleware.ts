import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Only apply Clerk auth middleware if a publishable key is configured
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server');
      const isProtectedRoute = createRouteMatcher([
        '/dashboard(.*)',
        '/upload(.*)',
        '/record(.*)',
        '/result(.*)',
        '/history(.*)',
      ]);
      return clerkMiddleware((auth: any, req: any) => {
        if (isProtectedRoute(req)) {
          auth().protect();
        }
      })(request, {} as any);
    } catch {
      // Clerk not available
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
