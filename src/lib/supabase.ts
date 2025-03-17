
// Imports for direct PostgreSQL connection
import { signIn, signOut, getCurrentUser } from '@/services/authService';

// Indicate that we're using direct PostgreSQL connection instead of Supabase
const isUsingPostgres = true;

// Export null for supabase client since we're not using it
export const supabase = null;

// Export the authentication functions from our auth service
export { signIn, signOut, getCurrentUser };
