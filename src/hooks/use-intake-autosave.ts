import { useCallback, useEffect, useRef } from "react";
import { useDebounce } from "./use-debounce";
import type { IntakeResponses, QuizState } from "@/types/intake";

interface UseIntakeAutosaveOptions {
  sessionId: string;
  onSave: (
    sessionId: string,
    responses: IntakeResponses,
    currentStep: string,
    disciplines?: string[]
  ) => Promise<void>;
  onError?: (error: Error) => void;
  debounceMs?: number;
}

export function useIntakeAutosave({
  sessionId,
  onSave,
  onError,
  debounceMs = 3000,
}: UseIntakeAutosaveOptions) {
  const lastSavedRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);

  // Debounced save function
  const debouncedSave = useDebounce(
    useCallback(
      async (quizState: QuizState) => {
        if (isSavingRef.current) return;

        try {
          isSavingRef.current = true;
          await onSave(
            sessionId,
            quizState.responses,
            quizState.currentStep,
            quizState.selectedDisciplines
          );
          lastSavedRef.current = new Date().toISOString();
        } catch (error) {
          console.error("Error saving intake session:", error);
          onError?.(error as Error);
        } finally {
          isSavingRef.current = false;
        }
      },
      [sessionId, onSave, onError]
    ),
    debounceMs
  );

  // Save to localStorage immediately
  const saveToLocalStorage = useCallback(
    (quizState: QuizState) => {
      try {
        const storageKey = `intake_quiz_${sessionId}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            ...quizState,
            lastSavedAt: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [sessionId]
  );

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): QuizState | null => {
    try {
      const storageKey = `intake_quiz_${sessionId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          startedAt: new Date(parsed.startedAt),
          lastSavedAt: parsed.lastSavedAt
            ? new Date(parsed.lastSavedAt)
            : undefined,
        };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return null;
  }, [sessionId]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      const storageKey = `intake_quiz_${sessionId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, [sessionId]);

  // Auto-save function
  const autoSave = useCallback(
    (quizState: QuizState) => {
      // Save to localStorage immediately
      saveToLocalStorage(quizState);

      // Debounced API save
      debouncedSave(quizState);
    },
    [saveToLocalStorage] // Don't include debouncedSave in dependencies
  );

  // Force save (bypass debounce)
  const forceSave = useCallback(
    async (quizState: QuizState) => {
      saveToLocalStorage(quizState);

      if (isSavingRef.current) return;

      try {
        isSavingRef.current = true;
        await onSave(
          sessionId,
          quizState.responses,
          quizState.currentStep,
          quizState.selectedDisciplines
        );
        lastSavedRef.current = new Date().toISOString();
      } catch (error) {
        console.error("Error force saving intake session:", error);
        onError?.(error as Error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [sessionId, onSave, onError, saveToLocalStorage]
  );

  // Get last saved timestamp
  const getLastSaved = useCallback(() => {
    return lastSavedRef.current;
  }, []);

  // Check if currently saving
  const isSaving = useCallback(() => {
    return isSavingRef.current;
  }, []);

  return {
    autoSave,
    forceSave,
    loadFromLocalStorage,
    clearLocalStorage,
    getLastSaved,
    isSaving,
  };
}
