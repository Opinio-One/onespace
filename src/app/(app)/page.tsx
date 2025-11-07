import { createClient } from "@/lib/supabase/server";
import { getIntakeProfile } from "@/lib/services/intake.service";
import {
  getUserDashboardLayout,
  generateGeneralAdvice,
  getRecommendationsForDiscipline,
} from "@/lib/services/recommendation.service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { DashboardData } from "@/types/dashboard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welkom bij OneSpace</h1>
          <p className="text-muted-foreground">
            Log in om uw persoonlijke dashboard te bekijken
          </p>
        </div>
      </div>
    );
  }

  try {
    // Check if user has completed intake
    const intakeProfile = await getIntakeProfile(user.id);

    if (!intakeProfile) {
      return (
        <div className="container mx-auto p-6">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">Welkom bij OneSpace</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Om uw persoonlijke dashboard te zien, moet u eerst de intake quiz
              voltooien. Dit duurt minder dan een minuut en helpt ons de beste
              aanbevelingen voor u te maken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/intake"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Start intake quiz
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Bekijk catalogus
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Get user's dashboard layout
    const layout = await getUserDashboardLayout(user.id);

    // Get general advice
    const generalAdvice = await generateGeneralAdvice(intakeProfile);

    // Get recommendations for each discipline
    const widgets = [];
    const disciplines = intakeProfile.disciplines || [];

    // Build default layout with all disciplines visible
    const defaultWidgetOrder = ["algemene_scan", ...disciplines];
    const defaultVisibleWidgets = ["algemene_scan", ...disciplines];

    // Merge existing layout with new disciplines (show all selected disciplines by default)
    const mergedLayout = layout
      ? {
          ...layout,
          // Ensure all current disciplines are in widgetOrder, preserving existing order
          widgetOrder: (() => {
            const existingOrder = layout.widgetOrder.filter(
              (id) => id !== "algemene_scan" && disciplines.includes(id)
            );
            const newDisciplines = disciplines.filter(
              (id) => !existingOrder.includes(id)
            );
            return ["algemene_scan", ...existingOrder, ...newDisciplines];
          })(),
          // Ensure all current disciplines are visible
          visibleWidgets: [
            ...new Set([
              "algemene_scan",
              ...layout.visibleWidgets.filter(
                (id) => id !== "algemene_scan" && disciplines.includes(id)
              ),
              ...disciplines,
            ]),
          ],
        }
      : {
          id: "default",
          userId: user.id,
          widgetOrder: defaultWidgetOrder,
          visibleWidgets: defaultVisibleWidgets,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    for (const discipline of disciplines) {
      try {
        const recommendations = await getRecommendationsForDiscipline(
          discipline,
          intakeProfile
        );

        widgets.push({
          id: discipline,
          type: "discipline" as const,
          discipline: discipline,
          title: getDisciplineTitle(discipline),
          description: getDisciplineDescription(discipline),
          icon: getDisciplineIcon(discipline),
          recommendations,
          loading: false,
          lastCalculated: new Date().toISOString(),
          isVisible: mergedLayout.visibleWidgets.includes(discipline),
          order:
            mergedLayout.widgetOrder.indexOf(discipline) !== -1
              ? mergedLayout.widgetOrder.indexOf(discipline)
              : disciplines.indexOf(discipline) + 1,
        });
      } catch (error) {
        console.error(`Error loading ${discipline} widget:`, error);
        widgets.push({
          id: discipline,
          type: "discipline" as const,
          discipline: discipline,
          title: getDisciplineTitle(discipline),
          description: getDisciplineDescription(discipline),
          icon: getDisciplineIcon(discipline),
          recommendations: [],
          loading: false,
          error: "Failed to load recommendations",
          lastCalculated: new Date().toISOString(),
          isVisible: mergedLayout.visibleWidgets.includes(discipline),
          order:
            mergedLayout.widgetOrder.indexOf(discipline) !== -1
              ? mergedLayout.widgetOrder.indexOf(discipline)
              : disciplines.indexOf(discipline) + 1,
        });
      }
    }

    // Add general scan widget
    widgets.push({
      id: "algemene_scan",
      type: "general" as const,
      title: "Algemene Scan",
      description: "Gecombineerd advies voor uw duurzame energietransitie",
      icon: "scan",
      recommendations: [],
      loading: false,
      lastCalculated: generalAdvice.lastCalculated,
      isVisible: mergedLayout.visibleWidgets.includes("algemene_scan"),
      order: mergedLayout.widgetOrder.indexOf("algemene_scan"),
    });

    // Sort widgets by order
    widgets.sort((a, b) => a.order - b.order);

    const dashboardData: DashboardData = {
      layout: mergedLayout,
      widgets,
      generalAdvice,
      hasIntakeProfile: true,
    };

    return <DashboardClient initialData={dashboardData} />;
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Fout bij laden dashboard</h1>
          <p className="text-muted-foreground">
            Er is een fout opgetreden bij het laden van uw dashboard. Probeer de
            pagina te vernieuwen.
          </p>
        </div>
      </div>
    );
  }
}

// Helper functions
function getDisciplineTitle(discipline: string): string {
  const titles: Record<string, string> = {
    wp: "Warmtepomp",
    pv: "Zonnepanelen",
    battery: "Thuisbatterij",
    isolatie: "Isolatie",
    ac: "Airconditioning",
    afgifte: "Afgifte",
  };
  return titles[discipline] || discipline;
}

function getDisciplineDescription(discipline: string): string {
  const descriptions: Record<string, string> = {
    wp: "Efficiënte verwarming voor uw woning",
    pv: "Duurzame energie uit zonlicht",
    battery: "Opslag van zonne-energie",
    isolatie: "Energiebesparing door isolatie",
    ac: "Comfortabele koeling",
    afgifte: "Optimale warmteafgifte",
  };
  return descriptions[discipline] || "";
}

function getDisciplineIcon(discipline: string): string {
  const icons: Record<string, string> = {
    wp: "heat-pump",
    pv: "solar-panel",
    battery: "battery",
    isolatie: "insulation",
    ac: "air-conditioning",
    afgifte: "radiator",
  };
  return icons[discipline] || "box";
}
