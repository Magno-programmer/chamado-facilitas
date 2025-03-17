
// Export indicator that we're using mock data
const isUsingMockData = true;

// Import auth functions
import { signIn, signOut, getCurrentUser } from '@/services/authService';

// Export null for supabase client since we're not using it
export const supabase = null;

// Export the authentication functions
export { signIn, signOut, getCurrentUser };
