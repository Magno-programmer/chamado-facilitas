
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-4xl text-center space-y-8 animate-fade-in">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Facilitas
        </h1>
        <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
          Sistema de gerenciamento de chamados eficiente e fácil de usar para otimizar a comunicação entre setores e garantir a resolução de problemas no prazo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild size="lg" className="font-medium">
            <Link to="/login">Acessar o Sistema</Link>
          </Button>
        </div>
        
        <div className="mt-12 p-6 bg-card rounded-lg shadow-md max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Não tem uma conta?</h2>
          <p className="text-muted-foreground mb-4">
            O acesso ao sistema é exclusivo. Entre em contato com o administrador para solicitar uma conta:
          </p>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            carlosmagnoprogrammer@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
