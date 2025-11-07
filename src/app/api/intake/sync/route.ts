import { NextRequest, NextResponse } from "next/server";
import { syncAnonymousToUser } from "@/lib/services/intake.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    // Get current user (must be authenticated for sync)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required for sync" },
        { status: 401 }
      );
    }

    // Sync the session
    await syncAnonymousToUser(session_id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in sync intake API:", error);
    return NextResponse.json(
      { error: "Failed to sync intake session" },
      { status: 500 }
    );
  }
}



