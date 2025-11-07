import { NextRequest, NextResponse } from "next/server";
import { completeIntakeSession } from "@/lib/services/intake.service";
import { createClient } from "@/lib/supabase/server";
import type { CompleteIntakeRequest } from "@/types/intake";

export async function POST(request: NextRequest) {
  try {
    const body: CompleteIntakeRequest = await request.json();
    const { session_id, responses, disciplines } = body;

    if (!session_id || !responses || !disciplines || disciplines.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: session_id, responses, disciplines",
        },
        { status: 400 }
      );
    }

    // Get current user (if authenticated)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Complete the session
    const result = await completeIntakeSession(
      userId,
      session_id,
      responses,
      disciplines
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in complete intake API:", error);
    return NextResponse.json(
      { error: "Failed to complete intake session" },
      { status: 500 }
    );
  }
}



