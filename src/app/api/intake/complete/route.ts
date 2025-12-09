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
      error: authError,
    } = await supabase.auth.getUser();
    
    // Don't fail if auth check fails - allow anonymous completion
    if (authError) {
      console.warn("Auth check failed, continuing as anonymous:", authError);
    }
    
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
    
    // Provide more specific error information
    let errorMessage = "Failed to complete intake session";
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Check for Supabase-specific errors
      if (
        error.message.includes("Supabase") ||
        error.message.includes("PGRST") ||
        error.message.includes("connection") ||
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Database connection error";
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout";
        statusCode = 504; // Gateway Timeout
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}




