import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSecurePassword } from '@/lib/passwordUtils';
import UserForm from './dialogs/UserForm';
import { usuarioSchema, UsuarioFormValues } from './dialogs/UserFormSchema';
import { User } from '@/lib/types/user.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  
  // Check if current user is from "GERAL" sector
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
        setIsGeralSector(data?.nome === 'GERAL');
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
      role: "CLIENT",
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
          id: usuario.id,  // Add this to track if we're editing self
          nome: usuario.nome,
          email: usuario.email,
          setorId: String(usuario.setor?.id || "0"),
          role: usuario.role,
          senha: ""
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          setorId: "",
          role: "CLIENT",
          senha: generatedPassword
        });
      }
    } else {
      // Properly reset the form when closing to prevent lingering state
      form.reset({
        nome: "",
        email: "",
        setorId: "",
        role: "CLIENT",
        senha: ""
      });
    }
  }, [open, usuario, form, generatedPassword, currentUser]);

  // Check if user can edit this profile
  useEffect(() => {
    // If trying to edit self and user is not from GERAL sector
    if (isEditingSelf && !isGeralSector && open) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode editar seu próprio perfil. Solicite a um administrador do setor GERAL.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  }, [isEditingSelf, isGeralSector, open, onOpenChange]);

  const onSubmit = (values: UsuarioFormValues) => {
    onSave(values, !!usuario);
  };

  const isEditing = !!usuario;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Ensure form is reset when dialog is closed
      if (!isOpen) {
        form.reset({
          nome: "",
          email: "",
          setorId: "",
          role: "CLIENT",
          senha: ""
        });
      }
      onOpenChange(isOpen);
    }}>
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
          onCancel={() => {
            // Make sure form is properly reset before closing
            form.reset({
              nome: "",
              email: "",
              setorId: "",
              role: "CLIENT",
              senha: ""
            });
            onOpenChange(false);
          }}
          isEditingSelf={isEditingSelf}
          currentUser={currentUser}
          isGeralSector={isGeralSector}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditUsuarioDialog;
