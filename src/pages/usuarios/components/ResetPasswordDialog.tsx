
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Usuario {
  id: string;
  nome: string;
}

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  password: string;
  onComplete: () => void;
}

const ResetPasswordDialog = ({ 
  open, 
  onOpenChange, 
  usuario, 
  password,
  onComplete
}: ResetPasswordDialogProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Senha copiada",
      description: "A senha foi copiada para a área de transferência.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir Senha</DialogTitle>
          <DialogDescription>
            Nova senha para o usuário "{usuario?.nome}".
            Esta senha será exibida apenas uma vez!
          </DialogDescription>
        </DialogHeader>
        <div className="bg-secondary p-3 rounded-md flex justify-between items-center">
          <code className="font-mono text-lg">{password}</code>
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Após fechar esta janela, a senha não poderá ser recuperada.
          Certifique-se de copiá-la ou anotá-la.
        </p>
        <DialogFooter>
          <Button onClick={() => {
            onComplete();
            onOpenChange(false);
          }}>
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
