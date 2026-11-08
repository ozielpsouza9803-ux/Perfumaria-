import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  registerCustomer: (
    name: string,
    email: string,
    phone: string,
    pass: string
  ) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<AdminUser>) => Promise<boolean>;
  setTestingRole: (role: AdminRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminProfile = async (user: any): Promise<boolean> => {
    try {
      // Query public.profiles by user UUID
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const roleFromProfile = data?.role || user.user_metadata?.role || '';
      const normalizedRole = String(roleFromProfile).toLowerCase().trim();
      const validAdminRoles = ['admin', 'super_admin', 'gerente', 'estoquista', 'consultor'];
      const isAdminRole = validAdminRoles.includes(normalizedRole);

      if (isAdminRole) {
        const loadedAdmin: AdminUser = {
          id: user.id,
          name: data?.full_name || data?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Administrador',
          email: user.email || data?.email || '',
          role: (data?.role || 'admin') as AdminRole,
          phone: data?.phone || user.user_metadata?.phone || '',
          avatar: data?.avatar_url || data?.avatar,
          active: data?.active ?? true,
          createdAt: data?.created_at || user.created_at,
          lastLogin: new Date().toISOString(),
        };

        if (loadedAdmin.active !== false) {
          setCurrentAdmin(loadedAdmin);
          localStorage.setItem('mr_admin_session', JSON.stringify(loadedAdmin));
          return true;
        }
      }

      // If user profile is not an active admin role (e.g. customer account)
      setCurrentAdmin(null);
      localStorage.removeItem('mr_admin_session');
      return false;
    } catch (err) {
      console.error('Unexpected error in fetchAdminProfile:', err);
      setCurrentAdmin(null);
      localStorage.removeItem('mr_admin_session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalSession = () => {
    const stored = localStorage.getItem('mr_admin_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // 1. Expiration validation (only applies if expiresAt was explicitly set)
        if (typeof parsed.expiresAt === 'number' && Date.now() > parsed.expiresAt) {
          localStorage.removeItem('mr_admin_session');
          setCurrentAdmin(null);
          setIsLoading(false);
          return;
        }

        // 2. Role authorization validation: normalize role and accept valid administrative roles
        const validAdminRoles = ['admin', 'super_admin', 'gerente', 'estoquista', 'consultor'];
        const roleCandidate = typeof parsed.role === 'string' ? parsed.role.toLowerCase().trim() : '';

        if (validAdminRoles.includes(roleCandidate) && parsed.active !== false) {
          setCurrentAdmin(parsed);
        } else {
          localStorage.removeItem('mr_admin_session');
          setCurrentAdmin(null);
        }
      } catch (e) {
        localStorage.removeItem('mr_admin_session');
        setCurrentAdmin(null);
      }
    } else {
      setCurrentAdmin(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            fetchAdminProfile(session.user);
          } else {
            loadLocalSession();
          }
        })
        .catch((err) => {
          console.warn('Supabase getSession notice:', err?.message || err);
          loadLocalSession();
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchAdminProfile(session.user);
        } else {
          loadLocalSession();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loadLocalSession();
    }
  }, []);

  const setTestingRole = (role: AdminRole) => {
    if (!currentAdmin) return;
    const updated = { ...currentAdmin, role };
    setCurrentAdmin(updated);
    localStorage.setItem('mr_admin_session', JSON.stringify(updated));
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Authenticate exclusively via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'E-mail não confirmado. Verifique sua caixa de entrada para validar o acesso cadastrado no Supabase.',
          };
        }
        return {
          success: false,
          message: 'Credenciais inválidas. Verifique o e-mail e a senha cadastrados no Supabase.',
        };
      }

      if (data.session?.user) {
        // Query public.profiles by UUID to verify administrative privileges
        const isAuthorizedAdmin = await fetchAdminProfile(data.session.user);

        if (isAuthorizedAdmin) {
          return { success: true, message: 'Bem-vindo ao Painel Administrativo!' };
        } else {
          // User authenticated, but is a customer without admin privileges
          await supabase.auth.signOut().catch(() => {});
          return {
            success: false,
            message: 'Acesso restrito. Esta conta de e-mail não possui privilégios de administrador.',
          };
        }
      }

      return {
        success: false,
        message: 'Falha ao autenticar. Tente novamente.',
      };
    } catch (err: any) {
      console.error('Supabase Auth error:', err?.message || err);
      return {
        success: false,
        message: 'Erro na conexão com o Supabase Auth. Verifique sua conexão e tente novamente.',
      };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      try {
        supabase.auth.signOut().catch(() => {});
      } catch (e) {}
    }
    localStorage.removeItem('mr_admin_session');
    setCurrentAdmin(null);
  };

  const requestPasswordRecovery = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'E-mail de recuperação enviado com sucesso!' };
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
      return { success: false, message: 'Chave Mestra de autorização inválida.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: { name, full_name: name, role, phone },
      },
    });

    if (error) return { success: false, message: error.message };

    // Also ensure profiles table has the record if user ID is returned
    if (data.user?.id) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        role: role,
        phone: phone,
      });
    }

    return {
      success: true,
      message: 'Administrador cadastrado com sucesso! Um e-mail de confirmação foi enviado. Ative sua conta para entrar.',
    };
  };

  const registerCustomer = async (name: string, email: string, phone: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: { name, full_name: name, role: 'CONSULTOR', phone },
      },
    });

    if (error) return { success: false, message: error.message };

    if (data.user?.id) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        role: 'CONSULTOR',
        phone: phone,
      });

      await supabase.from('customers').upsert({
        id: data.user.id,
        name: name,
        email: email,
        phone: phone,
        cpf: '000.000.000-00',
        city: 'São Paulo',
        state: 'SP',
        vip_tier: 'Standard',
        total_spent: 0,
        orders_count: 0,
      });
    }

    return {
      success: true,
      message: 'Conta de Cliente VIP criada com sucesso! Entre com seu e-mail e senha para acessar.',
    };
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Senha atualizada com sucesso.' };
  };

  const updateProfile = async (updates: Partial<AdminUser>) => {
    if (!currentAdmin) return false;
    const sbUpdates: any = {};
    if (updates.name) sbUpdates.full_name = updates.name;
    if (updates.phone) sbUpdates.phone = updates.phone;
    if (updates.avatar) sbUpdates.avatar_url = updates.avatar;
    if (updates.role) sbUpdates.role = updates.role;
    sbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('profiles').update(sbUpdates).eq('id', currentAdmin.id);
    if (!error) {
      const updatedAdmin = { ...currentAdmin, ...updates };
      setCurrentAdmin(updatedAdmin);
      localStorage.setItem('mr_admin_session', JSON.stringify(updatedAdmin));
      return true;
    }
    return false;
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
        registerCustomer,
        changePassword,
        updateProfile,
        setTestingRole,
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
