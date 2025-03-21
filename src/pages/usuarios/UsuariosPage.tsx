
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
import { AlertCircle } from "lucide-react";

const UsuariosPage = () => {
  const [loading, setLoading] = useState(false);
  const [isGeralSector, setIsGeralSector] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Check if user is admin - only ADMIN can access this page
  const isAdmin = currentUser?.role === 'ADMIN';

  // Check if current user is from "Geral" sector
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

  // Redirect if user is not admin
  if (currentUser && !isAdmin) {
    toast({
      title: "Acesso Restrito",
      description: "Apenas administradores podem gerenciar usuários.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Various hooks for user management
  const { usuarios, setUsuarios } = useFetchUsuarios();
  const { setores } = useSetores();
  
  // Filter usuarios if the admin is not from Geral sector
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

  // Handler to check if a user can be deleted
  const canDeleteUser = (usuario: any) => {
    if (isGeralSector) return true;
    return usuario.setor?.id === currentUser?.sectorId;
  };

  // Wrapped handlers to enforce permissions
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

  // Wrapped handler for reset password
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

  // Wrapped handler for change password
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Como administrador de um setor específico, você só pode gerenciar usuários do seu próprio setor.
              </p>
            </div>
          </div>
        </div>
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
