import { NextRequest, NextResponse } from "next/server";
import { hasUnlocked } from "@/lib/server-actions";
import { withRateLimit, generalLimiter } from "@/lib/rate-limit";
import { createSuccessResponse, ErrorResponses, withErrorHandler } from "@/lib/api-response";

async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get("postId");
  const wallet = searchParams.get("wallet");

  if (!postId || !wallet) {
    const errorResponse = ErrorResponses.validationError("Missing postId or wallet");
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }

  try {
    const unlocked = await withErrorHandler(async () => {
      return await hasUnlocked(postId, wallet);
    }, "Failed to check unlock status");

    return NextResponse.json(createSuccessResponse({ unlocked }));
  } catch (error: any) {
    const errorResponse = ErrorResponses.internalError(error.message);
    return NextResponse.json(errorResponse.response, { status: errorResponse.statusCode });
  }
}

export const GET = withRateLimit(handler, generalLimiter);

