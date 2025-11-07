// Dashboard types and interfaces

export interface WidgetRecommendation {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  specs: Record<string, string | number>;
  reason: string;
  catalogUrl: string;
  lastUpdated: string;
}

export interface DisciplineWidget {
  id: string;
  type: "discipline" | "general";
  discipline?: string;
  title: string;
  description: string;
  icon: string;
  recommendations: WidgetRecommendation[];
  loading: boolean;
  error?: string;
  lastCalculated: string;
  isVisible: boolean;
  order: number;
}

export interface GeneralAdvice {
  summary: string;
  totalSavings: number;
  paybackPeriod: number;
  priorityActions: string[];
  combinedRecommendations: {
    discipline: string;
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }[];
  lastCalculated: string;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  widgetOrder: string[];
  visibleWidgets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  layout: DashboardLayout;
  widgets: DisciplineWidget[];
  generalAdvice: GeneralAdvice;
  hasIntakeProfile: boolean;
}

export interface RecommendationFilters {
  budgetMin?: number;
  budgetMax?: number;
  goals?: string[];
  homeType?: string;
  heatingSystem?: string;
  // Discipline-specific filters
  wp?: {
    heatingType?: string;
    rooms?: number;
    energyBill?: string;
  };
  pv?: {
    roofOrientation?: string;
    roofType?: string;
    consumption?: string;
    shade?: string;
  };
  battery?: {
    usagePattern?: string;
    backupPriority?: string;
    peakHours?: string[];
  };
  isolatie?: {
    currentInsulation?: string;
    wallType?: string;
    windowType?: string;
  };
  ac?: {
    coolingNeeds?: string;
    roomCount?: number;
    noiseSensitivity?: string;
  };
}

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  discipline?: string;
  isLarge?: boolean;
  defaultVisible: boolean;
}

export const WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: "algemene_scan",
    title: "Algemene Scan",
    description: "Gecombineerd advies voor uw duurzame energietransitie",
    icon: "scan",
    isLarge: true,
    defaultVisible: true,
  },
  {
    id: "wp",
    title: "Warmtepomp",
    description: "Efficiënte verwarming voor uw woning",
    icon: "heat-pump",
    discipline: "wp",
    defaultVisible: false,
  },
  {
    id: "pv",
    title: "Zonnepanelen",
    description: "Zonne-energie voor uw huis",
    icon: "solar-panel",
    discipline: "pv",
    defaultVisible: false,
  },
  {
    id: "battery",
    title: "Thuisbatterij",
    description: "Opslag van zonne-energie",
    icon: "battery",
    discipline: "battery",
    defaultVisible: false,
  },
  {
    id: "isolatie",
    title: "Isolatie",
    description: "Energiebesparing door isolatie",
    icon: "insulation",
    discipline: "isolatie",
    defaultVisible: false,
  },
  {
    id: "ac",
    title: "Airconditioning",
    description: "Efficiënte koeling voor uw woning",
    icon: "air-conditioning",
    discipline: "ac",
    defaultVisible: false,
  },
  {
    id: "afgifte",
    title: "Afgifte",
    description: "Warmteafgifte systemen",
    icon: "radiator",
    discipline: "afgifte",
    defaultVisible: false,
  },
];

export interface DashboardState {
  widgets: DisciplineWidget[];
  layout: DashboardLayout;
  loading: boolean;
  error?: string;
  isDragging: boolean;
}


