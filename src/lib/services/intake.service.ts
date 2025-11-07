import { createClient } from "@/lib/supabase/server";
import type {
  IntakeSession,
  IntakeProfile,
  IntakeResponses,
  NormalizedProfile,
  SaveIntakeRequest,
  SaveIntakeResponse,
  ResumeIntakeResponse,
  CompleteIntakeRequest,
  CompleteIntakeResponse,
} from "@/types/intake";

/**
 * Save or update an intake session
 */
export async function saveIntakeSession(
  userId: string | null,
  sessionId: string,
  responses: IntakeResponses,
  currentStep: string,
  disciplines?: string[]
): Promise<SaveIntakeResponse> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("intake_sessions")
      .upsert(
        {
          user_id: userId,
          session_id: sessionId,
          responses,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "session_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving intake session:", error);
      throw new Error(`Failed to save intake session: ${error.message}`);
    }

    return {
      success: true,
      session_id: sessionId,
      current_step: currentStep,
      last_saved: data.updated_at,
    };
  } catch (error) {
    console.error("Error in saveIntakeSession:", error);
    throw error;
  }
}

/**
 * Get an intake session by user ID or session ID
 */
export async function getIntakeSession(
  userId?: string,
  sessionId?: string
): Promise<ResumeIntakeResponse | null> {
  const supabase = await createClient();

  try {
    let query = supabase.from("intake_sessions").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      throw new Error("Either userId or sessionId must be provided");
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No session found
      }
      console.error("Error getting intake session:", error);
      throw new Error(`Failed to get intake session: ${error.message}`);
    }

    return {
      session_id: data.session_id,
      responses: data.responses,
      current_step: data.current_step || "budget",
      completed: data.completed,
      disciplines: extractDisciplinesFromResponses(data.responses),
    };
  } catch (error) {
    console.error("Error in getIntakeSession:", error);
    throw error;
  }
}

/**
 * Complete an intake session and create normalized profile
 */
export async function completeIntakeSession(
  userId: string | null,
  sessionId: string,
  responses: IntakeResponses,
  disciplines: string[]
): Promise<CompleteIntakeResponse> {
  const supabase = await createClient();

  try {
    // Mark session as completed
    const { data: sessionData, error: sessionError } = await supabase
      .from("intake_sessions")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        responses,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .select()
      .single();

    if (sessionError) {
      console.error("Error completing intake session:", sessionError);
      throw new Error(
        `Failed to complete intake session: ${sessionError.message}`
      );
    }

    // Compute normalized profile
    const normalizedProfile = computeNormalizedProfile(responses, disciplines);

    // Create intake profile
    const { data: profileData, error: profileError } = await supabase
      .from("intake_profiles")
      .upsert(
        {
          user_id: userId,
          session_id: sessionData.id,
          budget_min: normalizedProfile.budget.min,
          budget_max: normalizedProfile.budget.max,
          goals: normalizedProfile.goals.primary,
          disciplines,
          profile_data: normalizedProfile,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Error creating intake profile:", profileError);
      throw new Error(
        `Failed to create intake profile: ${profileError.message}`
      );
    }

    return {
      success: true,
      profile_id: profileData.id,
      normalized_profile: normalizedProfile,
    };
  } catch (error) {
    console.error("Error in completeIntakeSession:", error);
    throw error;
  }
}

/**
 * Sync anonymous session to authenticated user
 */
export async function syncAnonymousToUser(
  sessionId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Update session with user ID
    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .update({ user_id: userId })
      .eq("session_id", sessionId);

    if (sessionError) {
      console.error("Error syncing session to user:", sessionError);
      throw new Error(`Failed to sync session: ${sessionError.message}`);
    }

    // If session is completed, also update profile
    const { data: sessionData } = await supabase
      .from("intake_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (sessionData?.completed) {
      const { error: profileError } = await supabase
        .from("intake_profiles")
        .update({ user_id: userId })
        .eq("session_id", sessionData.id);

      if (profileError) {
        console.error("Error syncing profile to user:", profileError);
        // Don't throw here, session sync is more important
      }
    }
  } catch (error) {
    console.error("Error in syncAnonymousToUser:", error);
    throw error;
  }
}

/**
 * Compute normalized profile from responses
 */
function computeNormalizedProfile(
  responses: IntakeResponses,
  disciplines: string[]
): NormalizedProfile {
  const budgetRange = responses.budget_range || "10k_25k";
  const budgetMapping = {
    under_10k: { min: 0, max: 10000 },
    "10k_25k": { min: 10000, max: 25000 },
    "25k_50k": { min: 25000, max: 50000 },
    "50k_100k": { min: 50000, max: 100000 },
    over_100k: { min: 100000, max: 500000 },
  };

  const budget = budgetMapping[budgetRange as keyof typeof budgetMapping] || {
    min: 10000,
    max: 25000,
  };

  return {
    budget: {
      min: budget.min,
      max: budget.max,
      range: budgetRange,
    },
    goals: {
      primary: responses.primary_goals || [],
      secondary: [],
    },
    home: {
      type: responses.home_type || "rijtjeshuis",
      heating_system: responses.current_heating || "cv_ketel",
      energy_bill: responses.wp?.current_energy_bill || "100_200",
    },
    disciplines: {
      wp: responses.wp
        ? {
            heating_type: responses.wp.heating_type || "lucht_water",
            rooms: responses.wp.rooms_to_heat || 3,
            energy_bill: responses.wp.current_energy_bill || "100_200",
          }
        : undefined,
      pv: responses.pv
        ? {
            roof_orientation: responses.pv.roof_orientation || "zuid",
            roof_type: responses.pv.roof_type || "pannen",
            consumption: responses.pv.monthly_consumption || "2000_3500",
            shade: responses.pv.roof_shade || "geen",
          }
        : undefined,
      battery: responses.battery
        ? {
            usage_pattern: responses.battery.usage_pattern || "gelijkmatig",
            backup_priority: responses.battery.backup_priority || "enigszins",
            peak_hours: responses.battery.peak_hours || [],
          }
        : undefined,
      isolatie: responses.isolatie
        ? {
            current_insulation:
              responses.isolatie.current_insulation || "matig",
            wall_type: responses.isolatie.wall_type || "spouwmuur",
            window_type: responses.isolatie.window_type || "dubbel_glas",
          }
        : undefined,
      ac: responses.ac
        ? {
            cooling_needs: responses.ac.cooling_needs || "matig",
            room_count: responses.ac.room_count || 2,
            noise_sensitivity: responses.ac.noise_sensitivity || "enigszins",
          }
        : undefined,
    },
  };
}

/**
 * Extract disciplines from responses
 */
function extractDisciplinesFromResponses(responses: IntakeResponses): string[] {
  const disciplines: string[] = [];

  if (responses.wp) disciplines.push("wp");
  if (responses.pv) disciplines.push("pv");
  if (responses.battery) disciplines.push("battery");
  if (responses.isolatie) disciplines.push("isolatie");
  if (responses.ac) disciplines.push("ac");

  return disciplines;
}

/**
 * Get user's intake profile
 */
export async function getIntakeProfile(
  userId: string
): Promise<IntakeProfile | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("intake_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No profile found
      }
      console.error("Error getting intake profile:", error);
      throw new Error(`Failed to get intake profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getIntakeProfile:", error);
    throw error;
  }
}

/**
 * Check if user has completed intake
 */
export async function hasCompletedIntake(userId: string): Promise<boolean> {
  const profile = await getIntakeProfile(userId);
  return profile !== null;
}



