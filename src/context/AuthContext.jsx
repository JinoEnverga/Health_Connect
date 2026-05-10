// src/context/AuthContext.jsx  ← REPLACE your existing file
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the profile row from our "profiles" table
  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  // On first load — check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    // Listen for login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  // REGISTER
  const register = async ({ fullName, email, password }) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setIsLoading(false);
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  // LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // UPDATE PROFILE
  const updateProfile = async (updates) => {
    if (!user) return { success: false };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) return { success: false, message: error.message };
    await fetchProfile(user.id);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
