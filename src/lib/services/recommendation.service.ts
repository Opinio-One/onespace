import { createClient } from "@/lib/supabase/server";
import { getCatalogItems } from "@/lib/services/catalog.service";
import type {
  WidgetRecommendation,
  GeneralAdvice,
  DashboardLayout,
  RecommendationFilters,
  DisciplineWidget,
} from "@/types/dashboard";
import type { IntakeProfile } from "@/types/intake";
import type {
  Zonnepaneel,
  Thuisbatterij,
  Omvormer,
  Binnenunit,
  Buitenunit,
} from "@/types/catalog";

// Simple in-memory cache for recommendations
const recommendationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(discipline: string, profile: IntakeProfile): string {
  return `${discipline}-${profile.id}-${profile.updated_at}`;
}

function getCachedRecommendations(key: string): any | null {
  const cached = recommendationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedRecommendations(key: string, data: any): void {
  recommendationCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get recommendations for a specific discipline based on intake profile
 */
export async function getRecommendationsForDiscipline(
  discipline: string,
  profile: IntakeProfile
): Promise<WidgetRecommendation[]> {
  // Check cache first
  const cacheKey = getCacheKey(discipline, profile);
  const cached = getCachedRecommendations(cacheKey);
  if (cached) {
    return cached;
  }

  const supabase = await createClient();
  const filters = buildRecommendationFilters(profile);

  try {
    let recommendations: WidgetRecommendation[] = [];

    switch (discipline) {
      case "wp":
        recommendations = await getWarmtepompRecommendations(supabase, filters);
        break;
      case "pv":
        recommendations = await getZonnepanelenRecommendations(
          supabase,
          filters
        );
        break;
      case "battery":
        recommendations = await getBatteryRecommendations(supabase, filters);
        break;
      case "isolatie":
        recommendations = await getIsolatieRecommendations(supabase, filters);
        break;
      case "ac":
        recommendations = await getACRecommendations(supabase, filters);
        break;
      case "afgifte":
        recommendations = await getAfgifteRecommendations(supabase, filters);
        break;
      default:
        recommendations = [];
    }

    // Cache the results
    setCachedRecommendations(cacheKey, recommendations);
    return recommendations;
  } catch (error) {
    console.error(`Error getting ${discipline} recommendations:`, error);
    return [];
  }
}

/**
 * Generate general advice combining all disciplines
 */
export async function generateGeneralAdvice(
  profile: IntakeProfile
): Promise<GeneralAdvice> {
  // Check cache first
  const cacheKey = `general-${profile.id}-${profile.updated_at}`;
  const cached = getCachedRecommendations(cacheKey);
  if (cached) {
    return cached;
  }

  const disciplines = profile.disciplines || [];

  // Calculate estimated savings based on profile
  const budgetRange = profile.profile_data.budget;
  const totalSavings = Math.round(budgetRange.max * 0.15); // 15% of max budget as annual savings
  const paybackPeriod = Math.round(budgetRange.max / totalSavings); // Years to payback

  const priorityActions = disciplines
    .map((discipline) => {
      switch (discipline) {
        case "wp":
          return "Installeer een warmtepomp voor efficiënte verwarming";
        case "pv":
          return "Plaats zonnepanelen voor duurzame energie";
        case "battery":
          return "Voeg een thuisbatterij toe voor energieopslag";
        case "isolatie":
          return "Verbeter de isolatie voor energiebesparing";
        case "ac":
          return "Overweeg airconditioning voor comfort";
        case "afgifte":
          return "Optimaliseer uw warmteafgifte systeem";
        default:
          return "";
      }
    })
    .filter(Boolean);

  const combinedRecommendations = disciplines.map((discipline) => ({
    discipline,
    title: getDisciplineTitle(discipline),
    description: getDisciplineDescription(discipline),
    impact: "high" as const,
  }));

  const advice: GeneralAdvice = {
    summary: `Op basis van uw profiel adviseren wij ${
      disciplines.length
    } duurzame oplossingen die samen €${totalSavings.toLocaleString()} per jaar kunnen besparen.`,
    totalSavings,
    paybackPeriod,
    priorityActions,
    combinedRecommendations,
    lastCalculated: new Date().toISOString(),
  };

  // Cache the results
  setCachedRecommendations(cacheKey, advice);
  return advice;
}

/**
 * Get user's dashboard layout preferences
 */
export async function getUserDashboardLayout(
  userId: string
): Promise<DashboardLayout | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("dashboard_layouts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No layout found
      }
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      widgetOrder: data.widget_order,
      visibleWidgets: data.visible_widgets,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error getting dashboard layout:", error);
    return null;
  }
}

/**
 * Save user's dashboard layout preferences
 */
export async function saveDashboardLayout(
  userId: string,
  widgetOrder: string[],
  visibleWidgets: string[]
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("dashboard_layouts").upsert(
      {
        user_id: userId,
        widget_order: widgetOrder,
        visible_widgets: visibleWidgets,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error saving dashboard layout:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in saveDashboardLayout:", error);
    return false;
  }
}

/**
 * Build recommendation filters from intake profile
 */
function buildRecommendationFilters(
  profile: IntakeProfile
): RecommendationFilters {
  const profileData = profile.profile_data;

  return {
    budgetMin: profileData.budget.min,
    budgetMax: profileData.budget.max,
    goals: profileData.goals.primary,
    homeType: profileData.home.type,
    heatingSystem: profileData.home.heating_system,
    wp: profileData.disciplines.wp,
    pv: profileData.disciplines.pv,
    battery: profileData.disciplines.battery ? {
      usagePattern: profileData.disciplines.battery.usage_pattern,
      backupPriority: profileData.disciplines.battery.backup_priority,
      peakHours: profileData.disciplines.battery.peak_hours,
    } : undefined,
    isolatie: profileData.disciplines.isolatie ? {
      currentInsulation: profileData.disciplines.isolatie.current_insulation,
      wallType: profileData.disciplines.isolatie.wall_type,
      windowType: profileData.disciplines.isolatie.window_type,
    } : undefined,
    ac: profileData.disciplines.ac ? {
      coolingNeeds: profileData.disciplines.ac.cooling_needs,
      roomCount: profileData.disciplines.ac.room_count,
      noiseSensitivity: profileData.disciplines.ac.noise_sensitivity,
    } : undefined,
  };
}

/**
 * Get warmtepomp recommendations
 */
async function getWarmtepompRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  try {
    // Use the catalog service to get binnenunits
    const result = await getCatalogItems<Binnenunit>({
      tableName: "Binnenunits",
      page: 1,
      limit: 3,
      search: "",
      filters: {
        Prijs_EUR_min: filters.budgetMin || 0,
        Prijs_EUR_max: filters.budgetMax || 50000,
      },
      sortBy: "SEER",
      sortOrder: "desc",
      searchableFields: ["Product", "Merk", "Serie"],
      filterableFields: ["Merk", "Type", "Energielabel_Koelen", "Energielabel_Verwarmen"],
    });

    return result.data.map((unit: Binnenunit) => ({
      id: `wp-${unit.id}`,
      title: unit.Product,
      description: `${unit.Merk} ${unit.Serie} - ${unit.Vermogen_categorie}`,
      image: unit["Foto unit"] || "/placeholder-heat-pump.jpg",
      price: unit.Prijs_EUR,
      specs: {
        vermogen: `${unit.Vermogen_kW} kW`,
        seer: unit.SEER,
        scop: unit.SCOP,
        geluidsdruk: unit.geluidsdruk_dB,
      },
      reason: "Hoge efficiëntie en geschikt voor uw woningtype",
      catalogUrl: `/catalog/binnenunits?filter=${unit.Merk}`,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching binnenunits:", error);
    return [];
  }
}

/**
 * Get zonnepanelen recommendations
 */
async function getZonnepanelenRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  try {
    // Use the catalog service to get zonnepanelen
    const result = await getCatalogItems<Zonnepaneel>({
      tableName: "Zonnepanelen",
      page: 1,
      limit: 3,
      search: "",
      filters: {
        Prijs_EUR_min: filters.budgetMin || 0,
        Prijs_EUR_max: filters.budgetMax || 30000,
      },
      sortBy: "Vermogen_Wp",
      sortOrder: "desc",
      searchableFields: ["Product", "Merk", "Product code"],
      filterableFields: ["Merk", "Cell type", "Celtechnologie type", "Bi-Facial"],
    });

    return result.data.map((panel: Zonnepaneel) => ({
      id: `pv-${panel.Id}`,
      title: panel.Product,
      description: `${panel.Merk} - ${panel.Vermogen_Wp}W`,
      image: panel.Afbeelding || "/placeholder-solar.jpg",
      price: panel.Prijs_EUR,
      specs: {
        vermogen: `${panel.Vermogen_Wp}W`,
        celtechnologie: panel["Celtechnologie type"],
        garantie: `${panel["Productgarantie (jaren)"]} jaar`,
      },
      reason: "Hoge opbrengst en geschikt voor uw dakoriëntatie",
      catalogUrl: `/catalog/zonnepanelen?filter=${panel.Merk}`,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching zonnepanelen:", error);
    return [];
  }
}

/**
 * Get battery recommendations
 */
async function getBatteryRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  try {
    // Use the catalog service to get thuisbatterijen
    const result = await getCatalogItems<Thuisbatterij>({
      tableName: "Thuisbatterijen",
      page: 1,
      limit: 3,
      search: "",
      filters: {
        Prijs_EUR_min: filters.budgetMin || 0,
        Prijs_EUR_max: filters.budgetMax || 15000,
      },
      sortBy: "Batterij Capaciteit (kWh)",
      sortOrder: "desc",
      searchableFields: ["Product", "Merk", "Product code"],
      filterableFields: ["Merk", "Soort batterij", "Aantal fases", "Categorie"],
    });

    return result.data.map((battery: Thuisbatterij) => ({
      id: `battery-${battery.Id}`,
      title: battery.Product,
      description: `${battery.Merk} - ${battery["Batterij Capaciteit (kWh)"]}kWh`,
      image: battery.Afbeelding || "/placeholder-battery.jpg",
      price: battery.Prijs_EUR,
      specs: {
        capaciteit: battery["Batterij Capaciteit (kWh)"],
        vermogen: battery["Ontladingsvermogen (kW)"],
        levensduur: battery["Cyclus levensduur bij 25℃"],
      },
      reason: "Geschikt voor uw verbruikspatroon en back-up behoeften",
      catalogUrl: `/catalog/thuisbatterijen?filter=${battery.Merk}`,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching thuisbatterijen:", error);
    return [];
  }
}

/**
 * Get isolatie recommendations (generic advice)
 */
async function getIsolatieRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  // Return generic insulation advice based on current insulation level
  const currentInsulation = filters.isolatie?.currentInsulation || "matig";

  const recommendations = [
    {
      id: "isolatie-1",
      title: "Spouwmuurisolatie",
      description: "Isolatie van spouwmuren voor betere energie-efficiëntie",
      image: "/placeholder-insulation.jpg",
      price: 2000,
      specs: { type: "Spouwmuur", rWaarde: "2.5" },
      reason: "Gebaseerd op uw huidige isolatieniveau",
      catalogUrl: "/catalog/isolatie",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "isolatie-2",
      title: "Dakisolatie",
      description: "Extra isolatie voor uw dak",
      image: "/placeholder-insulation.jpg",
      price: 1500,
      specs: { type: "Dak", rWaarde: "4.0" },
      reason: "Aanbevolen voor uw woningtype",
      catalogUrl: "/catalog/isolatie",
      lastUpdated: new Date().toISOString(),
    },
  ];

  return recommendations;
}

/**
 * Get AC recommendations
 */
async function getACRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  try {
    // Use the catalog service to get binnenunits for AC
    const result = await getCatalogItems<Binnenunit>({
      tableName: "Binnenunits",
      page: 1,
      limit: 3,
      search: "",
      filters: {
        Prijs_EUR_min: filters.budgetMin || 0,
        Prijs_EUR_max: filters.budgetMax || 8000,
      },
      sortBy: "SEER",
      sortOrder: "desc",
      searchableFields: ["Product", "Merk", "Serie"],
      filterableFields: ["Merk", "Type", "Energielabel_Koelen", "Energielabel_Verwarmen"],
    });

    return result.data.map((unit: Binnenunit) => ({
      id: `ac-${unit.id}`,
      title: unit.Product,
      description: `${unit.Merk} ${unit.Serie} - ${unit.Vermogen_categorie}`,
      image: unit["Foto unit"] || "/placeholder-ac.jpg",
      price: unit.Prijs_EUR,
      specs: {
        vermogen: `${unit.Vermogen_kW} kW`,
        seer: unit.SEER,
        geluidsdruk: unit.geluidsdruk_dB,
      },
      reason: "Stille en efficiënte koeling voor uw kamers",
      catalogUrl: `/catalog/binnenunits?filter=${unit.Merk}`,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching AC binnenunits:", error);
    return [];
  }
}

/**
 * Get afgifte recommendations (generic advice)
 */
async function getAfgifteRecommendations(
  supabase: any,
  filters: RecommendationFilters
): Promise<WidgetRecommendation[]> {
  // Return generic heat distribution advice
  const recommendations = [
    {
      id: "afgifte-1",
      title: "Lage temperatuur radiatoren",
      description: "Efficiënte warmteafgifte voor warmtepomp",
      image: "/placeholder-radiator.jpg",
      price: 1200,
      specs: { type: "Lage temperatuur", oppervlakte: "15m²" },
      reason: "Optimale combinatie met warmtepomp",
      catalogUrl: "/catalog/afgifte",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "afgifte-2",
      title: "Vloerverwarming",
      description: "Comfortabele warmteafgifte door de vloer",
      image: "/placeholder-floor-heating.jpg",
      price: 2500,
      specs: { type: "Vloerverwarming", oppervlakte: "30m²" },
      reason: "Ideaal voor nieuwbouw of renovatie",
      catalogUrl: "/catalog/afgifte",
      lastUpdated: new Date().toISOString(),
    },
  ];

  return recommendations;
}

/**
 * Helper functions
 */
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
