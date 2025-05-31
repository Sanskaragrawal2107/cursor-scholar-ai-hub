import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://znbbouwzfkyrettglmht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuYmJvdXd6Zmt5cmV0dGdsbWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NjkyNDgsImV4cCI6MjA2NDI0NTI0OH0.VmBVbIc79k6PDhkWyHU2jpGl3xQwR7bjgu_n6SN0Ow8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export async function signUp(email: string, password: string, fullName: string, role: 'student' | 'teacher') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      }
    }
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
} 