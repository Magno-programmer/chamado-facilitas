
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { mockLogin } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Mock login for demonstration
      const user = mockLogin(email, password);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${user.name}!`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Email ou senha inválidos.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-xl p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Facilitas
              </span>
            </h1>
            <p className="text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border bg-white px-3 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use o email: admin@example.com ou client@example.com
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border bg-white px-3 py-2 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Qualquer senha funciona para esta demonstração
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Lembrar-me
                </label>
              </div>

              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              Registre-se
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Facilitas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
