import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecommendationsForDiscipline } from "@/lib/services/recommendation.service";
import { getIntakeProfile } from "@/lib/services/intake.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { discipline: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { discipline } = params;
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    // Get user's intake profile
    const intakeProfile = await getIntakeProfile(user.id);
    if (!intakeProfile) {
      return NextResponse.json(
        { error: "No intake profile found" },
        { status: 404 }
      );
    }

    // Check if discipline is in user's selected disciplines
    if (!intakeProfile.disciplines?.includes(discipline)) {
      return NextResponse.json(
        { error: "Discipline not selected in intake" },
        { status: 400 }
      );
    }

    // Get fresh recommendations
    const recommendations = await getRecommendationsForDiscipline(
      discipline,
      intakeProfile
    );

    return NextResponse.json({
      discipline,
      recommendations,
      lastCalculated: new Date().toISOString(),
      refresh,
    });
  } catch (error) {
    console.error(`Error getting ${params.discipline} recommendations:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


