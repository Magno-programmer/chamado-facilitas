
import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PasswordDisplayProps {
  password: string;
}

const PasswordDisplay = ({ password }: PasswordDisplayProps) => {
  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast({
        title: "Senha copiada",
        description: "A senha foi copiada para a área de transferência.",
      });
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel>Senha Gerada Automaticamente</FormLabel>
      <div className="relative">
        <Input 
          type="text" 
          value={password}
          readOnly
          className="pr-10"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={copyToClipboard}
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Esta senha é gerada automaticamente e será necessária para o primeiro acesso. 
        Copie-a e compartilhe com o usuário de forma segura.
      </p>
    </div>
  );
};

export default PasswordDisplay;
