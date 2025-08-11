import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      toast({
        title: "🔄 Debug - Profil",
        description: "Chargement du profil utilisateur...",
      });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found, create one
        toast({
          title: "⚠️ Debug - Pas de profil",
          description: "Création d'un nouveau profil...",
        });
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.id,
            name: authUser.user_metadata?.name || '',
            is_provider: authUser.user_metadata?.is_provider || false,
            verified: false,
          })
          .select()
          .single();

        if (insertError) {
          toast({
            title: "❌ Debug - Erreur création",
            description: `Erreur création profil: ${insertError.message}`,
            variant: "destructive",
          });
          throw insertError;
        }

        toast({
          title: "✅ Debug - Profil créé",
          description: "Nouveau profil créé avec succès",
        });

        setUser({
          id: authUser.id,
          email: authUser.email!,
          profile: newProfile
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: "✅ Debug - Profil chargé",
          description: `Profil trouvé: ${profile ? 'OUI' : 'NON'}`,
        });

        setUser({
          id: authUser.id,
          email: authUser.email!,
          profile: profile || undefined
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "⚠️ Debug - Profil",
        description: `Erreur profil: ${error.message}`,
        variant: "destructive",
      });
      setUser({
        id: authUser.id,
        email: authUser.email!
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    toast({
      title: "🔄 Debug - Étape 1",
      description: "Début de la connexion...",
    });
    
    try {
      toast({
        title: "🔄 Debug - Étape 2", 
        description: "Envoi des données à Supabase...",
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      toast({
        title: "🔄 Debug - Étape 3",
        description: `Réponse reçue - Error: ${error ? 'OUI' : 'NON'}, Data: ${data ? 'OUI' : 'NON'}`,
      });

      if (error) {
        toast({
          title: "❌ Debug - Erreur détectée",
          description: `Code: ${error.status}, Message: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "✅ Debug - Étape 4",
        description: "Connexion réussie, chargement du profil...",
      });

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "❌ Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
      toast({
        title: "🔄 Debug - Étape finale",
        description: "Loading terminé",
      });
    }
  };

  const signup = async (userData: { email: string; password: string; name?: string; isProvider?: boolean }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name || '',
            is_provider: userData.isProvider || false,
          }
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
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Goodbye!",
        description: "You have been logged out successfully.",
      });
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