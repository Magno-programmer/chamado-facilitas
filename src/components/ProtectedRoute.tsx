
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Only show the restricted access message if:
    // 1. Not coming from logout
    // 2. Not trying to access the login page or home page
    // 3. Not authenticated and not loading
    if (!isLoading && 
        !isAuthenticated && 
        !document.referrer.includes('login') && 
        location.pathname !== '/login' &&
        location.pathname !== '/') {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa estar autenticado para acessar esta página.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, location.pathname]);

  if (isLoading) {
    // Show a loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, immediately redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
