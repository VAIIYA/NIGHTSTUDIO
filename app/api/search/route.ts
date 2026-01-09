import { NextRequest, NextResponse } from "next/server";
import { searchPosts, searchProfiles, searchComments } from "@/lib/server-actions";
import { withRateLimit, generalLimiter } from "@/lib/rate-limit";
import { createSuccessResponse, ErrorResponses, withErrorHandler } from "@/lib/api-response";

async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "all"; // posts, profiles, comments, all
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  if (!query || query.trim().length < 2) {
    const errorResponse = ErrorResponses.validationError("Search query must be at least 2 characters long");
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }

  try {
    const results: any = {};

    if (type === "posts" || type === "all") {
      results.posts = await withErrorHandler(async () => {
        return await searchPosts(query.trim(), limit, offset);
      }, "Failed to search posts");
    }

    if (type === "profiles" || type === "all") {
      results.profiles = await withErrorHandler(async () => {
        return await searchProfiles(query.trim(), limit, offset);
      }, "Failed to search profiles");
    }

    if (type === "comments" || type === "all") {
      results.comments = await withErrorHandler(async () => {
        return await searchComments(query.trim(), limit, offset);
      }, "Failed to search comments");
    }

    return NextResponse.json(createSuccessResponse({
      query: query.trim(),
      type,
      results,
      meta: {
        limit,
        offset,
        hasMore: false, // Could implement pagination logic here
      }
    }));
  } catch (error: any) {
    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

export const GET = withRateLimit(handler, generalLimiter);