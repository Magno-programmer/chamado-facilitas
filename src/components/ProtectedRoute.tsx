
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
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  useEffect(() => {
    // Only show the restricted access message if:
    // 1. Not a public route
    // 2. Not coming from logout
    // 3. Not authenticated and not loading
    if (!isLoading && 
        !isAuthenticated && 
        !isPublicRoute &&
        !document.referrer.includes('login')) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa estar autenticado para acessar esta página.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, isPublicRoute]);

  // If this is a public route, just render the children
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    // Show a loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated and not a public route, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
