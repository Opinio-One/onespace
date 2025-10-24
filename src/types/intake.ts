// Intake quiz types and interfaces

export interface IntakeSession {
  id: string;
  user_id?: string;
  session_id: string;
  responses: IntakeResponses;
  completed: boolean;
  current_step?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface IntakeProfile {
  id: string;
  user_id: string;
  session_id: string;
  budget_min?: number;
  budget_max?: number;
  goals: string[];
  disciplines: string[];
  profile_data: NormalizedProfile;
  created_at: string;
  updated_at: string;
}

export interface IntakeResponses {
  // Common questions
  budget_range?: string;
  primary_goals?: string[];
  home_type?: string;
  current_heating?: string;

  // Discipline-specific responses
  wp?: {
    heating_type?: string;
    rooms_to_heat?: number;
    current_energy_bill?: string;
  };
  pv?: {
    roof_orientation?: string;
    roof_type?: string;
    monthly_consumption?: string;
    roof_shade?: string;
  };
  battery?: {
    usage_pattern?: string;
    backup_priority?: string;
    peak_hours?: string[];
  };
  isolatie?: {
    current_insulation?: string;
    wall_type?: string;
    window_type?: string;
  };
  ac?: {
    cooling_needs?: string;
    room_count?: number;
    noise_sensitivity?: string;
  };
}

export interface NormalizedProfile {
  budget: {
    min: number;
    max: number;
    range: string;
  };
  goals: {
    primary: string[];
    secondary: string[];
  };
  home: {
    type: string;
    heating_system: string;
    energy_bill: string;
  };
  disciplines: {
    wp?: {
      heating_type: string;
      rooms: number;
      energy_bill: string;
    };
    pv?: {
      roof_orientation: string;
      roof_type: string;
      consumption: string;
      shade: string;
    };
    battery?: {
      usage_pattern: string;
      backup_priority: string;
      peak_hours: string[];
    };
    isolatie?: {
      current_insulation: string;
      wall_type: string;
      window_type: string;
    };
    ac?: {
      cooling_needs: string;
      room_count: number;
      noise_sensitivity: string;
    };
  };
}

export interface QuizStep {
  id: string;
  type: "common" | "discipline";
  discipline?: string;
  question: string;
  description?: string;
  inputType: "radio" | "checkbox" | "range" | "select" | "text";
  options?: QuizOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  showIf?: (responses: IntakeResponses) => boolean;
  nextStep?: string;
}

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  nextStep?: string;
  disciplines?: string[];
}

export interface QuizState {
  currentStep: string;
  responses: IntakeResponses;
  selectedDisciplines: string[];
  completed: boolean;
  startedAt: Date;
  lastSavedAt?: Date;
}

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

// Question configuration types
export interface QuestionConfig {
  common: QuizStep[];
  disciplines: {
    [key: string]: QuizStep[];
  };
}

// API request/response types
export interface SaveIntakeRequest {
  session_id: string;
  responses: IntakeResponses;
  current_step: string;
  disciplines?: string[];
}

export interface SaveIntakeResponse {
  success: boolean;
  session_id: string;
  current_step: string;
  last_saved: string;
}

export interface ResumeIntakeResponse {
  session_id: string;
  responses: IntakeResponses;
  current_step: string;
  completed: boolean;
  disciplines: string[];
}

export interface CompleteIntakeRequest {
  session_id: string;
  responses: IntakeResponses;
  disciplines: string[];
}

export interface CompleteIntakeResponse {
  success: boolean;
  profile_id: string;
  normalized_profile: NormalizedProfile;
}

