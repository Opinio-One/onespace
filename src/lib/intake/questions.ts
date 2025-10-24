import type { QuizStep, QuestionConfig } from "@/types/intake";

export const questionConfig: QuestionConfig = {
  common: [
    {
      id: "budget",
      type: "common",
      question: "Wat is uw budget voor duurzame energie?",
      description: "Selecteer het budget dat het beste bij u past",
      inputType: "radio",
      options: [
        {
          value: "under_10k",
          label: "Onder €10.000",
          disciplines: ["pv", "isolatie"],
        },
        {
          value: "10k_25k",
          label: "€10.000 - €25.000",
          disciplines: ["pv", "battery", "isolatie"],
        },
        {
          value: "25k_50k",
          label: "€25.000 - €50.000",
          disciplines: ["wp", "pv", "battery", "isolatie"],
        },
        {
          value: "50k_100k",
          label: "€50.000 - €100.000",
          disciplines: ["wp", "pv", "battery", "isolatie", "ac"],
        },
        {
          value: "over_100k",
          label: "Boven €100.000",
          disciplines: ["wp", "pv", "battery", "isolatie", "ac"],
        },
      ],
      validation: { required: true },
      nextStep: "goals",
    },
    {
      id: "goals",
      type: "common",
      question: "Wat zijn uw belangrijkste doelen?",
      description: "Selecteer alle doelen die voor u belangrijk zijn",
      inputType: "checkbox",
      options: [
        { value: "kosten", label: "Kosten besparen" },
        { value: "co2", label: "CO₂ uitstoot verminderen" },
        { value: "comfort", label: "Comfort verbeteren" },
        { value: "onafhankelijkheid", label: "Energie onafhankelijkheid" },
      ],
      validation: { required: true },
      nextStep: "home_type",
    },
    {
      id: "home_type",
      type: "common",
      question: "Wat voor type woning heeft u?",
      inputType: "radio",
      options: [
        { value: "rijtjeshuis", label: "Rijtjeshuis" },
        { value: "twee_onder_een_kap", label: "Twee-onder-één-kap" },
        { value: "vrijstaand", label: "Vrijstaand" },
        { value: "appartement", label: "Appartement" },
        { value: "flat", label: "Flat" },
      ],
      validation: { required: true },
      nextStep: "current_heating",
    },
    {
      id: "current_heating",
      type: "common",
      question: "Hoe wordt uw woning momenteel verwarmd?",
      inputType: "radio",
      options: [
        { value: "cv_ketel", label: "CV-ketel (gas)" },
        { value: "warmtepomp", label: "Warmtepomp" },
        { value: "stadsverwarming", label: "Stadsverwarming" },
        { value: "elektrisch", label: "Elektrisch" },
        { value: "hout", label: "Hout/pelletkachel" },
        { value: "anders", label: "Anders" },
      ],
      validation: { required: true },
      nextStep: "discipline_selection",
    },
    {
      id: "discipline_selection",
      type: "common",
      question: "Voor welke oplossingen bent u geïnteresseerd?",
      description: "Selecteer alle oplossingen die u interessant vindt",
      inputType: "checkbox",
      options: [
        { value: "wp", label: "Warmtepomp" },
        { value: "pv", label: "Zonnepanelen" },
        { value: "battery", label: "Thuisbatterij" },
        { value: "isolatie", label: "Isolatie" },
        { value: "ac", label: "Airconditioning" },
      ],
      validation: { required: true },
    },
  ],
  disciplines: {
    wp: [
      {
        id: "wp_heating_type",
        type: "discipline",
        discipline: "wp",
        question: "Welk type warmtepomp overweegt u?",
        inputType: "radio",
        options: [
          { value: "lucht_lucht", label: "Lucht-lucht warmtepomp" },
          { value: "lucht_water", label: "Lucht-water warmtepomp" },
          { value: "bodem_water", label: "Bodem-water warmtepomp" },
          { value: "hybride", label: "Hybride warmtepomp" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["25k_50k", "50k_100k", "over_100k"].includes(responses.budget_range),
      },
      {
        id: "wp_rooms",
        type: "discipline",
        discipline: "wp",
        question: "Hoeveel kamers wilt u verwarmen?",
        inputType: "range",
        validation: { required: true, min: 1, max: 10 },
        showIf: (responses) =>
          responses.budget_range &&
          ["25k_50k", "50k_100k", "over_100k"].includes(responses.budget_range),
      },
      {
        id: "wp_energy_bill",
        type: "discipline",
        discipline: "wp",
        question: "Wat is uw huidige energierekening per maand?",
        inputType: "radio",
        options: [
          { value: "under_100", label: "Onder €100" },
          { value: "100_200", label: "€100 - €200" },
          { value: "200_300", label: "€200 - €300" },
          { value: "over_300", label: "Boven €300" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["25k_50k", "50k_100k", "over_100k"].includes(responses.budget_range),
      },
    ],
    pv: [
      {
        id: "pv_roof_orientation",
        type: "discipline",
        discipline: "pv",
        question: "Hoe is uw dak georiënteerd?",
        inputType: "radio",
        options: [
          { value: "zuid", label: "Zuid" },
          { value: "zuid_oost", label: "Zuid-oost" },
          { value: "zuid_west", label: "Zuid-west" },
          { value: "oost", label: "Oost" },
          { value: "west", label: "West" },
          { value: "noord", label: "Noord" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["under_10k", "10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
      {
        id: "pv_roof_type",
        type: "discipline",
        discipline: "pv",
        question: "Wat voor dak heeft u?",
        inputType: "radio",
        options: [
          { value: "pannen", label: "Pannen" },
          { value: "dakpannen", label: "Dakpannen" },
          { value: "bitumen", label: "Bitumen" },
          { value: "plat", label: "Plat dak" },
          { value: "anders", label: "Anders" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["under_10k", "10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
      {
        id: "pv_consumption",
        type: "discipline",
        discipline: "pv",
        question: "Wat is uw jaarlijkse stroomverbruik?",
        inputType: "radio",
        options: [
          { value: "under_2000", label: "Onder 2.000 kWh" },
          { value: "2000_3500", label: "2.000 - 3.500 kWh" },
          { value: "3500_5000", label: "3.500 - 5.000 kWh" },
          { value: "over_5000", label: "Boven 5.000 kWh" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["under_10k", "10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
    ],
    battery: [
      {
        id: "battery_usage_pattern",
        type: "discipline",
        discipline: "battery",
        question: "Hoe gebruikt u stroom gedurende de dag?",
        inputType: "radio",
        options: [
          { value: "dag", label: "Meestal overdag" },
          { value: "avond", label: "Meestal 's avonds" },
          { value: "gelijkmatig", label: "Gelijkmatig verdeeld" },
          { value: "pieken", label: "Veel pieken en dalen" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
      {
        id: "battery_backup",
        type: "discipline",
        discipline: "battery",
        question: "Hoe belangrijk is back-up stroom bij stroomuitval?",
        inputType: "radio",
        options: [
          { value: "niet_belangrijk", label: "Niet belangrijk" },
          { value: "enigszins", label: "Enigszins belangrijk" },
          { value: "belangrijk", label: "Belangrijk" },
          { value: "zeer_belangrijk", label: "Zeer belangrijk" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
    ],
    isolatie: [
      {
        id: "isolatie_current",
        type: "discipline",
        discipline: "isolatie",
        question: "Hoe is uw woning momenteel geïsoleerd?",
        inputType: "radio",
        options: [
          { value: "slecht", label: "Slecht geïsoleerd" },
          { value: "matig", label: "Matig geïsoleerd" },
          { value: "goed", label: "Goed geïsoleerd" },
          { value: "zeer_goed", label: "Zeer goed geïsoleerd" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["under_10k", "10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
      {
        id: "isolatie_walls",
        type: "discipline",
        discipline: "isolatie",
        question: "Wat voor muren heeft uw woning?",
        inputType: "radio",
        options: [
          { value: "spouwmuur", label: "Spouwmuur" },
          { value: "massief", label: "Massief" },
          { value: "hout", label: "Hout" },
          { value: "anders", label: "Anders" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["under_10k", "10k_25k", "25k_50k", "50k_100k", "over_100k"].includes(
            responses.budget_range
          ),
      },
    ],
    ac: [
      {
        id: "ac_cooling_needs",
        type: "discipline",
        discipline: "ac",
        question: "Hoeveel kamers wilt u koelen?",
        inputType: "range",
        validation: { required: true, min: 1, max: 10 },
        showIf: (responses) =>
          responses.budget_range &&
          ["50k_100k", "over_100k"].includes(responses.budget_range),
      },
      {
        id: "ac_noise_sensitivity",
        type: "discipline",
        discipline: "ac",
        question: "Hoe gevoelig bent u voor geluid?",
        inputType: "radio",
        options: [
          { value: "niet_gevoelig", label: "Niet gevoelig" },
          { value: "enigszins", label: "Enigszins gevoelig" },
          { value: "gevoelig", label: "Gevoelig" },
          { value: "zeer_gevoelig", label: "Zeer gevoelig" },
        ],
        validation: { required: true },
        showIf: (responses) =>
          responses.budget_range &&
          ["50k_100k", "over_100k"].includes(responses.budget_range),
      },
    ],
  },
};

// Helper function to get all questions in order
export function getAllQuestions(): QuizStep[] {
  const allQuestions: QuizStep[] = [...questionConfig.common];

  // Add discipline-specific questions
  Object.values(questionConfig.disciplines).forEach((disciplineQuestions) => {
    allQuestions.push(...disciplineQuestions);
  });

  return allQuestions;
}

// Helper function to get next step based on current responses
export function getNextStep(
  currentStep: string,
  responses: any,
  selectedDisciplines: string[]
): string | null {
  console.log("getNextStep called with:", {
    currentStep,
    responses,
    selectedDisciplines,
  });

  // Check if current step has a specific nextStep
  const currentQuestion = getQuestionById(currentStep);
  if (currentQuestion?.nextStep) {
    console.log("Using nextStep from question:", currentQuestion.nextStep);
    return currentQuestion.nextStep;
  }

  console.log("No nextStep found in question, using logic flow");

  // For discipline selection, go to first discipline question
  if (currentStep === "discipline_selection") {
    console.log("Processing discipline_selection step");
    console.log("Selected disciplines:", selectedDisciplines);
    console.log("Responses:", responses);
    console.log("Budget range:", responses.budget_range);

    if (selectedDisciplines.length > 0) {
      // Find the first discipline question that should be shown
      for (const discipline of selectedDisciplines) {
        console.log("Checking discipline:", discipline);
        const disciplineQuestions = questionConfig.disciplines[discipline];
        if (disciplineQuestions && disciplineQuestions.length > 0) {
          console.log(
            "Found discipline questions:",
            disciplineQuestions.length
          );
          // Find the first question that should be shown based on responses
          for (const question of disciplineQuestions) {
            console.log(
              "Checking question:",
              question.id,
              "showIf:",
              question.showIf
            );
            console.log("Responses for showIf:", responses);

            // Test the showIf function manually
            if (question.showIf) {
              try {
                const shouldShow = question.showIf(responses);
                console.log("showIf result for", question.id, ":", shouldShow);
                if (shouldShow) {
                  console.log("✅ Found next question:", question.id);
                  return question.id;
                } else {
                  console.log(
                    "❌ Question filtered out by showIf:",
                    question.id
                  );
                }
              } catch (error) {
                console.error("Error in showIf function:", error);
                console.log("Using question anyway due to error:", question.id);
                return question.id;
              }
            } else {
              console.log(
                "✅ No showIf condition, using question:",
                question.id
              );
              return question.id;
            }
          }
        }
      }
    }
    console.log("No disciplines selected, completing quiz");
    return "complete"; // No disciplines selected, complete quiz
  }

  // For discipline questions, find next discipline question or complete
  if (currentQuestion?.type === "discipline") {
    const discipline = currentQuestion.discipline;
    if (discipline) {
      const disciplineQuestions = questionConfig.disciplines[discipline];
      const currentDisciplineIndex = disciplineQuestions.findIndex(
        (q) => q.id === currentStep
      );

      // Find next question in current discipline
      for (
        let i = currentDisciplineIndex + 1;
        i < disciplineQuestions.length;
        i++
      ) {
        const question = disciplineQuestions[i];
        if (!question.showIf || question.showIf(responses)) {
          return question.id;
        }
      }

      // Find next discipline
      const currentDisciplineIndexInSelected =
        selectedDisciplines.indexOf(discipline);
      if (currentDisciplineIndexInSelected < selectedDisciplines.length - 1) {
        for (
          let i = currentDisciplineIndexInSelected + 1;
          i < selectedDisciplines.length;
          i++
        ) {
          const nextDiscipline = selectedDisciplines[i];
          const nextDisciplineQuestions =
            questionConfig.disciplines[nextDiscipline];
          if (nextDisciplineQuestions && nextDisciplineQuestions.length > 0) {
            // Find the first question that should be shown
            for (const question of nextDisciplineQuestions) {
              if (!question.showIf || question.showIf(responses)) {
                return question.id;
              }
            }
          }
        }
      }
    }
  }

  return "complete";
}

// Helper function to get question by ID
export function getQuestionById(
  questionId: string,
  responses?: any
): QuizStep | null {
  const allQuestions = getAllQuestions();
  const question = allQuestions.find((q) => q.id === questionId);

  if (!question) return null;

  // If responses are provided, check if question should be shown
  if (responses && question.showIf && !question.showIf(responses)) {
    return null;
  }

  return question;
}
