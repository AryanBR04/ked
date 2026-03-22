import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle learning_paths -> learning-paths
  if (pathname.startsWith("/learning_paths")) {
    const newPath = pathname.replace("/learning_paths", "/learning-paths");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Handle career_tracks -> career-tracks
  if (pathname.startsWith("/career_tracks")) {
    const newPath = pathname.replace("/career_tracks", "/career-tracks");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/learning_paths/:path*",
    "/career_tracks/:path*",
  ],
};
