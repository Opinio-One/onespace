import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserDashboardLayout,
  getRecommendationsForDiscipline,
  generateGeneralAdvice,
} from "@/lib/services/recommendation.service";
import { getIntakeProfile } from "@/lib/services/intake.service";
import { WIDGET_CONFIGS } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has completed intake
    const intakeProfile = await getIntakeProfile(user.id);
    if (!intakeProfile) {
      return NextResponse.json({
        hasIntakeProfile: false,
        message: "Please complete the intake quiz first",
      });
    }

    // Get user's dashboard layout
    const layout = await getUserDashboardLayout(user.id);
    const defaultLayout = {
      id: "default",
      userId: user.id,
      widgetOrder: WIDGET_CONFIGS.map((config) => config.id),
      visibleWidgets: WIDGET_CONFIGS.filter(
        (config) => config.defaultVisible
      ).map((config) => config.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userLayout = layout || defaultLayout;

    // Get recommendations for each visible discipline
    const widgets = [];
    const disciplines = intakeProfile.disciplines || [];

    for (const discipline of disciplines) {
      const config = WIDGET_CONFIGS.find((c) => c.discipline === discipline);
      if (!config) continue;

      try {
        const recommendations = await getRecommendationsForDiscipline(
          discipline,
          intakeProfile
        );

        widgets.push({
          id: config.id,
          type: "discipline" as const,
          discipline: config.discipline,
          title: config.title,
          description: config.description,
          icon: config.icon,
          recommendations,
          loading: false,
          lastCalculated: new Date().toISOString(),
          isVisible: userLayout.visibleWidgets.includes(config.id),
          order: userLayout.widgetOrder.indexOf(config.id),
        });
      } catch (error) {
        console.error(`Error loading ${discipline} widget:`, error);
        widgets.push({
          id: config.id,
          type: "discipline" as const,
          discipline: config.discipline,
          title: config.title,
          description: config.description,
          icon: config.icon,
          recommendations: [],
          loading: false,
          error: "Failed to load recommendations",
          lastCalculated: new Date().toISOString(),
          isVisible: userLayout.visibleWidgets.includes(config.id),
          order: userLayout.widgetOrder.indexOf(config.id),
        });
      }
    }

    // Get general advice
    const generalAdvice = await generateGeneralAdvice(intakeProfile);
    const generalScanConfig = WIDGET_CONFIGS.find(
      (c) => c.id === "algemene_scan"
    );

    if (generalScanConfig) {
      widgets.push({
        id: "algemene_scan",
        type: "general" as const,
        title: generalScanConfig.title,
        description: generalScanConfig.description,
        icon: generalScanConfig.icon,
        recommendations: [], // General advice is handled separately
        loading: false,
        lastCalculated: generalAdvice.lastCalculated,
        isVisible: userLayout.visibleWidgets.includes("algemene_scan"),
        order: userLayout.widgetOrder.indexOf("algemene_scan"),
      });
    }

    // Sort widgets by order
    widgets.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      layout: userLayout,
      widgets,
      generalAdvice,
      hasIntakeProfile: true,
    });
  } catch (error) {
    console.error("Error in dashboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



