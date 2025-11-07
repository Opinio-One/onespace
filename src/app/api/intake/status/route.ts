import { NextRequest, NextResponse } from "next/server";
import { hasCompletedIntake } from "@/lib/services/intake.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ completed: false });
    }

    const completed = await hasCompletedIntake(user.id);
    return NextResponse.json({ completed });
  } catch (error) {
    console.error("Error checking intake status:", error);
    return NextResponse.json({ completed: false });
  }
}



