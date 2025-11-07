"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./progress-bar";
import { QuestionStep } from "./question-step";
import { useIntakeAutosave } from "@/hooks/use-intake-autosave";
import {
  getNextStep,
  getQuestionById,
  getAllQuestions,
} from "@/lib/intake/questions";
import { trackIntakeEvent } from "@/lib/services/analytics-client.service";
import type { QuizState, IntakeResponses, QuizStep } from "@/types/intake";

interface QuizContainerProps {
  initialSessionId: string;
  initialState?: QuizState;
  className?: string;
}

export function QuizContainer({
  initialSessionId,
  initialState,
  className,
}: QuizContainerProps) {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>(
    initialState || {
      currentStep: "budget",
      responses: {},
      selectedDisciplines: [],
      completed: false,
      startedAt: new Date(),
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Auto-save functionality
  const { autoSave, forceSave, loadFromLocalStorage, clearLocalStorage } =
    useIntakeAutosave({
      sessionId: initialSessionId,
      onSave: async (sessionId, responses, currentStep, disciplines) => {
        // Clean the responses object to avoid circular references
        const cleanResponses = JSON.parse(JSON.stringify(responses));

        console.log("Saving quiz data:", {
          sessionId,
          responses: cleanResponses,
          currentStep,
          disciplines,
        });

        const response = await fetch("/api/intake/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            responses: cleanResponses,
            current_step: currentStep,
            disciplines,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save quiz progress");
        }
      },
      onError: (error) => {
        console.error("Auto-save error:", error);
        setError(
          "Er is een fout opgetreden bij het opslaan. Uw voortgang is lokaal opgeslagen."
        );
      },
    });

  // Load from localStorage on mount
  useEffect(() => {
    const localState = loadFromLocalStorage();
    if (localState && !initialState) {
      setQuizState(localState);
    }
  }, [loadFromLocalStorage, initialState]);

  // Auto-save on state changes
  useEffect(() => {
    if (quizState.currentStep !== "budget") {
      // Don't save on initial load
      autoSave(quizState);
    }
  }, [quizState, autoSave]);

  // Track quiz start
  useEffect(() => {
    if (quizState.currentStep === "budget" && !initialState) {
      trackIntakeEvent(initialSessionId, "budget", "quiz_started");
    }
  }, [initialSessionId, initialState]);

  const getCurrentQuestion = useCallback((): QuizStep | null => {
    return getQuestionById(quizState.currentStep, quizState.responses);
  }, [quizState.currentStep, quizState.responses]);

  const handleAnswerChange = useCallback(
    (value: any) => {
      setQuizState((prev) => {
        const newResponses = { ...prev.responses };

        // Update responses based on current step
        if (prev.currentStep === "budget") {
          newResponses.budget_range = value;
        } else if (prev.currentStep === "goals") {
          newResponses.primary_goals = value;
        } else if (prev.currentStep === "home_type") {
          newResponses.home_type = value;
        } else if (prev.currentStep === "current_heating") {
          newResponses.current_heating = value;
        } else if (prev.currentStep === "discipline_selection") {
          // Update selected disciplines
          return {
            ...prev,
            responses: newResponses,
            selectedDisciplines: value,
          };
        } else {
          // Handle discipline-specific questions
          const discipline = getCurrentQuestion()?.discipline;
          if (discipline) {
            newResponses[discipline as keyof IntakeResponses] = {
              ...newResponses[discipline as keyof IntakeResponses],
              [prev.currentStep.replace(`${discipline}_`, "")]: value,
            };
          }
        }

        return {
          ...prev,
          responses: newResponses,
        };
      });
    },
    [getCurrentQuestion]
  );

  const handleNext = useCallback(async () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Debug logging
    console.log("Current step:", quizState.currentStep);
    console.log("Responses:", quizState.responses);
    console.log("Selected disciplines:", quizState.selectedDisciplines);
    console.log("Budget range:", quizState.responses.budget_range);

    // Track step completion
    trackIntakeEvent(
      initialSessionId,
      quizState.currentStep,
      "step_completed",
      currentQuestion.discipline
    );

    // Get next step
    const nextStep = getNextStep(
      quizState.currentStep,
      quizState.responses,
      quizState.selectedDisciplines
    );

    console.log("Next step:", nextStep);

    if (nextStep === "complete") {
      await handleComplete();
      return;
    }

    if (!nextStep) {
      console.error("No next step found, completing quiz");
      await handleComplete();
      return;
    }

    setQuizState((prev) => ({
      ...prev,
      currentStep: nextStep,
    }));
  }, [
    quizState.currentStep,
    quizState.responses,
    quizState.selectedDisciplines,
    getCurrentQuestion,
    initialSessionId,
  ]);

  const handleBack = useCallback(() => {
    // Simple back navigation - could be enhanced with step history
    const allQuestions = getAllQuestions();
    const currentIndex = allQuestions.findIndex(
      (q) => q.id === quizState.currentStep
    );

    if (currentIndex > 0) {
      const prevQuestion = allQuestions[currentIndex - 1];
      setQuizState((prev) => ({
        ...prev,
        currentStep: prevQuestion.id,
      }));
    }
  }, [quizState.currentStep]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // Force save before completing
      await forceSave(quizState);

      // Track quiz completion
      const startTime = quizState.startedAt;
      const durationSeconds = Math.round(
        (Date.now() - startTime.getTime()) / 1000
      );

      trackIntakeEvent(
        initialSessionId,
        "complete",
        "quiz_completed",
        quizState.selectedDisciplines[0], // Primary discipline
        durationSeconds
      );

      // Complete the quiz
      const response = await fetch("/api/intake/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: initialSessionId,
          responses: quizState.responses,
          disciplines: quizState.selectedDisciplines,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete quiz");
      }

      const result = await response.json();

      // Clear localStorage
      clearLocalStorage();

      // Update state
      setQuizState((prev) => ({
        ...prev,
        completed: true,
      }));

      // Log completion
      console.log("Quiz completed with profile:", result.profile_id);

      // Redirect to dashboard (home page)
      router.push("/?completed=true");
    } catch (error) {
      console.error("Error completing quiz:", error);
      setError(
        "Er is een fout opgetreden bij het voltooien van de quiz. Probeer het opnieuw."
      );
    } finally {
      setIsLoading(false);
    }
  }, [quizState, initialSessionId, forceSave, clearLocalStorage, router]);

  const currentQuestion = getCurrentQuestion();
  const allQuestions = getAllQuestions();
  const currentIndex = allQuestions.findIndex(
    (q) => q.id === quizState.currentStep
  );
  const totalSteps = allQuestions.length;

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quiz niet gevonden
          </h2>
          <p className="text-gray-600">
            De gevraagde stap kon niet worden gevonden.
          </p>
        </div>
      </div>
    );
  }

  if (quizState.completed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quiz voltooid!
          </h2>
          <p className="text-gray-600">
            Bedankt voor het invullen van de intake quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <ProgressBar
        currentStep={quizState.currentStep}
        totalSteps={totalSteps}
        completedSteps={currentIndex + 1}
        className="mb-8"
      />

      <QuestionStep
        question={currentQuestion}
        value={getCurrentQuestionValue()}
        onChange={handleAnswerChange}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentIndex > 0}
        canSkip={
          currentQuestion.inputType !== "radio" &&
          currentQuestion.inputType !== "checkbox"
        }
        error={error}
      />

      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-gray-600">Bezig met opslaan...</p>
        </div>
      )}
    </div>
  );

  function getCurrentQuestionValue(): any {
    const step = quizState.currentStep;
    const responses = quizState.responses;

    if (step === "budget") return responses.budget_range;
    if (step === "goals") return responses.primary_goals;
    if (step === "home_type") return responses.home_type;
    if (step === "current_heating") return responses.current_heating;
    if (step === "discipline_selection") return quizState.selectedDisciplines;

    // Handle discipline-specific questions
    const discipline = currentQuestion?.discipline;
    if (discipline && currentQuestion) {
      const fieldName = step.replace(`${discipline}_`, "");
      return responses[discipline as keyof IntakeResponses]?.[
        fieldName as keyof any
      ];
    }

    return undefined;
  }
}
