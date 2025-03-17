import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if Supabase credentials are available
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseCredentials) {
  console.warn('Supabase URL or Anon Key is missing! Using mock data instead.');
}

// Create a Supabase client if credentials are available,
// otherwise this will be undefined and mock data will be used
export const supabase = hasSupabaseCredentials 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Authentication helpers that work with both real and mock data
export const signIn = async (email: string, password: string) => {
  if (supabase) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  } else {
    // Simulate login with mock data
    // Allow login with any credentials in dev mode
    if (email && password) {
      // For demonstration, we'll accept any login in dev mode
      // Store a dummy user for the session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: email,
        sectorId: 1,
        role: 'ADMIN',
      }));
      
      return {
        data: {
          session: {
            user: {
              id: '1',
              email: email,
            }
          }
        },
        error: null
      };
    } else {
      return {
        data: { session: null },
        error: new Error('Invalid credentials')
      };
    }
  }
};

export const signOut = async () => {
  if (supabase) {
    return await supabase.auth.signOut();
  } else {
    // Clear local storage in mock mode
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    return { error: null };
  }
};

export const getCurrentUser = async () => {
  if (supabase) {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { user: null, error };
    }
    
    return { user: session.user, error: null };
  } else {
    // Check local storage in mock mode
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userJson = localStorage.getItem('user');
    
    if (isLoggedIn && userJson) {
      const userData = JSON.parse(userJson);
      return {
        user: {
          id: String(userData.id),
          email: userData.email,
        },
        error: null
      };
    }
    
    return { user: null, error: null };
  }
};
