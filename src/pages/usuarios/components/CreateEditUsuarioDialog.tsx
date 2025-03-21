
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSecurePassword } from '@/lib/passwordUtils';
import UserForm from './dialogs/UserForm';
import { usuarioSchema, UsuarioFormValues } from './dialogs/UserFormSchema';
import { User } from '@/lib/types/user.types';
import { supabase } from '@/integrations/supabase/client';

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

interface CreateEditUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  setores: { id: number; nome: string }[];
  onSave: (values: any, isEditing: boolean) => void;
  loading: boolean;
  currentUser: User | null;
}

const CreateEditUsuarioDialog = ({ 
  open, 
  onOpenChange, 
  usuario, 
  setores, 
  onSave,
  loading,
  currentUser
}: CreateEditUsuarioDialogProps) => {
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isGeralSector, setIsGeralSector] = useState<boolean>(false);
  
  // Check if editing your own profile
  const isEditingSelf = !!usuario && !!currentUser && usuario.id === currentUser.id;
  
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
  
  // Setup form for creating/editing users
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      setorId: "",
      role: "",
      senha: ""
    }
  });

  // Generate secure password when creating a new user and dialog opens
  useEffect(() => {
    if (open && !usuario) {
      const newPassword = generateSecurePassword();
      setGeneratedPassword(newPassword);
      
      // Store the plain text password to be hashed later when saving
      form.setValue('senha', newPassword);
    } else {
      setGeneratedPassword("");
    }
  }, [open, usuario, form]);

  // Reset form and set editing user when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (usuario) {
        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          setorId: String(usuario.setor?.id || ""),
          role: usuario.role,
          senha: ""
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          setorId: currentUser ? String(currentUser.sectorId) : "",
          role: "CLIENT",
          senha: generatedPassword // Plain text password will be hashed during save
        });
      }
    }
  }, [open, usuario, form, generatedPassword, currentUser]);

  const onSubmit = (values: UsuarioFormValues) => {
    onSave(values, !!usuario);
  };

  const isEditing = !!usuario;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {usuario 
              ? 'Atualize as informações do usuário abaixo.' 
              : 'Preencha as informações do novo usuário abaixo.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          form={form}
          onSubmit={onSubmit}
          setores={setores}
          isEditing={isEditing}
          loading={loading}
          generatedPassword={generatedPassword}
          onCancel={() => onOpenChange(false)}
          isEditingSelf={isEditingSelf}
          currentUser={currentUser}
          isGeralSector={isGeralSector}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditUsuarioDialog;
