"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  full_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      console.log("Fetching user data...");
      const response = await fetch("/auth/user");
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
      } else {
        console.log("Failed to fetch user data");
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, user: !!session?.user });
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile data when user is authenticated
        console.log("User authenticated, fetching profile...");
        await fetchUser();
      } else {
        console.log("User signed out, clearing profile");
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      });

      const data = await response.json();
      console.log("Sign in response:", { ok: response.ok, user: !!data.user });

      if (response.ok) {
        setUser(data.user);
        // Manually fetch profile data after successful sign-in
        console.log("Manually fetching profile after sign-in...");
        await fetchUser();
        return {};
      } else {
        return { error: data.error };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: "An unexpected error occurred" };
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
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        // Profile will be fetched separately via fetchUser()
        return {};
      } else {
        return { error: data.error };
      }
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/auth/signout", {
        method: "POST",
      });
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    profile,
    loading,
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
