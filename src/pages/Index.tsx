
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  // Animation references
  const heroRef = React.useRef<HTMLDivElement>(null);
  const featuresRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Reset authentication when landing on index page
  useEffect(() => {
    // Force logout when on index page
    const clearAuth = async () => {
      await logout();
    };
    
    clearAuth();
  }, [logout]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    // Observe hero section
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    // Observe features section
    if (featuresRef.current) {
      const features = featuresRef.current.querySelectorAll('.feature-card');
      features.forEach(feature => {
        observer.observe(feature);
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleAccessPlatform = () => {
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <div 
          ref={heroRef}
          className="container mx-auto px-4 opacity-0 translate-y-10 transition-all duration-700"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-12">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span>Versão 1.0</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Sistema de Chamados <span className="text-primary">Facilitas</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Simplifique seu fluxo de chamados com uma plataforma moderna, 
                intuitiva e eficiente. Gerencie solicitações com facilidade e 
                monitore prazos em tempo real.
              </p>
              <div>
                <button
                  onClick={handleAccessPlatform}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200 text-center font-medium inline-flex items-center"
                >
                  Acessar Plataforma <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2 mt-8 md:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-primary/10 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 transform -rotate-3 transition-all duration-500 hover:rotate-0">
                  <div className="space-y-4">
                    <div className="h-12 bg-primary/10 rounded-lg w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-green-100 rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-xs font-medium text-green-800">Concluídos</div>
                      </div>
                      <div className="h-24 bg-yellow-100 rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mb-2">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-xs font-medium text-yellow-800">Em Andamento</div>
                      </div>
                      <div className="h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-xs font-medium text-blue-800">Novos</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-100 rounded-lg"></div>
                      <div className="h-8 bg-gray-100 rounded-lg w-3/4"></div>
                      <div className="h-8 bg-gray-100 rounded-lg w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4" ref={featuresRef}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossa plataforma foi projetada para facilitar a gestão de chamados técnicos com recursos poderosos e intuitivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Gestão de Chamados',
                description: 'Crie, acompanhe e gerencie seus chamados de forma simplificada e organizada.',
                icon: <Zap className="h-8 w-8 text-primary" />,
              },
              {
                title: 'Controle de Prazos',
                description: 'Monitoramento visual de prazos para garantir que todos os chamados sejam atendidos no tempo correto.',
                icon: <Clock className="h-8 w-8 text-primary" />,
              },
              {
                title: 'Gestão de Equipes',
                description: 'Organize seus setores e equipes, atribuindo responsabilidades de forma clara e eficiente.',
                icon: <CheckCircle className="h-8 w-8 text-primary" />,
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 opacity-0 translate-y-10"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Facilitas
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de chamados simples e eficiente
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Facilitas. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
