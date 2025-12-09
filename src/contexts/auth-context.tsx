"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { createTimeoutSignal } from "@/lib/utils";

interface UserProfile {
  full_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  hasCompletedIntake: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    full_name: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCompletedIntake, setHasCompletedIntake] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      console.log("Fetching user data...");
      const response = await fetch("/auth/user", {
        // Add timeout to prevent hanging requests
        signal: createTimeoutSignal(10000), // 10 second timeout
      });
      console.log("User endpoint response:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (response.ok) {
        const { user, profile } = await response.json();
        console.log("User data fetched:", { user: !!user, profile });
        setUser(user);
        setProfile(profile);

        // Check intake completion status
        if (user) {
          await checkIntakeStatus();
        }
      } else {
        // Handle different error statuses gracefully
        if (response.status === 401) {
          // Unauthorized - user is not logged in, this is normal
          console.log("User not authenticated");
        } else if (response.status >= 500) {
          // Server error - Supabase might be down
          console.error("Server error fetching user data:", response.status);
        } else {
          console.log("Failed to fetch user data:", response.status);
        }
        setUser(null);
        setProfile(null);
        setHasCompletedIntake(false);
      }
    } catch (error) {
      // Handle network errors and timeouts gracefully
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          console.error("Request timeout while fetching user data");
        } else if (error.message.includes("fetch") || error.message.includes("network")) {
          console.error("Network error fetching user data - Supabase may be unavailable");
        } else {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("Unknown error fetching user data:", error);
      }
      // Don't clear user state on network errors - keep existing state
      // Only clear if we're certain there's an auth issue
      setHasCompletedIntake(false);
    } finally {
      setLoading(false);
    }
  };

  const checkIntakeStatus = async () => {
    try {
      const response = await fetch("/api/intake/status", {
        signal: createTimeoutSignal(5000), // 5 second timeout
      });
      if (response.ok) {
        const { completed } = await response.json();
        setHasCompletedIntake(completed);
      } else {
        // If status check fails, assume not completed rather than throwing
        console.warn("Failed to check intake status:", response.status);
        setHasCompletedIntake(false);
      }
    } catch (error) {
      // Gracefully handle errors - don't break the app if intake status check fails
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          console.warn("Timeout checking intake status");
        } else {
          console.error("Error checking intake status:", error);
        }
      } else {
        console.error("Unknown error checking intake status:", error);
      }
      // Default to false on error - safer assumption
      setHasCompletedIntake(false);
    }
  };

  const syncIntakeSession = async () => {
    try {
      // Check for intake session in localStorage
      const sessionId = localStorage.getItem("intake_session_id");
      if (sessionId) {
        const response = await fetch("/api/intake/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
          signal: createTimeoutSignal(5000), // 5 second timeout
        });

        if (response.ok) {
          // Clear localStorage after successful sync
          localStorage.removeItem("intake_session_id");
          console.log("Intake session synced successfully");
        } else {
          console.warn("Failed to sync intake session:", response.status);
          // Keep sessionId in localStorage for retry later
        }
      }
    } catch (error) {
      // Gracefully handle sync errors - don't break auth flow
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          console.warn("Timeout syncing intake session");
        } else {
          console.error("Error syncing intake session:", error);
        }
      } else {
        console.error("Unknown error syncing intake session:", error);
      }
      // Don't throw - allow auth to continue even if sync fails
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes with error handling
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const {
        data: { subscription: authSubscription },
        error: subscriptionError,
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log("Auth state change:", { event, user: !!session?.user });
          setUser(session?.user ?? null);
          if (session?.user) {
            // Fetch profile data when user is authenticated
            console.log("User authenticated, fetching profile...");
            await fetchUser();
            // Sync any anonymous intake session (don't await to avoid blocking)
            syncIntakeSession().catch((error) => {
              console.error("Background sync failed:", error);
            });
          } else {
            console.log("User signed out, clearing profile");
            setProfile(null);
            setHasCompletedIntake(false);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          // Don't break the auth flow on errors
          setLoading(false);
        }
      });

      if (subscriptionError) {
        console.error("Error setting up auth state listener:", subscriptionError);
      } else {
        subscription = authSubscription;
      }
    } catch (error) {
      console.error("Failed to initialize auth state listener:", error);
      // Continue without auth state listener - app can still function
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from auth state:", error);
        }
      }
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user...");
      const response = await fetch("/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: createTimeoutSignal(15000), // 15 second timeout
      });

      const data = await response.json();
      console.log("Sign in response:", { ok: response.ok, user: !!data.user });

      if (response.ok) {
        setUser(data.user);
        // Manually fetch profile data after successful sign-in
        console.log("Manually fetching profile after sign-in...");
        await fetchUser();
        // Sync any anonymous intake session (don't await to avoid blocking)
        syncIntakeSession().catch((error) => {
          console.error("Background sync failed after sign-in:", error);
        });
        return {};
      } else {
        // Provide more specific error messages
        const errorMessage = data.error || "Inloggen mislukt";
        return { error: errorMessage };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          return { error: "Verzoek duurde te lang. Controleer uw internetverbinding." };
        } else if (error.message.includes("fetch") || error.message.includes("network")) {
          return { error: "Netwerkfout. Controleer uw internetverbinding." };
        }
      }
      return { error: "Er is een onverwachte fout opgetreden bij het inloggen." };
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, full_name }),
        signal: createTimeoutSignal(15000), // 15 second timeout
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        // Profile will be fetched separately via fetchUser()
        // Sync any anonymous intake session (don't await to avoid blocking)
        syncIntakeSession().catch((error) => {
          console.error("Background sync failed after sign-up:", error);
        });
        return {};
      } else {
        // Provide more specific error messages
        const errorMessage = data.error || "Registreren mislukt";
        return { error: errorMessage };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.name === "TimeoutError") {
          return { error: "Verzoek duurde te lang. Controleer uw internetverbinding." };
        } else if (error.message.includes("fetch") || error.message.includes("network")) {
          return { error: "Netwerkfout. Controleer uw internetverbinding." };
        }
      }
      return { error: "Er is een onverwachte fout opgetreden bij het registreren." };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/auth/signout", {
        method: "POST",
        signal: createTimeoutSignal(5000), // 5 second timeout
      });
      // Always clear local state even if request fails
      setUser(null);
      setProfile(null);
      setHasCompletedIntake(false);
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear local state on error to ensure user is logged out locally
      setUser(null);
      setProfile(null);
      setHasCompletedIntake(false);
    }
  };

  const refreshUser = async () => {
    try {
      await fetchUser();
    } catch (error) {
      console.error("Error refreshing user:", error);
      // Don't throw - let the component handle the error state
    }
  };

  const value = {
    user,
    profile,
    loading,
    hasCompletedIntake,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
