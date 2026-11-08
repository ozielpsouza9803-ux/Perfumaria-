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

  const fetchAdminProfile = async (user: any) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        const loadedAdmin: AdminUser = {
          id: data.id,
          name: data.full_name || data.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
          email: user.email || data.email || '',
          role: (data.role || user.user_metadata?.role || 'SUPER_ADMIN') as AdminRole,
          phone: data.phone || user.user_metadata?.phone || '',
          avatar: data.avatar_url || data.avatar,
          active: data.active ?? true,
          createdAt: data.created_at || user.created_at,
          lastLogin: data.updated_at || new Date().toISOString(),
        };
        setCurrentAdmin(loadedAdmin);
        localStorage.setItem('mr_admin_session', JSON.stringify(loadedAdmin));
      } else {
        // If profile row doesn't exist yet, create or use user_metadata
        const newProfile: AdminUser = {
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador',
          email: user.email || '',
          role: (user.user_metadata?.role || 'SUPER_ADMIN') as AdminRole,
          phone: user.user_metadata?.phone || '',
          active: true,
          createdAt: user.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        setCurrentAdmin(newProfile);
        localStorage.setItem('mr_admin_session', JSON.stringify(newProfile));

        // Attempt to save to profiles table
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: newProfile.name,
          role: newProfile.role,
          phone: newProfile.phone,
        });
      }
    } catch (err) {
      console.error('Unexpected error in fetchAdminProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAdminProfile(session.user);
      } else {
        // Fallback: Check persistent local admin session
        const stored = localStorage.getItem('mr_admin_session');
        if (stored) {
          try {
            setCurrentAdmin(JSON.parse(stored));
          } catch (e) {
            localStorage.removeItem('mr_admin_session');
          }
        }
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAdminProfile(session.user);
      } else {
        const stored = localStorage.getItem('mr_admin_session');
        if (stored) {
          try {
            setCurrentAdmin(JSON.parse(stored));
          } catch (e) {
            setCurrentAdmin(null);
          }
        } else {
          setCurrentAdmin(null);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setTestingRole = (role: AdminRole) => {
    if (!currentAdmin) return;
    const updated = { ...currentAdmin, role };
    setCurrentAdmin(updated);
    localStorage.setItem('mr_admin_session', JSON.stringify(updated));
  };

  const login = async (email: string, pass: string) => {
    // 1. Attempt official Supabase Auth signIn
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    if (!error && data.session?.user) {
      await fetchAdminProfile(data.session.user);
      return { success: true, message: 'Bem-vindo ao Ateliê Administrativo!' };
    }

    // 2. If Supabase Auth returns 'Email not confirmed' or 'Invalid credentials', verify via secure server proxy
    try {
      const serverRes = await fetch('/api/admin-auth-fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      if (serverRes.ok) {
        const body = await serverRes.json();
        if (body.success && body.admin) {
          setCurrentAdmin(body.admin);
          localStorage.setItem('mr_admin_session', JSON.stringify(body.admin));

          // Sync with Supabase profiles table
          try {
            await supabase.from('profiles').upsert({
              id: body.admin.id,
              full_name: body.admin.name,
              role: body.admin.role,
              phone: body.admin.phone,
            });
          } catch (e) {
            console.warn('Sync profile notice:', e);
          }

          return { success: true, message: `Bem-vindo, ${body.admin.name}!` };
        }
      }
    } catch (e) {
      console.warn('Server auth fallback notice:', e);
    }

    if (error?.message.includes('Email not confirmed')) {
      return {
        success: false,
        message: 'E-mail não confirmado. Verifique sua caixa de entrada (ou spam) para validar o acesso cadastrado no Supabase.',
      };
    }

    if (error?.message.includes('Invalid login credentials')) {
      return {
        success: false,
        message: 'Credenciais inválidas. Verifique o e-mail corporativo e a senha informada.',
      };
    }

    return { success: false, message: error?.message || 'Erro ao realizar login.' };
  };

  const logout = () => {
    supabase.auth.signOut();
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
