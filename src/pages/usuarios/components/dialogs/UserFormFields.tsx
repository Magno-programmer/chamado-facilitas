
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from './UserFormSchema';
import UserNameField from './form-fields/UserNameField';
import UserEmailField from './form-fields/UserEmailField';
import UserSectorField from './form-fields/UserSectorField';
import UserRoleField from './form-fields/UserRoleField';
import PasswordDisplay from './PasswordDisplay';

interface UserFormFieldsProps {
  form: UseFormReturn<UsuarioFormValues>;
  setores: { id: number; nome: string }[];
  isEditing: boolean;
  generatedPassword: string;
}

const UserFormFields = ({ form, setores, isEditing, generatedPassword }: UserFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <UserNameField form={form} />
      <UserEmailField form={form} />
      <UserSectorField form={form} setores={setores} />
      <UserRoleField form={form} />
      {!isEditing && (
        <PasswordDisplay password={generatedPassword} />
      )}
    </div>
  );
};

export default UserFormFields;
