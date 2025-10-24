import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, full_name } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create profile record in public.profiles table
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: full_name,
      is_admin: false,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't fail signup if profile creation fails, just log it
    }

    // Check for intake session to sync
    try {
      // Check if there's a session_id in localStorage (we can't access it server-side)
      // The client will handle the sync via the /api/intake/sync endpoint
      console.log("User signed up, intake sync will be handled client-side");
    } catch (error) {
      console.error("Error handling intake sync:", error);
      // Don't fail signup if sync fails
    }
  }

  return NextResponse.json({ user: data.user });
}
