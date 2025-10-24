/**
 * Client-side analytics service for tracking intake events
 * This version doesn't use server-side Supabase functions
 */

export interface IntakeAnalytics {
  session_id: string;
  step_id: string;
  action:
    | "quiz_started"
    | "step_completed"
    | "quiz_completed"
    | "quiz_abandoned";
  discipline?: string;
  timestamp: string;
  duration_seconds?: number;
}

/**
 * Track intake analytics events (privacy-friendly) - Client version
 */
export async function trackIntakeEvent(
  sessionId: string,
  stepId: string,
  action: IntakeAnalytics["action"],
  discipline?: string,
  durationSeconds?: number
): Promise<void> {
  try {
    const analyticsData: IntakeAnalytics = {
      session_id: sessionId,
      step_id: stepId,
      action,
      discipline,
      timestamp: new Date().toISOString(),
      duration_seconds: durationSeconds,
    };

    // Send to API endpoint instead of direct Supabase call
    const response = await fetch("/api/intake/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analyticsData),
    });

    if (!response.ok) {
      console.error("Error tracking intake event:", response.statusText);
    }
  } catch (error) {
    console.error("Error in trackIntakeEvent:", error);
  }
}

