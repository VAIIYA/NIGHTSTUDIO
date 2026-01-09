import { NextRequest, NextResponse } from "next/server";
import { addComment, getPostComments, getCommentReplies } from "@/lib/server-actions";
import { withRateLimit, generalLimiter, contentCreationLimiter } from "@/lib/rate-limit";
import { createSuccessResponse, ErrorResponses, withErrorHandler } from "@/lib/api-response";

async function getHandler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get("postId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  if (!postId) {
    const errorResponse = ErrorResponses.validationError("Missing postId parameter");
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }

  try {
    const comments = await withErrorHandler(async () => {
      return await getPostComments(postId, limit, offset);
    }, "Failed to fetch comments");

    return NextResponse.json(createSuccessResponse({ comments }));
  } catch (error: any) {
    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, author, content, parentCommentId } = body;

    if (!postId || !author || !content) {
      const errorResponse = ErrorResponses.validationError("Missing required fields: postId, author, and content");
      return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
    }

    const comment = await withErrorHandler(async () => {
      return await addComment(postId, author, content, parentCommentId);
    }, "Failed to create comment");

    return NextResponse.json(createSuccessResponse({ comment }), { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);

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