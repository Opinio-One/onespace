import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates an AbortSignal that times out after the specified duration
 * Falls back to manual timeout if AbortSignal.timeout is not available
 */
export function createTimeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  
  // Fallback for older browsers
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}
