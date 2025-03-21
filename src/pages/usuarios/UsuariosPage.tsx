import React, { useState, useEffect } from 'react';
import { generateSecurePassword } from '@/lib/passwordUtils';
import { useAuth } from '@/hooks/useAuth';
import { useFetchUsuarios } from './hooks/useFetchUsuarios';
import { useSetores } from './hooks/useSetores';
import { useEditCreateUsuario } from './hooks/useEditCreateUsuario';
import { useDeleteUsuario } from './hooks/useDeleteUsuario';
import { useResetPassword } from './hooks/useResetPassword';
import { useChangePassword } from './hooks/useChangePassword';
import UsuariosHeader from './components/UsuariosHeader';
import UsuariosContent from './components/UsuariosContent';
import UsuariosDialogs from './components/UsuariosDialogs';
import { Navigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UsuariosPage = () => {
  const [loading, setLoading] = useState(false);
  const [isGeralSector, setIsGeralSector] = useState(false);
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    const checkSector = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('nome')
          .eq('id', currentUser.sectorId)
          .single();
        
        if (error) throw error;
        setIsGeralSector(data?.nome === 'Geral');
      } catch (error) {
        console.error('Error checking sector:', error);
        setIsGeralSector(false);
      }
    };
    
    checkSector();
  }, [currentUser]);

  if (currentUser && !isAdmin) {
    toast({
      title: "Acesso Restrito",
      description: "Apenas administradores podem gerenciar usuários.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  const { usuarios, setUsuarios } = useFetchUsuarios();
  const { setores } = useSetores();
  
  const filteredUsuarios = !isGeralSector && currentUser 
    ? usuarios.filter(user => user.setor?.id === currentUser.sectorId)
    : usuarios;
  
  const { 
    isDialogOpen, 
    setIsDialogOpen, 
    editingUsuario, 
    handleOpenEdit, 
    handleOpenCreate, 
    handleSaveUsuario 
  } = useEditCreateUsuario(usuarios, setUsuarios, setores, setLoading);
  
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingUsuario,
    handleDeleteClick,
    handleDelete
  } = useDeleteUsuario(usuarios, setUsuarios, setLoading);
  
  const {
    resetPasswordDialog,
    setResetPasswordDialog,
    resetPasswordUser,
    newPassword,
    handleResetPasswordClick,
    handleResetPassword
  } = useResetPassword(setLoading);
  
  const {
    changePasswordDialog,
    setChangePasswordDialog,
    changePasswordUser,
    currentPassword,
    setCurrentPassword,
    newChangePassword,
    setNewChangePassword,
    confirmPassword,
    setConfirmPassword,
    handleChangePasswordClick,
    handleChangePassword
  } = useChangePassword(setLoading);

  const canDeleteUser = (usuario: any) => {
    if (isGeralSector) return true;
    return usuario.setor?.id === currentUser?.sectorId;
  };

  const wrappedHandleDeleteClick = (usuario: any) => {
    if (!canDeleteUser(usuario)) {
      toast({
        title: "Acesso negado",
        description: "Você só pode excluir usuários do seu próprio setor.",
        variant: "destructive",
      });
      return;
    }
    handleDeleteClick(usuario);
  };

  const wrappedHandleResetPasswordClick = (usuario: any) => {
    if (!isGeralSector && usuario.setor?.id !== currentUser?.sectorId) {
      toast({
        title: "Acesso negado",
        description: "Você só pode redefinir senhas de usuários do seu próprio setor.",
        variant: "destructive",
      });
      return;
    }
    handleResetPasswordClick(usuario);
  };

  const wrappedHandleChangePasswordClick = (usuario: any) => {
    if (!isGeralSector && usuario.setor?.id !== currentUser?.sectorId) {
      toast({
        title: "Acesso negado",
        description: "Você só pode alterar senhas de usuários do seu próprio setor.",
        variant: "destructive",
      });
      return;
    }
    handleChangePasswordClick(usuario);
  };

  return (
    <div className="container mx-auto py-8">
      <UsuariosHeader 
        onCreateClick={handleOpenCreate} 
        isAdmin={isAdmin} 
      />
      
      {!isGeralSector && isAdmin && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Permissões Administrativas</AlertTitle>
          <AlertDescription>
            Como administrador de um setor específico, você só pode gerenciar usuários do seu próprio setor.
          </AlertDescription>
        </Alert>
      )}
      
      <UsuariosContent 
        usuarios={filteredUsuarios} 
        loading={loading} 
        onEdit={handleOpenEdit} 
        onDelete={wrappedHandleDeleteClick} 
        onResetPassword={wrappedHandleResetPasswordClick}
        onChangePassword={wrappedHandleChangePasswordClick}
        isAdmin={isAdmin}
        currentUser={currentUser}
      />
      
      <UsuariosDialogs
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingUsuario={editingUsuario}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        deletingUsuario={deletingUsuario}
        resetPasswordDialog={resetPasswordDialog}
        setResetPasswordDialog={setResetPasswordDialog}
        resetPasswordUser={resetPasswordUser}
        newPassword={newPassword}
        changePasswordDialog={changePasswordDialog}
        setChangePasswordDialog={setChangePasswordDialog}
        changePasswordUser={changePasswordUser}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newChangePassword={newChangePassword}
        setNewChangePassword={setNewChangePassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        setores={setores}
        onSave={handleSaveUsuario}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onChangePassword={handleChangePassword}
        loading={loading}
        currentUser={currentUser}
        isGeralSector={isGeralSector}
      />
    </div>
  );
};

export default UsuariosPage;
