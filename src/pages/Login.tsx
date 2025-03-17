
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle login - using mock authentication for now
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock login service - to be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simplified validation
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Mock authentication for demo - would be replaced with an API call
      if (email === 'admin@example.com' && password === 'admin123') {
        // Mock admin user
        const mockUser = {
          id: 1,
          name: 'Administrador',
          email: 'admin@example.com',
          sectorId: 1,
          role: 'ADMIN'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('isLoggedIn', 'true');
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao sistema de chamados!',
          variant: 'default',
        });
        navigate('/dashboard');
      } else if (email === 'cliente@example.com' && password === 'cliente123') {
        // Mock client user
        const mockUser = {
          id: 2,
          name: 'Cliente Padrão',
          email: 'cliente@example.com',
          sectorId: 2,
          role: 'CLIENT'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('isLoggedIn', 'true');
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao sistema de chamados!',
          variant: 'default',
        });
        navigate('/dashboard');
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      toast({
        title: 'Erro de autenticação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 border animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Facilitas
            </h1>
            <p className="text-muted-foreground mt-2">Sistema de Gerenciamento de Chamados</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Credenciais de demonstração:</p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Admin:</strong> admin@example.com / admin123
                </p>
                <p>
                  <strong>Cliente:</strong> cliente@example.com / cliente123
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
