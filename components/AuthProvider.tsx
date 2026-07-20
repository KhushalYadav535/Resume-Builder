"use client";

import { createContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Check and restore active session on initial load
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Error restoring active user session:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen dynamically to state changes (sign-in, sign-out, session expiration)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Fetch role on user state change
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setRole(data.role);
        } else {
          setRole("user");
        }
      } catch (err) {
        setRole("user");
      }
    };
    fetchRole();
  }, [user, supabase]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        if (message.toLowerCase().includes("invalid login credentials")) {
          message = "Invalid email or password. Please try again.";
        }
        return { error: message };
      }

      setUser(data.user);
      router.push("/dashboard");
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred during login." };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        if (message.toLowerCase().includes("already registered") || message.toLowerCase().includes("user already exists")) {
          message = "An account with this email address already exists.";
        }
        return { error: message };
      }

      // Explicitly create user profile as a safety net in case the DB trigger hasn't fired.
      // Uses upsert with ignoreDuplicates so it never errors if trigger already created the row.
      if (data.user) {
        await supabase
          .from("user_profiles")
          .upsert(
            { id: data.user.id, email: data.user.email ?? email, role: "user", has_completed_onboarding: false },
            { onConflict: "id", ignoreDuplicates: true }
          );
        setUser(data.user);
        router.push("/dashboard");
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred during signup." };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

