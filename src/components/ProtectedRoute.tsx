
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowSectorAdmin?: boolean; // New prop to allow sector admins
}

const ProtectedRoute = ({ children, allowedRoles, allowSectorAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  // Check role-based access
  const hasRequiredRole = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return user && allowedRoles.includes(user.role);
  };

  // Check if it's a sector admin (has GERENTE role) from the "Geral" sector
  const isGeneralSectorAdmin = () => {
    if (!allowSectorAdmin || !user || user.role !== 'GERENTE') return false;
    
    // This is for routes like /deadlines which sector admins can access
    return true;
  };

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

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated but doesn't have the required role or is not a sector admin when allowed, show access denied
  if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole() && !isGeneralSectorAdmin()) {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and has required role or is a valid sector admin, render the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
