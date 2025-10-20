import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ user: null, profile: null });
  }

  // Fetch profile data from public.profiles table
  console.log("Fetching profile for user ID:", user.id);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  console.log("Profile query result:", { profile, error: profileError });

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return NextResponse.json({ user, profile: null });
  }

  return NextResponse.json({ user, profile });
}
