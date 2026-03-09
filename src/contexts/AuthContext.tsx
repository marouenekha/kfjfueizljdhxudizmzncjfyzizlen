import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/lib/authCleanup";

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
    // Listen for auth changes FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Set minimal user synchronously
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(() => {
          loadUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // THEN, get initial session
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
      // Clean up any existing auth state to avoid limbo sessions
      cleanupAuthState();
      // Attempt a global sign out (ignore errors)
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Force a clean reload to ensure fresh session state
      window.location.href = "/feed";
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { email: string; password: string; name?: string; isProvider?: boolean }) => {
    setIsLoading(true);
    try {
      // Clean up any existing auth state before sign up
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name || '',
            is_provider: userData.isProvider || false,
          },
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      // Create profile after signup
      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name: userData.name || '',
          is_provider: userData.isProvider || false,
          verified: false,
        });
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth storage and attempt a global sign out
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" } as any);
      } catch {}
      
      toast({
        title: "Goodbye!",
        description: "You have been logged out successfully.",
      });

      // Hard redirect to ensure a clean state
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
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

      // Update local user state
      setUser({
        ...user,
        profile: { ...user.profile, ...updates }
      });

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};