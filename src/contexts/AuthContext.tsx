import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cleanupAuthState } from "@/lib/authCleanup";

// Use sonner's toast directly to avoid any React hook conflicts
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  name?: string;
  avatar_url?: string;
  location?: string;
  is_provider: boolean;
  service_types?: string[];
  verified: boolean;
  bio?: string;
  phone?: string;
  profile_role?: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { email: string; password: string; name?: string; isProvider?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
        setTimeout(() => {
          loadUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
        setTimeout(() => {
          loadUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email!,
        profile: profile || undefined
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email!
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success("Welcome back!", { description: "You have successfully logged in." });
      window.location.href = "/feed";
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error("Login failed", { description: error.message || "An error occurred during login" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { email: string; password: string; name?: string; isProvider?: boolean }) => {
    setIsLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}

      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name || '', is_provider: userData.isProvider || false },
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: userData.name || '',
          is_provider: userData.isProvider || false,
          verified: false,
        });
      }

      toast.success("Account created!", { description: "Please check your email to verify your account." });
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error("Signup failed", { description: error.message || "An error occurred during signup" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}

      toast.success("Goodbye!", { description: "You have been logged out successfully." });
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error("Logout failed", { description: error.message || "An error occurred during logout" });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setUser({ ...user, profile: { ...user.profile, ...updates } });
      toast.success("Profile updated!", { description: "Your profile has been successfully updated." });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error("Update failed", { description: error.message || "An error occurred while updating your profile" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
