
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateSecurePassword, hashPassword } from '@/lib/passwordUtils';
import UserForm from './dialogs/UserForm';
import { usuarioSchema, UsuarioFormValues } from './dialogs/UserFormSchema';

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
}

const CreateEditUsuarioDialog = ({ 
  open, 
  onOpenChange, 
  usuario, 
  setores, 
  onSave,
  loading
}: CreateEditUsuarioDialogProps) => {
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  
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
      
      // Set the hashed password
      const hashedPassword = hashPassword(newPassword);
      form.setValue('senha', hashedPassword);
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
          setorId: "",
          role: "CLIENT",
          senha: hashPassword(generatedPassword)
        });
      }
    }
  }, [open, usuario, form, generatedPassword]);

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
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditUsuarioDialog;
