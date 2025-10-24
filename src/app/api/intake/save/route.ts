import { NextRequest, NextResponse } from "next/server";
import { saveIntakeSession } from "@/lib/services/intake.service";
import { createClient } from "@/lib/supabase/server";
import type { SaveIntakeRequest } from "@/types/intake";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log("Raw request body:", rawBody);

    let body: SaveIntakeRequest;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw body:", rawBody);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { session_id, responses, current_step, disciplines } = body;

    if (!session_id || !responses || !current_step) {
      return NextResponse.json(
        {
          error: "Missing required fields: session_id, responses, current_step",
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

    // Save the session
    const result = await saveIntakeSession(
      userId,
      session_id,
      responses,
      current_step,
      disciplines
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in save intake API:", error);
    return NextResponse.json(
      { error: "Failed to save intake session" },
      { status: 500 }
    );
  }
}
