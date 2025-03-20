
import { useState } from 'react';
import { changeUserPassword } from '@/lib/services/authService';
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

export const useChangePassword = (setLoading: (loading: boolean) => void) => {
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState<Usuario | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const openChangePassword = (usuario: Usuario) => {
    setChangePasswordUser(usuario);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePasswordDialog(true);
  };
  
  const validatePasswords = () => {
    if (!currentPassword) {
      toast({
        title: "Campo obrigatório",
        description: "A senha atual é obrigatória.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!newPassword) {
      toast({
        title: "Campo obrigatório",
        description: "A nova senha é obrigatória.",
        variant: "destructive",
      });
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A confirmação da nova senha não confere.",
        variant: "destructive",
      });
      return false;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!changePasswordUser) return;
    
    if (!validatePasswords()) return;
    
    try {
      setLoading(true);
      
      const { success, message } = await changeUserPassword(
        changePasswordUser.id,
        currentPassword,
        newPassword
      );
      
      if (success) {
        toast({
          title: "Senha alterada",
          description: `A senha do usuário "${changePasswordUser.nome}" foi alterada com sucesso.`,
        });
        setChangePasswordDialog(false);
      } else {
        toast({
          title: "Erro ao alterar senha",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro ao alterar senha",
        description: "Ocorreu um erro ao processar a alteração de senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    openChangePassword,
    handleChangePassword
  };
};
