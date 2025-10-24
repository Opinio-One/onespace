import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Check for intake session to sync
  if (data.user) {
    try {
      // Check if there's a session_id in localStorage (we can't access it server-side)
      // The client will handle the sync via the /api/intake/sync endpoint
      console.log("User signed in, intake sync will be handled client-side");
    } catch (error) {
      console.error("Error handling intake sync:", error);
      // Don't fail signin if sync fails
    }
  }

  return NextResponse.json({ user: data.user });
}
