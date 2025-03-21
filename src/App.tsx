
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Tickets from '@/pages/Tickets';
import NewTicket from '@/pages/tickets/NewTicket';
import TicketDetails from '@/pages/tickets/TicketDetails';
import Setores from '@/pages/Setores';
import UsuariosPage from '@/pages/usuarios';
import DeadlinesPage from '@/pages/deadlines';

import './App.css';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Regular protection - any authenticated user */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/tickets" element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              } />
              
              <Route path="/tickets/new" element={
                <ProtectedRoute>
                  <NewTicket />
                </ProtectedRoute>
              } />
              
              <Route path="/tickets/:id" element={
                <ProtectedRoute>
                  <TicketDetails />
                </ProtectedRoute>
              } />
              
              {/* ADMIN only routes */}
              <Route path="/setores" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Setores />
                </ProtectedRoute>
              } />
              
              <Route path="/usuarios" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsuariosPage />
                </ProtectedRoute>
              } />
              
              <Route path="/prazos" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DeadlinesPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
