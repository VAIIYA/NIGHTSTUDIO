import { NextRequest, NextResponse } from "next/server";
import { getCommentReplies } from "@/lib/server-actions";
import { withRateLimit, generalLimiter } from "@/lib/rate-limit";
import { createSuccessResponse, ErrorResponses, withErrorHandler } from "@/lib/api-response";

async function handler(request: NextRequest, { params }: { params: { commentId: string } }) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  try {
    const replies = await withErrorHandler(async () => {
      return await getCommentReplies(params.commentId, limit, offset);
    }, "Failed to fetch comment replies");

    return NextResponse.json(createSuccessResponse({ replies }));
  } catch (error: any) {
    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

export const GET = withRateLimit(handler, generalLimiter);