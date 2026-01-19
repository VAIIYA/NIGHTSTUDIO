import { NextRequest, NextResponse } from "next/server";
import { createPost, getPosts } from "@/lib/server-actions";
import { getPostsByAuthor } from "@/lib/server-actions";
import { withRateLimit, generalLimiter, contentCreationLimiter } from "@/lib/rate-limit";
import { createSuccessResponse, ErrorResponses, withErrorHandler } from "@/lib/api-response";

async function getHandler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
  const author = searchParams.get("author");

  try {
    const posts = await withErrorHandler(async () => {
      if (author) {
        return await getPostsByAuthor(author, limit, offset);
      } else {
        return await getPosts(limit, offset);
      }
    }, "Failed to fetch posts");

    return NextResponse.json(createSuccessResponse({ posts }));
  } catch (error: any) {
    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, content, imagePrice } = body;

    if (!author || !content) {
      const errorResponse = ErrorResponses.validationError("Missing required fields: author and content");
      return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
    }

    const post = await withErrorHandler(async () => {
      return await createPost({
        author,
        content,
        imagePrice,
      });
    }, "Failed to create post");

    return NextResponse.json(createSuccessResponse({ post }), { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);

    // Handle validation errors specifically
    if (error.message?.includes('Validation failed')) {
      const errorResponse = ErrorResponses.validationError(error.message);
      return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
    }

    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

export const GET = withRateLimit(getHandler, generalLimiter);
export const POST = withRateLimit(postHandler, contentCreationLimiter);