
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from './UserFormSchema';
import UserFormFields from './UserFormFields';
import UserFormActions from './UserFormActions';

interface UserFormProps {
  form: UseFormReturn<UsuarioFormValues>;
  onSubmit: (values: UsuarioFormValues) => void;
  setores: { id: number; nome: string }[];
  isEditing: boolean;
  loading: boolean;
  generatedPassword: string;
  onCancel: () => void;
}

const UserForm = ({ 
  form, 
  onSubmit, 
  setores, 
  isEditing, 
  loading, 
  generatedPassword,
  onCancel
}: UserFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UserFormFields 
          form={form} 
          setores={setores} 
          isEditing={isEditing} 
          generatedPassword={generatedPassword} 
        />
        <UserFormActions 
          isEditing={isEditing} 
          loading={loading} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
};

export default UserForm;
