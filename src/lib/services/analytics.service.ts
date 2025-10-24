import { createClient } from "@/lib/supabase/server";
import type { IntakeAnalytics } from "@/types/intake";

/**
 * Server-side analytics service - only for use in server components and API routes
 * For client components, use analytics-client.service.ts instead
 */

/**
 * Get analytics summary for admin dashboard
 */
export async function getIntakeAnalytics(
  startDate?: string,
  endDate?: string
): Promise<{
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageDuration: number;
  dropOffPoints: Array<{ step: string; count: number }>;
  disciplineBreakdown: Array<{ discipline: string; count: number }>;
}> {
  try {
    const supabase = await createClient();

    // Build date filter
    let dateFilter = supabase.from("intake_analytics").select("*");
    if (startDate) {
      dateFilter = dateFilter.gte("timestamp", startDate);
    }
    if (endDate) {
      dateFilter = dateFilter.lte("timestamp", endDate);
    }

    const { data: analytics, error } = await dateFilter;

    if (error) {
      console.error("Error fetching analytics:", error);
      return {
        totalSessions: 0,
        completedSessions: 0,
        completionRate: 0,
        averageDuration: 0,
        dropOffPoints: [],
        disciplineBreakdown: [],
      };
    }

    const events = analytics || [];

    // Calculate metrics
    const uniqueSessions = new Set(events.map((e) => e.session_id));
    const totalSessions = uniqueSessions.size;

    const completedEvents = events.filter((e) => e.action === "quiz_completed");
    const completedSessions = completedEvents.length;

    const completionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const durationEvents = events.filter((e) => e.duration_seconds);
    const averageDuration =
      durationEvents.length > 0
        ? durationEvents.reduce(
            (sum, e) => sum + (e.duration_seconds || 0),
            0
          ) / durationEvents.length
        : 0;

    // Drop-off points (sessions that didn't complete)
    const abandonedEvents = events.filter((e) => e.action === "quiz_abandoned");
    const dropOffPoints = abandonedEvents.reduce((acc, event) => {
      const existing = acc.find(
        (item: { step: string; count: number }) => item.step === event.step_id
      );
      if (existing) {
        existing.count++;
      } else {
        acc.push({ step: event.step_id, count: 1 });
      }
      return acc;
    }, [] as Array<{ step: string; count: number }>);

    // Discipline breakdown
    const disciplineEvents = events.filter((e) => e.discipline);
    const disciplineBreakdown = disciplineEvents.reduce((acc, event) => {
      const existing = acc.find(
        (item: { discipline: string; count: number }) =>
          item.discipline === event.discipline
      );
      if (existing) {
        existing.count++;
      } else {
        acc.push({ discipline: event.discipline!, count: 1 });
      }
      return acc;
    }, [] as Array<{ discipline: string; count: number }>);

    return {
      totalSessions,
      completedSessions,
      completionRate,
      averageDuration,
      dropOffPoints,
      disciplineBreakdown,
    };
  } catch (error) {
    console.error("Error in getIntakeAnalytics:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      averageDuration: 0,
      dropOffPoints: [],
      disciplineBreakdown: [],
    };
  }
}
