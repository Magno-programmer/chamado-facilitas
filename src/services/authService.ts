
import { verifyUserCredentials } from './userService';
import { User } from '@/lib/types';
import jwt from 'jsonwebtoken';

// Secret key for JWT (in production, this should be in environment variables)
const JWT_SECRET = 'your-secret-key';
const TOKEN_EXPIRY = '24h';

export const signIn = async (email: string, password: string) => {
  try {
    // Verify user credentials against database
    const user = await verifyUserCredentials(email, password);
    
    if (!user) {
      return {
        data: { session: null },
        error: new Error('Invalid credentials')
      };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Store user in local storage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
    
    return {
      data: {
        session: {
          user: {
            id: String(user.id),
            email: user.email,
          },
          token
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: { session: null },
      error: new Error('Authentication failed')
    };
  }
};

export const signOut = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if user is stored in local storage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      return { user: null, error: null };
    }
    
    try {
      // Verify token
      jwt.verify(token, JWT_SECRET);
      
      // Token is valid, return user
      const userData = JSON.parse(storedUser) as User;
      
      return { 
        user: {
          id: String(userData.id),
          email: userData.email,
        }, 
        error: null 
      };
    } catch (tokenError) {
      // Token is invalid or expired
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      return { user: null, error: new Error('Session expired') };
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, error };
  }
};
