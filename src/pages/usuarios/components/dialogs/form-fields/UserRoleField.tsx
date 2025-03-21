
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';
import { User } from '@/lib/types/user.types';

interface UserRoleFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
  isEditingSelf?: boolean;
  currentUser?: User | null;
  isGeralSector?: boolean;
}

const UserRoleField = ({ form, isEditingSelf, currentUser, isGeralSector }: UserRoleFieldProps) => {
  // Calculate if this field should be disabled - only in specific circumstances
  const isDisabled = isEditingSelf || (!isGeralSector && currentUser?.role !== 'ADMIN');

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Função</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value} 
            defaultValue={field.value}
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="GERENTE">Gerente</SelectItem>
              <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
              <SelectItem value="CLIENT">Usuário Comum</SelectItem>
            </SelectContent>
          </Select>
          {isEditingSelf && (
            <p className="text-sm text-muted-foreground mt-1">
              Você não pode alterar sua própria função no sistema.
            </p>
          )}
          {!isGeralSector && !isEditingSelf && currentUser?.role !== 'ADMIN' && (
            <p className="text-sm text-muted-foreground mt-1">
              Apenas administradores ou usuários do setor GERAL podem modificar funções.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserRoleField;
