import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { courseService } from '../services/courseService';
import { Course } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  purchasedCourses: Course[];
  createdCourses: Course[];
  signUp: (email: string, password: string, userData: { name: string; phone: string; role: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePurchasedCourses: (userId: string) => Promise<void>;
  updateCreatedCourses: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async (userId: string) => {
      try {
        const [created, purchased] = await Promise.all([
          courseService.getCreatedCourses(userId),
          courseService.getPurchasedCourses(userId)
        ]);
        
        setCreatedCourses(created);
        setPurchasedCourses(purchased);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchCourses(currentUser.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchCourses(currentUser.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; phone: string; role: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updatePurchasedCourses = async (userId: string) => {
    const purchased = await courseService.getPurchasedCourses(userId);
    setPurchasedCourses(purchased);
  };

  const updateCreatedCourses = async (userId: string) => {
    const created = await courseService.getCreatedCourses(userId);
    setCreatedCourses(created);
  };

  return (
    <AuthContext.Provider value={{ user, loading, purchasedCourses, createdCourses, signUp, signIn, signOut, updatePurchasedCourses, updateCreatedCourses }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}