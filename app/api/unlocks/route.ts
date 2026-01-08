import { NextRequest, NextResponse } from "next/server";
import { hasUnlocked } from "@/lib/server-actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get("postId");
  const wallet = searchParams.get("wallet");

  if (!postId || !wallet) {
    return NextResponse.json(
      { error: "Missing postId or wallet" },
      { status: 400 }
    );
  }

  try {
    const unlocked = await hasUnlocked(postId, wallet);
    return NextResponse.json({ unlocked });
  } catch (error) {
    console.error("Error checking unlock:", error);
    return NextResponse.json(
      { error: "Failed to check unlock status" },
      { status: 500 }
    );
  }
}

