import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  requestPasswordRecovery: (email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (newPass: string) => Promise<{ success: boolean; message: string }>;
  registerAuthorizedAdmin: (
    name: string,
    email: string,
    role: AdminRole,
    phone: string,
    pass: string,
    authKey: string
  ) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<AdminUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          setCurrentAdmin(data as AdminUser);
        } else if (error) {
          console.error('Error fetching admin profile:', error.message);
        }
      } catch (err) {
        console.error('Unexpected error in fetchAdminProfile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error.message);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setCurrentAdmin(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Bem-vindo!' };
  };

  const logout = () => supabase.auth.signOut();

  const requestPasswordRecovery = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'E-mail de recuperação enviado.' };
  };

  const confirmPasswordReset = async (newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Senha alterada com sucesso.' };
  };

  const registerAuthorizedAdmin = async (
    name: string,
    email: string,
    role: AdminRole,
    phone: string,
    pass: string,
    authKey: string
  ) => {
    // Backend verification of master key
    const response = await fetch('/api/verify-master-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: authKey }),
    });

    if (!response.ok) {
      return { success: false, message: 'Chave de autorização inválida.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name, role, phone },
      },
    });

    if (error) return { success: false, message: error.message };
    
    // Profiles are created via SQL trigger, so just handle profile update if needed
    return { success: true, message: 'Administrador cadastrado.' };
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    // Optional: could re-auth here with currentPass to be extra sure
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Senha atualizada.' };
  };

  const updateProfile = async (updates: Partial<AdminUser>) => {
    if (!currentAdmin) return false;
    const { error } = await supabase.from('profiles').update(updates).eq('id', currentAdmin.id);
    return !error;
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        isAuthenticated: !!currentAdmin,
        isLoading,
        login,
        logout,
        requestPasswordRecovery,
        confirmPasswordReset,
        registerAuthorizedAdmin,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  return ctx;
};
