import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { QuizContainer } from "@/components/intake/quiz-container";
import { getIntakeSession } from "@/lib/services/intake.service";
import type { QuizState } from "@/types/intake";

// Generate a unique session ID for anonymous users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface IntakePageProps {
  searchParams: {
    session_id?: string;
    resume?: string;
  };
}

export default async function IntakePage({ searchParams }: IntakePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Await searchParams for Next.js 15 compatibility
  const resolvedSearchParams = await searchParams;

  let sessionId = resolvedSearchParams.session_id;
  let initialState: QuizState | undefined;

  // If no session ID provided, generate one
  if (!sessionId) {
    sessionId = generateSessionId();
  }

  // Try to resume existing session
  if (
    resolvedSearchParams.resume === "true" ||
    resolvedSearchParams.session_id
  ) {
    try {
      const existingSession = await getIntakeSession(
        user?.id || undefined,
        sessionId
      );

      if (existingSession && !existingSession.completed) {
        initialState = {
          currentStep: existingSession.current_step,
          responses: existingSession.responses,
          selectedDisciplines: existingSession.disciplines,
          completed: existingSession.completed,
          startedAt: new Date(),
        };
      }
    } catch (error) {
      console.error("Error loading existing session:", error);
      // Continue with new session
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Duurzame Energie Intake
            </h1>
            <p className="text-gray-600">
              Beantwoord een paar vragen om een persoonlijk advies te krijgen
              voor uw duurzame energie oplossingen. Dit duurt minder dan een
              minuut.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Quiz wordt geladen...</p>
                </div>
              </div>
            }
          >
            <QuizContainer
              initialSessionId={sessionId}
              initialState={initialState}
            />
          </Suspense>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Uw antwoorden worden automatisch opgeslagen en zijn veilig. U kunt
            de quiz op elk moment hervatten.
          </p>
        </div>
      </div>
    </div>
  );
}
