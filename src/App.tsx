
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/tickets/NewTicket";
import TicketDetails from "./pages/tickets/TicketDetails";
import Deadlines from "./pages/deadlines";
import Setores from "./pages/Setores";
import Usuarios from "./pages/usuarios";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/deadlines" element={
              <ProtectedRoute>
                <Deadlines />
              </ProtectedRoute>
            } />
            <Route path="/setores" element={
              <ProtectedRoute>
                <Setores />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
