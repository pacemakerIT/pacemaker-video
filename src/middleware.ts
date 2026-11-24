import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isMcpChangePreview = createRouteMatcher([
  '/admin/main-visual/preview/(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // The admin layout sends signed-out visitors to /admin after sign-in. A
  // preview link from the admin MCP should come back to the preview instead.
  if (isMcpChangePreview(request) && !(await auth()).userId) {
    const signIn = new URL('/sign-in', request.url);
    signIn.searchParams.set('redirect_url', request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
