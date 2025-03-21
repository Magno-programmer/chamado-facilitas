
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from './UserFormSchema';
import UserFormFields from './UserFormFields';
import UserFormActions from './UserFormActions';
import { User } from '@/lib/types/user.types';

interface UserFormProps {
  form: UseFormReturn<UsuarioFormValues>;
  onSubmit: (values: UsuarioFormValues) => void;
  setores: { id: number; nome: string }[];
  isEditing: boolean;
  loading: boolean;
  generatedPassword: string;
  onCancel: () => void;
  isEditingSelf?: boolean;
  currentUser?: User | null;
  isGeralSector?: boolean;
}

const UserForm = ({ 
  form, 
  onSubmit, 
  setores, 
  isEditing, 
  loading, 
  generatedPassword,
  onCancel,
  isEditingSelf,
  currentUser,
  isGeralSector
}: UserFormProps) => {
  // Determine if the entire form should be read-only
  const isFormReadOnly = isEditingSelf && !isGeralSector;
  
  // Handle form submission with validation
  const handleSubmit = (values: UsuarioFormValues) => {
    onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {isFormReadOnly && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Você não pode editar seu próprio perfil. Solicite a um administrador do setor Geral.
            </p>
          </div>
        )}
        
        <UserFormFields 
          form={form} 
          setores={setores} 
          isEditing={isEditing} 
          generatedPassword={generatedPassword} 
          isEditingSelf={isEditingSelf}
          currentUser={currentUser}
          isGeralSector={isGeralSector}
        />
        
        <UserFormActions 
          isEditing={isEditing} 
          loading={loading} 
          onCancel={onCancel}
          disabled={isFormReadOnly}
        />
      </form>
    </Form>
  );
};

export default UserForm;
