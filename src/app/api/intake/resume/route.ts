import { NextRequest, NextResponse } from "next/server";
import { getIntakeSession } from "@/lib/services/intake.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    // Get current user (if authenticated)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: "Either session_id or authenticated user required" },
        { status: 400 }
      );
    }

    // Get the session
    const session = await getIntakeSession(
      userId || undefined,
      sessionId || undefined
    );

    if (!session) {
      return NextResponse.json(
        { error: "No intake session found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error in resume intake API:", error);
    return NextResponse.json(
      { error: "Failed to get intake session" },
      { status: 500 }
    );
  }
}



