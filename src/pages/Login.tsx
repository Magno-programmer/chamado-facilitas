
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 [Login] Formulário de login enviado:', { email, password: '••••••••' });
    setIsLoading(true);

    try {
      if (!email || !password) {
        console.log('📝 [Login] Campos vazios detectados');
        throw new Error('Por favor, preencha todos os campos');
      }

      console.log('📝 [Login] Chamando função de login');
      const success = await login(email, password);
      console.log('📝 [Login] Resultado do login:', success);
      
      if (success) {
        console.log('📝 [Login] Login bem-sucedido, redirecionando para dashboard');
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao sistema de chamados!',
          variant: 'default',
        });
        navigate('/dashboard');
      } else {
        console.log('📝 [Login] Login falhou');
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('📝 [Login] Erro no processo de login:', error);
      toast({
        title: 'Erro de autenticação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      console.log('📝 [Login] Finalizando processo de login');
      setIsLoading(false);
    }
  };

  console.log('📝 [Login] Renderizando componente Login');
  
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
              <p>Credenciais para teste:</p>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Email:</strong> admin@example.com
                </p>
                <p>
                  <strong>Senha:</strong> senha123
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
