
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { generateSecurePassword, createSecureHash } from '@/lib/passwordUtils';

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

export const useResetPassword = (setLoading: (loading: boolean) => void) => {
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const openResetPassword = (usuario: Usuario) => {
    const randomPassword = generateSecurePassword();
    setNewPassword(randomPassword);
    setResetPasswordUser(usuario);
    setResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;
    
    try {
      setLoading(true);
      
      // Create a secure hash using the PBKDF2 algorithm
      const secureHash = await createSecureHash(newPassword);
      
      const { error } = await supabase
        .from('usuarios')
        .update({ senha_hash: secureHash })
        .eq('id', resetPasswordUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Senha redefinida",
        description: `A senha do usuário "${resetPasswordUser.nome}" foi redefinida com sucesso.`,
      });
      setResetPasswordDialog(false);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: "Não foi possível redefinir a senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    setResetPasswordUser,
    newPassword,
    setNewPassword,
    openResetPassword,
    handleResetPassword
  };
};
