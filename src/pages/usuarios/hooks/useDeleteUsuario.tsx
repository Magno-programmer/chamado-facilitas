
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  setor: {
    id: number;
    nome: string;
  };
}

export const useDeleteUsuario = (
  usuarios: Usuario[],
  setUsuarios: (usuarios: Usuario[]) => void,
  setLoading: (loading: boolean) => void
) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  const handleDeleteClick = (usuario: Usuario) => {
    setDeletingUsuario(usuario);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUsuario) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', deletingUsuario.id);
      
      if (error) throw error;
      
      setUsuarios(usuarios.filter(u => u.id !== deletingUsuario.id));
      toast({
        title: "Usuário excluído",
        description: `O usuário "${deletingUsuario.nome}" foi excluído com sucesso.`,
      });
      setDeleteDialogOpen(false);
      setDeletingUsuario(null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    setDeletingUsuario,
    handleDeleteClick,
    handleDelete
  };
};
