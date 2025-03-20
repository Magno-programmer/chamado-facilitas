
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeleteDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline: any | null;
  onSuccess: () => void;
}

const DeleteDeadlineDialog = ({ 
  open, 
  onOpenChange, 
  deadline, 
  onSuccess 
}: DeleteDeadlineDialogProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!deadline) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('prazos')
        .delete()
        .eq('id', deadline.id);
      
      if (error) throw error;
      
      toast({
        title: "Prazo excluído",
        description: `O prazo "${deadline.titulo}" foi excluído com sucesso.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao excluir prazo:', error);
      toast({
        title: "Erro ao excluir prazo",
        description: "Não foi possível excluir o prazo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o prazo "{deadline?.titulo}"? 
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDeadlineDialog;
