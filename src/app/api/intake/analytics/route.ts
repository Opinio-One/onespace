import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { IntakeAnalytics } from "@/types/intake";

export async function POST(request: NextRequest) {
  try {
    const analyticsData: IntakeAnalytics = await request.json();

    const supabase = await createClient();

    // Store in analytics table
    const { error } = await supabase
      .from("intake_analytics")
      .insert(analyticsData);

    if (error) {
      console.error("Error tracking intake event:", error);
      return NextResponse.json(
        { error: "Failed to track analytics event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Failed to process analytics" },
      { status: 500 }
    );
  }
}

