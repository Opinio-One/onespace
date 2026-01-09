"use client";

import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  showRetry = true,
  showHome = true,
  className,
}: ErrorFallbackProps) {
  // Detect if it's a Supabase/network error
  const isNetworkError =
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.name === "TypeError";

  const isSupabaseError =
    error.message.includes("Supabase") ||
    error.message.includes("supabase") ||
    error.message.includes("PGRST") ||
    error.message.includes("JWT");

  const errorTitle = isNetworkError || isSupabaseError
    ? "Verbindingsprobleem"
    : "Er is een fout opgetreden";

  const errorMessage = isNetworkError || isSupabaseError
    ? "Er is een probleem met de verbinding naar de server. Controleer uw internetverbinding en probeer het opnieuw."
    : "Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.";

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className={className}>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{errorTitle}</CardTitle>
          </div>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technische details
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {error.toString()}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            {showRetry && (
              <Button onClick={handleRetry} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Opnieuw proberen
              </Button>
            )}
            {showHome && (
              <Button onClick={handleGoHome} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Naar startpagina
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



