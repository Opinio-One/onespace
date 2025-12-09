"use client";

import { ErrorBoundary } from "./error-boundary";

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log errors for debugging
        console.error("Root ErrorBoundary caught:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

