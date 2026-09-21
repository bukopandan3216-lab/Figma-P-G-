import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: string;
  role: 'customer' | 'super_admin' | 'beauty_admin' | 'beauty_staff';
  initials: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  socialLogin: (provider: 'Google' | 'Facebook') => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isCustomer: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const Ctx = createContext<AuthCtx | null>(null);

type ProfileRow = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  role: 'Customer' | 'Beauty Staff' | 'Beauty Admin' | 'Super Admin';
  skin_profile?: Record<string, unknown>;
};

function toUser(authUser: SupabaseUser, profile?: ProfileRow | null): User {
  const names = (profile?.full_name || authUser.user_metadata?.full_name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = names[0] || authUser.email?.split('@')[0] || 'User';
  const lastName = names.slice(1).join(' ');
  const roleMap: Record<ProfileRow['role'], User['role']> = { Customer: 'customer', 'Beauty Staff': 'beauty_staff', 'Beauty Admin': 'beauty_admin', 'Super Admin': 'super_admin' };
  return {
    id: authUser.id,
    firstName,
    lastName,
    email: profile?.email || authUser.email || '',
    phone: profile?.phone || undefined,
    birthday: profile?.birthday || undefined,
    role: profile ? roleMap[profile.role] : 'customer',
    initials: `${firstName[0] || 'U'}${lastName[0] || ''}`.toUpperCase(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser: SupabaseUser | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (error) {
      setUser(toUser(authUser));
      return;
    }
    setUser(toUser(authUser, data));
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void loadProfile(data.session?.user || null).finally(() => setLoading(false));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) void loadProfile(session?.user || null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const unavailable = () => ({ ok: false, error: 'Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables.' });

  const login = async (email: string, password: string, role?: string) => {
    if (!isSupabaseConfigured) return unavailable();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, error: error?.message || 'Login failed.' };
    await loadProfile(data.user);
    const nextRole = (await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()).data?.role;
    if (role && role !== 'customer') {
      if (!['Super Admin', 'Beauty Admin', 'Beauty Staff'].includes(nextRole)) {
        await supabase.auth.signOut();
        return { ok: false, error: 'This account does not have admin access.' };
      }
    } else if (nextRole && nextRole !== 'Customer') {
      await supabase.auth.signOut();
      setUser(null);
      return { ok: false, error: 'Use the admin portal to sign in with this account.' };
    }
    return { ok: true };
  };

  const register = async (data: RegisterData) => {
    if (!isSupabaseConfigured) return unavailable();
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: `${data.firstName} ${data.lastName}`.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    if (result.user) await loadProfile(result.session?.user || null);
    return { ok: true };
  };

  const socialLogin = async (provider: 'Google' | 'Facebook') => {
    if (!isSupabaseConfigured) return unavailable();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase() as 'google' | 'facebook',
      options: { redirectTo: `${window.location.origin}/login` },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const profileData = {
      full_name: `${data.firstName || user.firstName} ${data.lastName || user.lastName}`.trim(),
      phone: data.phone,
      birthday: data.birthday,
    };
    const { data: updated } = await supabase.from('profiles').update(profileData).eq('id', user.id).select('*').single();
    setUser(updated ? toUser({ id: user.id, email: user.email } as SupabaseUser, updated) : { ...user, ...data });
  };

  const isAdmin = !!user && ['super_admin', 'beauty_admin', 'beauty_staff'].includes(user.role);
  const isCustomer = !!user && user.role === 'customer';

  return <Ctx.Provider value={{ user, loading, login, register, socialLogin, logout, updateUser, isAdmin, isCustomer }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
