
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const NavItem = ({ to, label, currentPath }: { to: string; label: string; currentPath: string }) => (
  <Link
    to={to}
    className={cn(
      "relative px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-secondary group",
      currentPath === to 
        ? "text-primary font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full" 
        : "text-foreground/70 hover:text-foreground"
    )}
  >
    {label}
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if we should hide the navigation tabs (on index or login page)
  const shouldHideNavTabs = location.pathname === '/' || location.pathname === '/login';

  // Check if user is admin or sector admin (GERENTE)
  const isAdmin = user?.role === 'ADMIN';
  const isSectorAdmin = user?.role === 'GERENTE';
  const canAccessDeadlines = isAdmin || isSectorAdmin;

  // Don't render navbar on login page
  if (!isAuthenticated && location.pathname !== '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Facilitas
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {isAuthenticated && !shouldHideNavTabs ? (
            <>
              <NavItem to="/dashboard" label="Dashboard" currentPath={location.pathname} />
              <NavItem to="/tickets" label="Chamados" currentPath={location.pathname} />
              
              {/* Show Deadlines to both ADMIN and Gerente */}
              {canAccessDeadlines && (
                <NavItem to="/deadlines" label="Prazos" currentPath={location.pathname} />
              )}
              
              {/* Admin-only menu items */}
              {isAdmin && (
                <>
                  <NavItem to="/setores" label="Setores" currentPath={location.pathname} />
                  <NavItem to="/usuarios" label="Usuários" currentPath={location.pathname} />
                </>
              )}
              
              <button 
                onClick={logout}
                className="ml-4 p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-muted"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            location.pathname === '/' && (
              <Link 
                to="/login" 
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                Login
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu toggle - only show on authenticated pages that aren't the index or login */}
        {isAuthenticated && !shouldHideNavTabs && (
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
        
        {/* Show login button on mobile for index page */}
        {!isAuthenticated && location.pathname === '/' && (
          <Link 
            to="/login" 
            className="md:hidden bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && isAuthenticated && !shouldHideNavTabs && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b animate-fade-in">
          <nav className="container py-4 flex flex-col space-y-3">
            <>
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-md hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/tickets" 
                className="px-4 py-2 rounded-md hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Chamados
              </Link>
              
              {/* Show Deadlines to both ADMIN and Gerente */}
              {canAccessDeadlines && (
                <Link 
                  to="/deadlines" 
                  className="px-4 py-2 rounded-md hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prazos
                </Link>
              )}
              
              {/* Admin-only menu items */}
              {isAdmin && (
                <>
                  <Link 
                    to="/setores" 
                    className="px-4 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Setores
                  </Link>
                  <Link 
                    to="/usuarios" 
                    className="px-4 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Usuários
                  </Link>
                </>
              )}
              
              <button 
                onClick={logout}
                className="flex items-center px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
